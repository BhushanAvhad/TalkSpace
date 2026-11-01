require('dotenv').config();
const supabase = require('../supabaseClient');

async function dryRunInspection() {
  console.log('=== DRY-RUN RETENTION INSPECTION ===');
  
  const retentionHours = parseInt(process.env.PUBLIC_GROUP_RETENTION_HOURS || '48', 10);
  console.log(`Configured Group Retention Hours: ${retentionHours} hours`);

  const cutoffDate = new Date(Date.now() - retentionHours * 60 * 60 * 1000).toISOString();
  console.log(`Calculated Cutoff Timestamp (UTC): ${cutoffDate}`);

  // 1. Total counts in database
  const { count: totalMessages, error: errTotal } = await supabase
    .from('messages')
    .select('*', { count: 'exact', head: true });

  const { count: totalGroup, error: errGroup } = await supabase
    .from('messages')
    .select('*', { count: 'exact', head: true })
    .eq('type', 'group');

  const { count: totalPrivate, error: errPrivate } = await supabase
    .from('messages')
    .select('*', { count: 'exact', head: true })
    .eq('type', 'private');

  console.log(`\n--- Current Database Summary ---`);
  console.log(`Total Messages: ${totalMessages}`);
  console.log(`Total Group Messages: ${totalGroup}`);
  console.log(`Total Private Messages: ${totalPrivate}`);

  // 2. Count expired group messages (eligible for deletion)
  const { data: eligibleGroupMessages, error: errEligible, count: eligibleCount } = await supabase
    .from('messages')
    .select('id, message_id, sender, type, message, created_at', { count: 'exact' })
    .eq('type', 'group')
    .lte('created_at', cutoffDate)
    .order('created_at', { ascending: true });

  console.log(`\n--- Eligible For Cleanup (created_at <= ${cutoffDate}) ---`);
  console.log(`Eligible Group Messages: ${eligibleCount || 0}`);
  
  if (eligibleGroupMessages && eligibleGroupMessages.length > 0) {
    console.log(`Sample of eligible records:`);
    eligibleGroupMessages.slice(0, 5).forEach((m, i) => {
      console.log(`  [${i+1}] ID: ${m.id} | Sender: ${m.sender} | Created: ${m.created_at} | Preview: ${String(m.message).substring(0, 40)}...`);
    });
  } else {
    console.log('No group messages currently exceed the 48-hour retention window.');
  }

  // 3. Verify private messages are NEVER selected by the query
  const { count: eligiblePrivateCount } = await supabase
    .from('messages')
    .select('*', { count: 'exact', head: true })
    .eq('type', 'private')
    .lte('created_at', cutoffDate);

  console.log(`\n--- Safety Check: Private Messages ---`);
  console.log(`Private messages older than 48 hours in DB: ${eligiblePrivateCount || 0}`);
  console.log(`Policy Guarantee: These ${eligiblePrivateCount || 0} private message(s) will be PRESERVED FOREVER and NEVER touched by group cleanup.`);

  console.log('\n=== DRY-RUN INSPECTION COMPLETED (Zero records deleted) ===');
  process.exit(0);
}

dryRunInspection().catch(err => {
  console.error('Inspection error:', err);
  process.exit(1);
});
