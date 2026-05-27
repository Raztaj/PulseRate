const { createClient } = require('@supabase/supabase-js');
const { randomBytes } = require('crypto');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY,
  { realtime: { transport: class { constructor(){} connect(){} close(){} } } }
);

let passed = 0;
let failed = 0;
const id = randomBytes(3).toString('hex');

function assert(condition, msg) {
  if (condition) { passed++; console.log('  ✅', msg); }
  else { failed++; console.error('  ❌', msg); }
}

async function testAddStaff() {
  console.log('\n📋 Test: Adding a new staff member');

  const { data: org } = await supabase.from('organizations').select('id').limit(1).single();
  assert(!!org, 'Organization exists');

  const uniqueName = `أحمد ${id}`;
  const { data: staff, error: e1 } = await supabase.from('staff').insert({
    organization_id: org.id, name: uniqueName, department: 'تقنية', position: 'مطور'
  }).select('id, name').single();
  assert(!e1, `Staff created: "${staff.name}"`);

  const title = `نموذج ${uniqueName}`;
  const { data: form, error: e2 } = await supabase.from('forms').insert({
    organization_id: org.id, title, is_active: true
  }).select('id, title').single();
  assert(!e2 && form.title === title, `Form created: "${form.title}"`);

  const qs = [
    { form_id: form.id, question_text: 'كيف كانت جودة الخدمة؟', question_type: 'star_rating', is_required: true, order_index: 0 },
    { form_id: form.id, question_text: 'كيف كانت الاحترافية؟', question_type: 'star_rating', is_required: true, order_index: 1 },
    { form_id: form.id, question_text: 'تعليقات إضافية', question_type: 'text', is_required: false, order_index: 2 },
  ];
  const { data: questions, error: e3 } = await supabase.from('questions').insert(qs).select();
  assert(!e3 && questions.length === 3, `3 questions created`);

  const { data: found, error: e4 } = await supabase.from('forms').select('id').eq('organization_id', org.id).eq('title', title).maybeSingle();
  assert(!!found, `Form found by title lookup`);

  return { staff, form, questions, uniqueName };
}

async function testEditForm({ form }) {
  console.log('\n📋 Test: Editing a staff form');

  const { data: before } = await supabase.from('questions').select('id, question_text, question_type, is_required, order_index').eq('form_id', form.id).order('order_index');
  assert(before.length === 3, `Starting with ${before.length} questions`);

  // Add a question
  const { data: added } = await supabase.from('questions').insert({
    form_id: form.id, question_text: 'سرعة الخدمة', question_type: 'star_rating', is_required: true, order_index: 3
  }).select().single();
  assert(added.question_text === 'سرعة الخدمة', 'Added question');

  // Update question text
  const { error: u1 } = await supabase.from('questions').update({ question_text: 'جودة الخدمة (معدل)' }).eq('id', before[0].id);
  assert(!u1, 'Updated question text');

  // Toggle required
  const { error: u2 } = await supabase.from('questions').update({ is_required: false }).eq('id', before[1].id);
  assert(!u2, 'Toggled required flag');

  // Change type
  const { error: u3 } = await supabase.from('questions').update({ question_type: 'text' }).eq('id', before[2].id);
  assert(!u3, 'Changed question type');

  // Delete added question
  const { error: d1 } = await supabase.from('questions').delete().eq('id', added.id);
  assert(!d1, 'Deleted added question');

  // Verify final state
  const { data: after } = await supabase.from('questions').select('id, question_text, question_type, is_required, order_index').eq('form_id', form.id).order('order_index');
  assert(after.length === 3, `Ended with ${after.length} questions`);
  assert(after[0].question_text.includes('معدل'), 'Question text updated');
  assert(after[1].is_required === false, 'Question is now optional');
}

async function testRatingSubmission({ staff, form }) {
  console.log('\n📋 Test: Submit a rating');

  const { data: questions } = await supabase.from('questions').select('id').eq('form_id', form.id).order('order_index');

  const { data: sub, error: e1 } = await supabase.from('submissions').insert({ staff_id: staff.id, form_id: form.id }).select().single();
  assert(!e1, 'Submission created');

  const answers = [
    { submission_id: sub.id, question_id: questions[0].id, rating_value: 5 },
    { submission_id: sub.id, question_id: questions[1].id, rating_value: 4 },
    { submission_id: sub.id, question_id: questions[2].id, text_answer: 'خدمة ممتازة' },
  ];
  const { data: ans, error: e2 } = await supabase.from('answers').insert(answers).select();
  assert(!e2 && ans.length === 3, '3 answers submitted');

  const ratings = ans.filter(a => a.rating_value !== null).map(a => a.rating_value);
  const avg = ratings.reduce((s, v) => s + v, 0) / ratings.length;
  assert(avg === 4.5, `Average rating: ${avg}`);
}

async function testEdgeCases({ orgId }) {
  console.log('\n📋 Test: Edge cases');

  // Delete all questions, form should still exist
  const { data: form } = await supabase.from('forms').insert({
    organization_id: orgId, title: 'نموذج اختبار الحواف', is_active: true
  }).select().single();
  await supabase.from('questions').insert({ form_id: form.id, question_text: 'سؤال مؤقت', question_type: 'star_rating', is_required: true, order_index: 0 });

  const { error: dAll } = await supabase.from('questions').delete().eq('form_id', form.id);
  assert(!dAll, 'Deleted all questions');

  const { data: f2 } = await supabase.from('forms').select('id').eq('id', form.id).single();
  assert(!!f2, 'Form still exists after deleting all questions');

  // Long question text
  const longText = 'هذا سؤال طويل جداً'.repeat(20);
  const { data: longQ, error: lErr } = await supabase.from('questions').insert({
    form_id: form.id, question_text: longText, question_type: 'text', is_required: false, order_index: 0
  }).select().single();
  assert(!lErr && longQ.question_text.length >= 100, `Long question (${longQ.question_text.length} chars) OK`);

  // Duplicate staff name
  const { data: dupStaff, error: dupErr } = await supabase.from('staff').insert({
    organization_id: orgId, name: 'اسم مكرر', department: 'اختبار', position: 'موظف'
  }).select('id').single();
  assert(!dupErr, 'Duplicate staff name OK');
}

async function main() {
  console.log('🔍 E2E Integration Tests for PulseRate (خاتون)\n');

  const { data: org } = await supabase.from('organizations').select('id').order('created_at').limit(1).single();

  const data = await testAddStaff();
  await testEditForm(data);
  await testRatingSubmission(data);
  await testEdgeCases({ orgId: org.id });

  console.log(`\n📊 Results: ${passed} passed, ${failed} failed\n`);
  process.exit(failed > 0 ? 1 : 0);
}

main();
