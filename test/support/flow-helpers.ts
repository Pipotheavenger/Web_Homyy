/**
 * Helper functions for functional E2E flow tests
 * Uses Supabase service role for admin operations (cleanup, data seeding, etc.)
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

let adminClient: SupabaseClient | null = null;

/**
 * Get or create a Supabase admin client with service role key
 */
export function getSupabaseAdminClient(): SupabaseClient {
  if (adminClient) return adminClient;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      'Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables'
    );
  }

  adminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  return adminClient;
}

/**
 * Get the user ID for a test user by email
 */
export async function getUserIdByEmail(email: string): Promise<string | null> {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from('user_profiles')
    .select('user_id')
    .eq('email', email)
    .single();

  if (error || !data) return null;
  return data.user_id;
}

/**
 * Add test balance (recarga) for a user
 */
export async function addTestBalance(
  userId: string,
  amount: number
): Promise<{ id: string } | null> {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from('transactions')
    .insert({
      user_id: userId,
      type: 'recarga',
      amount,
      status: 'completado',
      description: '[E2E Test] Balance de prueba',
    })
    .select('id')
    .single();

  if (error) {
    console.error('Error adding test balance:', error);
    return null;
  }
  return data;
}

/**
 * Get the most recently created service by a user
 */
export async function getLastServiceByUser(
  userId: string
): Promise<{ id: string; title: string; status: string } | null> {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from('services')
    .select('id, title, status')
    .eq('user_id', userId)
    .neq('status', 'deleted')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error || !data) return null;
  return data;
}

/**
 * Get the completion PIN for a service from the services table
 */
export async function getCompletionPin(
  serviceId: string
): Promise<string | null> {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from('services')
    .select('completion_pin')
    .eq('id', serviceId)
    .single();

  if (error || !data) return null;
  return data.completion_pin;
}

/**
 * Get the booking for a service
 */
export async function getBookingByService(
  serviceId: string
): Promise<{ id: string; status: string } | null> {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from('bookings')
    .select('id, status')
    .eq('service_id', serviceId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error || !data) return null;
  return data;
}

/**
 * Clean up all data related to a test service (cascade delete)
 */
export async function cleanupTestService(serviceId: string): Promise<boolean> {
  const supabase = getSupabaseAdminClient();

  try {
    // 1. Get booking IDs for this service
    const { data: bookings } = await supabase
      .from('bookings')
      .select('id')
      .eq('service_id', serviceId);

    const bookingIds = (bookings || []).map((b) => b.id);

    // 2. Delete chat messages and chats for these bookings
    if (bookingIds.length > 0) {
      const { data: chats } = await supabase
        .from('chats')
        .select('id')
        .in('booking_id', bookingIds);

      const chatIds = (chats || []).map((c) => c.id);

      if (chatIds.length > 0) {
        await supabase.from('chat_messages').delete().in('chat_id', chatIds);
        await supabase.from('chats').delete().in('booking_id', bookingIds);
      }

      // 3. Delete bookings
      await supabase.from('bookings').delete().eq('service_id', serviceId);
    }

    // 4. Delete escrow transactions
    await supabase
      .from('escrow_transactions')
      .delete()
      .eq('service_id', serviceId);

    // 5. Delete applications
    await supabase
      .from('applications')
      .delete()
      .eq('service_id', serviceId);

    // 6. Delete service schedules
    await supabase
      .from('service_schedules')
      .delete()
      .eq('service_id', serviceId);

    // 7. Delete the service itself
    await supabase.from('services').delete().eq('id', serviceId);

    return true;
  } catch (error) {
    console.error('Error cleaning up test service:', error);
    return false;
  }
}

/**
 * Clean up test balance transactions
 */
export async function cleanupTestBalance(userId: string): Promise<boolean> {
  const supabase = getSupabaseAdminClient();

  try {
    await supabase
      .from('transactions')
      .delete()
      .eq('user_id', userId)
      .eq('description', '[E2E Test] Balance de prueba');

    return true;
  } catch (error) {
    console.error('Error cleaning up test balance:', error);
    return false;
  }
}

/**
 * Delete a test user by email (removes auth user + profiles)
 */
export async function deleteTestUser(email: string): Promise<boolean> {
  const supabase = getSupabaseAdminClient();

  try {
    // Find the user by email in user_profiles
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('user_id')
      .eq('email', email)
      .single();

    if (!profile) return true; // User doesn't exist, nothing to delete

    const userId = profile.user_id;

    // Delete worker_profile if exists
    await supabase.from('worker_profiles').delete().eq('user_id', userId);

    // Delete user_profile
    await supabase.from('user_profiles').delete().eq('user_id', userId);

    // Delete auth user
    const { error: authError } = await supabase.auth.admin.deleteUser(userId);
    if (authError) {
      console.error('Error deleting auth user:', authError);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error deleting test user:', error);
    return false;
  }
}
