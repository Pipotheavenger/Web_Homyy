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
 * Add test balance (recarga) for a user.
 * Updates both the transactions table (frontend balance check) and
 * user_profiles.balance (RPC balance check) to ensure consistency.
 */
export async function addTestBalance(
  userId: string,
  amount: number
): Promise<{ id: string } | null> {
  const supabase = getSupabaseAdminClient();

  // Clean up ALL old transactions for this user first to prevent accumulated
  // debt from previous test runs (debits from escrow RPCs aren't cleaned by
  // cleanupTestBalance, which only removes recargas).
  await supabase
    .from('transactions')
    .delete()
    .eq('user_id', userId)
    .in('type', ['debito', 'recarga', 'retiro'])
    .like('description', '%[E2E Test]%');

  // Also clean up escrow-created debit transactions from previous test runs
  await supabase
    .from('transactions')
    .delete()
    .eq('user_id', userId)
    .eq('type', 'debito')
    .like('description', '%[e2e Test]%');

  // Insert a transaction record (used by frontend balance calculation)
  const { data, error } = await supabase
    .from('transactions')
    .insert({
      user_id: userId,
      type: 'recarga',
      amount,
      status: 'completado',
      payment_method: 'nequi',
      description: '[E2E Test] Balance de prueba',
    })
    .select('id')
    .single();

  if (error) {
    console.error('Error adding test balance:', error);
    return null;
  }

  // Also set user_profiles.balance directly (used by the escrow RPC function)
  await supabase
    .from('user_profiles')
    .update({ balance: amount })
    .eq('user_id', userId);

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
  // The PIN is stored in escrow_transactions, not in services
  const { data, error } = await supabase
    .from('escrow_transactions')
    .select('completion_pin')
    .eq('service_id', serviceId)
    .order('created_at', { ascending: false })
    .limit(1)
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
 * Ensure a chat exists for a booking. Creates one if it doesn't exist.
 * The hiring flow's chat creation can silently fail due to race conditions,
 * so this guarantees a chat is available for the E2E chat exchange test.
 */
export async function ensureTestChat(
  serviceId: string,
  clientId: string,
  workerId: string
): Promise<{ id: string } | null> {
  const supabase = getSupabaseAdminClient();

  // Get the booking for this service
  const booking = await getBookingByService(serviceId);
  if (!booking) {
    console.error('No booking found for service:', serviceId);
    return null;
  }

  // Check if a chat already exists
  const { data: existingChat } = await supabase
    .from('chats')
    .select('id')
    .eq('booking_id', booking.id)
    .single();

  if (existingChat) return existingChat;

  // Create the chat
  const { data: newChat, error } = await supabase
    .from('chats')
    .insert({
      booking_id: booking.id,
      client_id: clientId,
      worker_id: workerId,
    })
    .select('id')
    .single();

  if (error) {
    console.error('Error creating test chat:', error);
    return null;
  }
  return newChat;
}

/**
 * Get applications for a service (admin query — bypasses RLS)
 */
export async function getApplicationsForService(
  serviceId: string
): Promise<{ id: string; worker_id: string; status: string; proposed_price: number }[]> {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from('applications')
    .select('id, worker_id, status, proposed_price')
    .eq('service_id', serviceId);

  if (error) {
    console.error('Error fetching applications:', error);
    return [];
  }
  return data || [];
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
 * Get the most recent pending transaction for a user
 */
export async function getLatestPendingTransaction(
  userId: string
): Promise<{ id: string; amount: number; type: string; description: string } | null> {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from('transactions')
    .select('id, amount, type, description')
    .eq('user_id', userId)
    .eq('status', 'pendiente')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error || !data) return null;
  return data;
}

/**
 * Approve a pending transaction and recalculate the user's balance.
 * Updates both the transaction status AND user_profiles.balance
 * to keep the dual balance system in sync.
 */
export async function approveTransaction(transactionId: string): Promise<void> {
  const supabase = getSupabaseAdminClient();

  // Update transaction status
  const { data: txn, error } = await supabase
    .from('transactions')
    .update({ status: 'completado' })
    .eq('id', transactionId)
    .select('user_id, amount, type')
    .single();

  if (error || !txn) {
    throw new Error(
      `Failed to approve transaction ${transactionId}: ${error?.message}`
    );
  }

  // Recalculate total balance from all completed transactions
  const { data: allTxns, error: queryError } = await supabase
    .from('transactions')
    .select('type, amount')
    .eq('user_id', txn.user_id)
    .eq('status', 'completado');

  if (queryError || !allTxns) {
    throw new Error(`Failed to query transactions: ${queryError?.message}`);
  }

  let balance = 0;
  for (const t of allTxns) {
    if (t.type === 'recarga') {
      balance += Number(t.amount);
    } else {
      balance -= Number(t.amount);
    }
  }

  // Update user_profiles.balance (used by RPC)
  await supabase
    .from('user_profiles')
    .update({ balance })
    .eq('user_id', txn.user_id);
}

/**
 * Clean up test transactions and reset balance to zero.
 */
export async function cleanupTestTransactions(
  userId: string
): Promise<void> {
  const supabase = getSupabaseAdminClient();

  // Delete recharge transactions from UI
  await supabase
    .from('transactions')
    .delete()
    .eq('user_id', userId)
    .like('description', '%Recarga%');

  // Delete E2E Loop transactions
  await supabase
    .from('transactions')
    .delete()
    .eq('user_id', userId)
    .like('description', '%[E2E Loop]%');

  // Delete E2E Test balance transactions (from addTestBalance)
  await supabase
    .from('transactions')
    .delete()
    .eq('user_id', userId)
    .like('description', '%[E2E Test]%');

  // Clean escrow debits from previous test runs
  await supabase
    .from('transactions')
    .delete()
    .eq('user_id', userId)
    .like('description', '%[e2e Test]%');

  // Reset balance
  await supabase
    .from('user_profiles')
    .update({ balance: 0 })
    .eq('user_id', userId);
}

/**
 * Delete a test user by email (removes auth user + profiles)
 */
// ── Stress test: user creation helpers ──────────────────────────────

const STRESS_PASSWORD = 'StressTest123!';

/**
 * Create a test client user via Supabase admin API.
 * Uses RPCs to match the real registration flow.
 */
export async function createTestClient(
  index: number
): Promise<{ email: string; password: string; userId: string }> {
  const supabase = getSupabaseAdminClient();
  const email = `e2e.stress.client${index}@hommy.test`;
  const password = STRESS_PASSWORD;

  // Create auth user (auto-confirm email)
  const { data: authData, error: authError } =
    await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

  if (authError || !authData.user) {
    throw new Error(
      `Failed to create client ${index}: ${authError?.message}`
    );
  }

  const userId = authData.user.id;

  // Create user profile via RPC (same as registration API)
  const { error: profileError } = await supabase.rpc('create_user_profile', {
    p_user_id: userId,
    p_email: email,
    p_name: `E2E Cliente ${index}`,
    p_user_type: 'user',
    p_phone: `+57 300 000 00${10 + index}`,
    p_birth_date: '1990-01-15',
  });

  if (profileError) {
    // Rollback auth user on failure
    await supabase.auth.admin.deleteUser(userId);
    throw new Error(
      `Failed to create profile for client ${index}: ${profileError.message}`
    );
  }

  return { email, password, userId };
}

/**
 * Create a test worker user via Supabase admin API.
 * Creates both user_profile and worker_profile via RPCs.
 */
export async function createTestWorker(
  index: number
): Promise<{ email: string; password: string; userId: string }> {
  const supabase = getSupabaseAdminClient();
  const email = `e2e.stress.worker${index}@hommy.test`;
  const password = STRESS_PASSWORD;

  // Create auth user (auto-confirm email)
  const { data: authData, error: authError } =
    await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

  if (authError || !authData.user) {
    throw new Error(
      `Failed to create worker ${index}: ${authError?.message}`
    );
  }

  const userId = authData.user.id;

  // Create user profile
  const { error: profileError } = await supabase.rpc('create_user_profile', {
    p_user_id: userId,
    p_email: email,
    p_name: `E2E Worker ${index}`,
    p_user_type: 'worker',
    p_phone: `+57 310 000 00${10 + index}`,
    p_birth_date: '1988-06-20',
  });

  if (profileError) {
    await supabase.auth.admin.deleteUser(userId);
    throw new Error(
      `Failed to create profile for worker ${index}: ${profileError.message}`
    );
  }

  // Create worker profile
  const { error: workerError } = await supabase.rpc('create_worker_profile', {
    p_user_id: userId,
    p_profession: 'Limpieza general',
    p_experience_years: 3,
    p_bio: `Trabajador E2E ${index} con experiencia en limpieza profesional.`,
    p_profile_description: `Trabajador E2E ${index} con experiencia en limpieza profesional.`,
    p_categories: ['Limpieza'],
    p_certifications: [],
  });

  if (workerError) {
    await supabase.from('user_profiles').delete().eq('user_id', userId);
    await supabase.auth.admin.deleteUser(userId);
    throw new Error(
      `Failed to create worker profile for ${index}: ${workerError.message}`
    );
  }

  return { email, password, userId };
}

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
