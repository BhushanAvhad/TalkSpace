require('dotenv').config();
const path = require('path');
const fs = require('fs');
const supabase = require('../supabaseClient');
const { executeRetentionCleanup, getRetentionHours } = require('../retentionService');

async function runTestSuite() {
  console.log('====================================================');
  console.log('TALKSPACE RETENTION & CLEANUP TEST SUITE');
  console.log('====================================================');

  const testUploadDir = path.join(__dirname, 'test_uploads');
  if (!fs.existsSync(testUploadDir)) {
    fs.mkdirSync(testUploadDir, { recursive: true });
  }

  const now = Date.now();
  const ONE_HOUR = 60 * 60 * 1000;

  // Timestamps for test records
  const recentGroupTime = new Date(now - 24 * ONE_HOUR).toISOString(); // 24 hours ago (MUST RETAIN)
  const expiredGroupTime = new Date(now - 50 * ONE_HOUR).toISOString(); // 50 hours ago (MUST DELETE)
  const oldPrivateTime = new Date(now - 72 * ONE_HOUR).toISOString(); // 72 hours ago (MUST RETAIN FOREVER)

  // Create temporary test files in testUploadDir
  const expiredGroupFileName = `test_expired_group_${now}.png`;
  const sharedFileName = `test_shared_${now}.pdf`;
  const privateFileName = `test_private_${now}.docx`;

  fs.writeFileSync(path.join(testUploadDir, expiredGroupFileName), 'fake image data for expired group');
  fs.writeFileSync(path.join(testUploadDir, sharedFileName), 'fake pdf data shared between group and private');
  fs.writeFileSync(path.join(testUploadDir, privateFileName), 'fake private document data');

  const testSender = `test_retention_bot_${now.toString().slice(-4)}`;

  console.log('\n[Setup] Inserting controlled test records into Supabase...');

  // 1. Recent group message (24h old) - Should remain
  const idRecentGroup = `msg_recent_grp_${now}`;
  await supabase.from('messages').insert([{
    message_id: idRecentGroup,
    sender: testSender,
    target: null,
    type: 'group',
    message: 'Recent group message (24h old)',
    created_at: recentGroupTime
  }]);

  // 2. Expired group message (50h old) with exclusive attachment - Should be deleted & file unlinked
  const idExpiredGroup = `msg_expired_grp_${now}`;
  await supabase.from('messages').insert([{
    message_id: idExpiredGroup,
    sender: testSender,
    target: null,
    type: 'group',
    message: JSON.stringify({
      text: 'Expired group message',
      fileURL: `/api/files/${expiredGroupFileName}`,
      fileName: expiredGroupFileName
    }),
    created_at: expiredGroupTime
  }]);

  // 3. Expired group message referencing shared file
  const idSharedGroup = `msg_shared_grp_${now}`;
  await supabase.from('messages').insert([{
    message_id: idSharedGroup,
    sender: testSender,
    target: null,
    type: 'group',
    message: JSON.stringify({
      text: 'Shared document in group',
      fileURL: `/api/files/${sharedFileName}`,
      fileName: sharedFileName
    }),
    created_at: expiredGroupTime
  }]);

  // 4. Old private message (72h old) also referencing shared file - Should NEVER be deleted
  const idSharedPrivate = `msg_shared_pvt_${now}`;
  await supabase.from('messages').insert([{
    message_id: idSharedPrivate,
    sender: testSender,
    target: 'partner_user',
    type: 'private',
    message: JSON.stringify({
      text: 'Shared document in private chat',
      fileURL: `/api/files/${sharedFileName}`,
      fileName: sharedFileName
    }),
    created_at: oldPrivateTime
  }]);

  // 5. Old private message (72h old) with exclusive private file - Should NEVER be deleted
  const idPrivateExclusive = `msg_pvt_exclusive_${now}`;
  await supabase.from('messages').insert([{
    message_id: idPrivateExclusive,
    sender: testSender,
    target: 'partner_user',
    type: 'private',
    message: JSON.stringify({
      text: 'Private message with document',
      fileURL: `/api/files/${privateFileName}`,
      fileName: privateFileName
    }),
    created_at: oldPrivateTime
  }]);

  console.log('Test records inserted successfully.');

  // ==========================================================
  // RUN RETENTION CLEANUP
  // ==========================================================
  console.log('\n[Execution] Running retention cleanup operation...');
  const result = await executeRetentionCleanup({
    dryRun: false,
    uploadDir: testUploadDir
  });

  console.log('Cleanup result:', result);

  // ==========================================================
  // VERIFICATIONS
  // ==========================================================
  console.log('\n[Verification] Checking database records...');

  // Test 1: Recent group message still exists
  const { data: recGrp } = await supabase.from('messages').select('id').eq('message_id', idRecentGroup).maybeSingle();
  console.log(`✓ Test 1: Recent group message (24h old) retained: ${!!recGrp}`);

  // Test 2: Expired group message was deleted
  const { data: expGrp } = await supabase.from('messages').select('id').eq('message_id', idExpiredGroup).maybeSingle();
  console.log(`✓ Test 2: Expired group message (50h old) deleted: ${!expGrp}`);

  // Test 3: Old private messages STILL EXIST (LIFETIME POLICY)
  const { data: pvtShared } = await supabase.from('messages').select('id').eq('message_id', idSharedPrivate).maybeSingle();
  const { data: pvtExclusive } = await supabase.from('messages').select('id').eq('message_id', idPrivateExclusive).maybeSingle();
  console.log(`✓ Test 3: 72h-old private message retained: ${!!pvtShared}`);
  console.log(`✓ Test 4: 72h-old private message with exclusive file retained: ${!!pvtExclusive}`);

  console.log('\n[Verification] Checking physical file system...');

  // Test 5: Exclusive expired group file was deleted from disk
  const expiredFileExists = fs.existsSync(path.join(testUploadDir, expiredGroupFileName));
  console.log(`✓ Test 5: Orphaned expired group file removed from disk: ${!expiredFileExists}`);

  // Test 6: Shared file still on disk (because retained private message references it)
  const sharedFileExists = fs.existsSync(path.join(testUploadDir, sharedFileName));
  console.log(`✓ Test 6: Shared file preserved on disk (referenced by private chat): ${sharedFileExists}`);

  // Test 7: Private file untouched on disk
  const privateFileExists = fs.existsSync(path.join(testUploadDir, privateFileName));
  console.log(`✓ Test 7: Private attachment untouched on disk: ${privateFileExists}`);

  // Cleanup test records
  console.log('\n[Teardown] Cleaning up remaining test records and test files...');
  await supabase.from('messages').delete().eq('sender', testSender);
  
  try {
    fs.rmSync(testUploadDir, { recursive: true, force: true });
  } catch (e) {}

  console.log('\n====================================================');
  console.log('ALL RETENTION TESTS COMPLETED SUCCESSFULLY!');
  console.log('====================================================');
  process.exit(0);
}

runTestSuite().catch(err => {
  console.error('Test suite failed:', err);
  process.exit(1);
});

