/**
 * Stress Test Setup - Phase 1
 *
 * Creates 100 test users (50 clients + 50 workers), 50 services,
 * 50 schedules, and 50 applications via Supabase admin API.
 *
 * Writes manifest.json for k6 to consume.
 *
 * Usage: npx tsx test/stress/setup.ts
 */

import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

// Load env from project root
dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import {
  getSupabaseAdminClient,
  createTestClient,
  createTestWorker,
  deleteTestUser,
  cleanupTestService,
  cleanupTestTransactions,
} from '../support/flow-helpers';

import {
  PAIRS,
  clientEmail,
  workerEmail,
  PROPOSED_PRICE,
  MANIFEST_PATH,
  SERVICE_TEMPLATE,
  SCHEDULE_TEMPLATE,
} from './config';

interface PairData {
  index: number;
  client: { email: string; password: string; userId: string };
  worker: { email: string; password: string; userId: string };
  serviceId: string;
  applicationId: string;
  proposedPrice: number;
}

interface Manifest {
  supabaseUrl: string;
  supabaseAnonKey: string;
  supabaseServiceRoleKey: string;
  pairs: PairData[];
}

async function getCategoryId(): Promise<string> {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from('categories')
    .select('id')
    .ilike('name', '%limpieza%')
    .limit(1)
    .single();

  if (error || !data) {
    // Fallback: get first available category
    const { data: fallback } = await supabase
      .from('categories')
      .select('id')
      .limit(1)
      .single();

    if (!fallback) throw new Error('No categories found in database');
    return fallback.id;
  }

  return data.id;
}

async function cleanupResidualUsers(): Promise<void> {
  console.log('🧹 Cleaning up residual stress test data...');
  const supabase = getSupabaseAdminClient();

  // Find existing stress test services
  const { data: services } = await supabase
    .from('services')
    .select('id')
    .like('title', '%[Stress Test]%');

  if (services?.length) {
    console.log(`  Found ${services.length} residual services, cleaning...`);
    for (const svc of services) {
      await cleanupTestService(svc.id);
    }
  }

  // Find and clean up residual users
  for (let i = 1; i <= PAIRS; i++) {
    const cEmail = clientEmail(i);
    const wEmail = workerEmail(i);

    // Clean transactions before deleting user
    const { data: cProfile } = await supabase
      .from('user_profiles')
      .select('user_id')
      .eq('email', cEmail)
      .single();
    if (cProfile) {
      await cleanupTestTransactions(cProfile.user_id);
    }

    const { data: wProfile } = await supabase
      .from('user_profiles')
      .select('user_id')
      .eq('email', wEmail)
      .single();
    if (wProfile) {
      await cleanupTestTransactions(wProfile.user_id);
    }

    await deleteTestUser(cEmail);
    await deleteTestUser(wEmail);
  }

  console.log('  Cleanup complete.');
}

async function main(): Promise<void> {
  console.log(`\n=== STRESS TEST SETUP: ${PAIRS} pairs (${PAIRS * 2} users) ===\n`);

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !anonKey || !serviceRoleKey) {
    throw new Error('Missing environment variables. Check .env.local');
  }

  const supabase = getSupabaseAdminClient();

  // Step 0: Clean up any residual data from previous runs
  await cleanupResidualUsers();

  // Step 1: Get category ID
  const categoryId = await getCategoryId();
  console.log(`📂 Using category ID: ${categoryId}`);

  const pairs: PairData[] = [];

  for (let i = 1; i <= PAIRS; i++) {
    const progress = `[${i}/${PAIRS}]`;

    // Step 2: Create client
    console.log(`${progress} Creating client...`);
    const client = await createTestClient(i);

    // Step 3: Create worker
    console.log(`${progress} Creating worker...`);
    const worker = await createTestWorker(i);

    // Step 4: Create service (direct insert, no notifications)
    const { data: service, error: svcError } = await supabase
      .from('services')
      .insert({
        user_id: client.userId,
        title: `${SERVICE_TEMPLATE.title} #${i}`,
        description: SERVICE_TEMPLATE.description,
        category_id: categoryId,
        location: SERVICE_TEMPLATE.location,
        status: SERVICE_TEMPLATE.status,
        images: SERVICE_TEMPLATE.images,
      })
      .select('id')
      .single();

    if (svcError || !service) {
      throw new Error(`${progress} Failed to create service: ${svcError?.message}`);
    }
    console.log(`${progress} Service created: ${service.id}`);

    // Step 5: Create schedule
    const { error: schedError } = await supabase
      .from('service_schedules')
      .insert({
        service_id: service.id,
        ...SCHEDULE_TEMPLATE,
      });

    if (schedError) {
      console.warn(`${progress} Schedule warning: ${schedError.message}`);
    }

    // Step 6: Create application (worker applies to service)
    const { data: application, error: appError } = await supabase
      .from('applications')
      .insert({
        service_id: service.id,
        worker_id: worker.userId,
        status: 'pending',
        proposed_price: PROPOSED_PRICE,
        cover_letter: `[Stress Test] Application from worker ${i}`,
      })
      .select('id')
      .single();

    if (appError || !application) {
      throw new Error(`${progress} Failed to create application: ${appError?.message}`);
    }
    console.log(`${progress} Application created: ${application.id}`);

    pairs.push({
      index: i,
      client,
      worker,
      serviceId: service.id,
      applicationId: application.id,
      proposedPrice: PROPOSED_PRICE,
    });
  }

  // Step 7: Write manifest
  const manifest: Manifest = {
    supabaseUrl,
    supabaseAnonKey: anonKey,
    supabaseServiceRoleKey: serviceRoleKey,
    pairs,
  };

  const manifestDir = path.dirname(path.resolve(__dirname, '../../', MANIFEST_PATH));
  fs.mkdirSync(manifestDir, { recursive: true });
  fs.writeFileSync(
    path.resolve(__dirname, '../../', MANIFEST_PATH),
    JSON.stringify(manifest, null, 2)
  );

  console.log(`\n✅ Setup complete!`);
  console.log(`   ${pairs.length} pairs created`);
  console.log(`   Manifest written to ${MANIFEST_PATH}`);
  console.log(`   Ready for: npm run stress:run\n`);
}

main().catch((err) => {
  console.error('\n❌ Setup failed:', err.message);
  process.exit(1);
});
