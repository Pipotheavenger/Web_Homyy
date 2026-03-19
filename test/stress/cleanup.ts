/**
 * Stress Test Cleanup - Phase 3
 *
 * Reads manifest.json and deletes all test data:
 * services (cascade), transactions, and auth users.
 *
 * Usage: npx tsx test/stress/cleanup.ts
 */

import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

// Load env from project root
dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import {
  cleanupTestService,
  cleanupTestTransactions,
  deleteTestUser,
} from '../support/flow-helpers';

import { MANIFEST_PATH } from './config';

async function main(): Promise<void> {
  const manifestAbsPath = path.resolve(__dirname, '../../', MANIFEST_PATH);

  if (!fs.existsSync(manifestAbsPath)) {
    console.log('No manifest.json found. Nothing to clean up.');
    return;
  }

  const manifest = JSON.parse(fs.readFileSync(manifestAbsPath, 'utf-8'));
  const pairs = manifest.pairs;

  console.log(`\n=== STRESS TEST CLEANUP: ${pairs.length} pairs ===\n`);

  let successCount = 0;
  let errorCount = 0;

  for (const pair of pairs) {
    const progress = `[${pair.index}/${pairs.length}]`;

    try {
      // 1. Delete service and all related data (cascade)
      console.log(`${progress} Cleaning service ${pair.serviceId}...`);
      await cleanupTestService(pair.serviceId);

      // 2. Delete transactions + reset balance for both users
      console.log(`${progress} Cleaning transactions...`);
      await cleanupTestTransactions(pair.client.userId);
      await cleanupTestTransactions(pair.worker.userId);

      // 3. Delete auth users + profiles
      console.log(`${progress} Deleting users...`);
      await deleteTestUser(pair.client.email);
      await deleteTestUser(pair.worker.email);

      successCount++;
    } catch (err: any) {
      console.error(`${progress} Error cleaning pair: ${err.message}`);
      errorCount++;
    }
  }

  // Delete manifest file
  fs.unlinkSync(manifestAbsPath);

  console.log(`\n✅ Cleanup complete!`);
  console.log(`   Success: ${successCount}/${pairs.length}`);
  if (errorCount > 0) {
    console.log(`   Errors: ${errorCount}`);
  }
  console.log(`   Manifest deleted.\n`);
}

main().catch((err) => {
  console.error('\n❌ Cleanup failed:', err.message);
  process.exit(1);
});
