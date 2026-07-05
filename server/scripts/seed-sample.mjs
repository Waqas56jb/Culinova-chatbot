/**
 * Inserts realistic sample records into every agent_ table so the admin
 * panel has data to show. Safe to re-run: skips records that already exist.
 * Usage: node scripts/seed-sample.mjs
 */
import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'

const url = process.env.SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !serviceKey) {
  console.error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in server/.env')
  process.exit(1)
}

const supabase = createClient(url, serviceKey)

/** ISO timestamp N days ago at a given hour. */
function daysAgo(days, hour = 11, minute = 0) {
  const date = new Date()
  date.setDate(date.getDate() - days)
  date.setHours(hour, minute, 0, 0)
  return date.toISOString()
}

/* ============ 1. Leads ============ */

const LEADS = [
  { name: 'Khalid Al-Otaibi', company: 'Riyadh Grand Hotel', phone: '+966 550 214 786', email: 'k.alotaibi@riyadhgrand.sa', sector: 'Hospitality', interest: 'Commercial kitchen renovation for hotel main restaurant', source: 'chat', status: 'qualified', created_at: daysAgo(1, 10, 24) },
  { name: 'Sara Al-Harbi', company: 'Nova Catering Co.', phone: '+966 555 908 112', email: 'sara@novacatering.sa', sector: 'Catering', interest: 'Central kitchen design for 5,000 meals/day capacity', source: 'voice', status: 'new', created_at: daysAgo(1, 15, 40) },
  { name: 'Mohammed Al-Qahtani', company: 'Shifa Medical Center', phone: '+966 530 771 452', email: 'm.qahtani@shifamed.sa', sector: 'Healthcare', interest: 'Hospital laundry system with clean/dirty zone separation', source: 'chat', status: 'contacted', created_at: daysAgo(2, 9, 12) },
  { name: 'Fatima Al-Zahrani', company: 'Bright Future Schools', phone: '+966 561 340 998', email: 'f.zahrani@brightfuture.edu.sa', sector: 'Education', interest: 'Kitchen facilities for two new school campuses', source: 'chat', status: 'new', created_at: daysAgo(3, 13, 5) },
  { name: 'Abdullah Al-Shehri', company: 'Al Shehri Restaurants Group', phone: '+966 540 662 305', email: 'abdullah@alshehrigroup.sa', sector: 'Restaurants', interest: 'Cooking line and refrigeration for new steakhouse', source: 'voice', status: 'qualified', created_at: daysAgo(4, 19, 30) },
  { name: 'Noura Al-Dosari', company: 'Pearl Laundry Services', phone: '+966 502 118 764', email: 'noura@pearllaundry.sa', sector: 'Laundry', interest: 'Industrial laundry equipment supply and installation', source: 'chat', status: 'contacted', created_at: daysAgo(6, 11, 48) },
  { name: 'Turki Al-Mutairi', company: 'Desert Rose Resort', phone: '+966 533 495 220', email: 't.mutairi@desertrose.sa', sector: 'Hospitality', interest: 'Full kitchen and laundry package for resort expansion', source: 'voice', status: 'new', created_at: daysAgo(8, 16, 15) },
  { name: 'Layla Al-Ghamdi', company: 'City Care Hospital', phone: '+966 556 802 391', email: 'l.ghamdi@citycare.sa', sector: 'Healthcare', interest: 'HACCP-aligned central kitchen for patient catering', source: 'chat', status: 'qualified', created_at: daysAgo(10, 10, 2) },
  { name: 'Omar Al-Subaie', company: 'Subaie Villas', phone: '+966 544 273 655', email: 'omar.subaie@gmail.com', sector: 'Residential', interest: 'Premium villa kitchen with ventilation and fire suppression', source: 'chat', status: 'closed', created_at: daysAgo(13, 20, 22) },
  { name: 'Huda Al-Anazi', company: 'Taibah University Catering', phone: '+966 567 114 083', email: 'h.anazi@taibahcatering.sa', sector: 'Education', interest: 'Equipment supply from global manufacturers for campus dining', source: 'voice', status: 'contacted', created_at: daysAgo(16, 12, 37) },
  { name: 'Bandar Al-Rashid', company: 'Rashid Fish Market', phone: '+966 509 883 217', email: 'bandar@rashidfish.sa', sector: 'Retail / Food', interest: 'Cold chain and display refrigeration coordination', source: 'chat', status: 'closed', created_at: daysAgo(20, 9, 55) },
  { name: 'Maha Al-Juhani', company: 'Golden Fork Catering', phone: '+966 538 660 449', email: 'maha@goldenfork.sa', sector: 'Catering', interest: 'Maintenance contract for existing central kitchen', source: 'chat', status: 'qualified', created_at: daysAgo(24, 14, 8) },
]

/* ============ 2. Conversations ============ */

const CONVERSATIONS = [
  {
    session_key: 'sample-conv-01',
    visitor: 'Khalid Al-Otaibi',
    channel: 'chat',
    language: 'English',
    started_at: daysAgo(1, 10, 15),
    duration_min: 7,
    messages_count: 8,
    lead_captured: true,
    satisfaction: 5,
    transcript: [
      { role: 'user', content: 'Hi, we are renovating our hotel restaurant kitchen. Can Culinova help?', time: '10:15' },
      { role: 'assistant', content: 'Welcome! Absolutely — Culinova specializes in commercial kitchen solutions for hotels and hospitality. We handle everything from workflow-focused design to equipment supply and commissioning. Could you tell me a bit about the size of your operation?', time: '10:15' },
      { role: 'user', content: 'Main restaurant serves about 400 covers a day, plus banquets.', time: '10:17' },
      { role: 'assistant', content: 'That is a solid volume. For 400+ covers with banquet service, we would look at zoned cooking lines, proper ventilation, and cold storage capacity. Our team follows HACCP-aligned planning and Saudi regulatory compliance throughout.', time: '10:17' },
      { role: 'user', content: 'What is the process to get started?', time: '10:19' },
      { role: 'assistant', content: 'It starts with understanding your project — menu, capacity, and space. Then design and planning, technical development, and finally installation and commissioning. Would you like our team to contact you for a consultation?', time: '10:19' },
      { role: 'user', content: 'Yes please. k.alotaibi@riyadhgrand.sa or +966 550 214 786', time: '10:21' },
      { role: 'assistant', content: 'Thank you, Khalid! Our team will reach out shortly to arrange a consultation. You can also call us directly at +966 511 028 280.', time: '10:21' },
    ],
  },
  {
    session_key: 'sample-conv-02',
    visitor: 'Sara Al-Harbi',
    channel: 'voice',
    language: 'Arabic',
    started_at: daysAgo(1, 15, 32),
    duration_min: 5,
    messages_count: 6,
    lead_captured: true,
    satisfaction: 5,
    transcript: [
      { role: 'assistant', content: 'مرحباً بك في كولينوفا! كيف يمكنني مساعدتك اليوم؟', time: '15:32' },
      { role: 'user', content: 'نحن شركة تموين ونحتاج مطبخ مركزي بطاقة خمسة آلاف وجبة يومياً', time: '15:33' },
      { role: 'assistant', content: 'ممتاز! المطابخ المركزية هي تخصصنا الأساسي. نصمم بيئات إنتاج غذائي واسعة النطاق للمستشفيات والمدارس وشركات التموين مع الالتزام بمعايير الهاسب.', time: '15:33' },
      { role: 'user', content: 'ما هي الخطوات الأولى؟', time: '15:34' },
      { role: 'assistant', content: 'نبدأ بفهم مشروعك: القائمة والطاقة الإنتاجية وسير العمل والمساحة. هل يمكنني الحصول على بيانات التواصل لترتيب استشارة مع فريقنا؟', time: '15:35' },
      { role: 'user', content: 'sara@novacatering.sa ورقمي ٩٦٦٥٥٥٩٠٨١١٢', time: '15:36' },
    ],
  },
  {
    session_key: 'sample-conv-03',
    visitor: 'Mohammed Al-Qahtani',
    channel: 'chat',
    language: 'English',
    started_at: daysAgo(2, 9, 5),
    duration_min: 6,
    messages_count: 6,
    lead_captured: true,
    satisfaction: 4,
    transcript: [
      { role: 'user', content: 'Do you build hospital laundry systems?', time: '09:05' },
      { role: 'assistant', content: 'Yes — central laundry systems are one of our core services. For hospitals we design with strict clean/dirty zone separation, capacity planning, and infection control in mind. Najran Private Hospital is one of our reference projects.', time: '09:05' },
      { role: 'user', content: 'We process about 2 tons of linen daily.', time: '09:07' },
      { role: 'assistant', content: 'That volume needs a properly zoned industrial setup. Our process covers layout design, equipment specification from 65+ global manufacturers, installation, and ongoing maintenance support.', time: '09:07' },
      { role: 'user', content: 'Please have someone contact me: m.qahtani@shifamed.sa', time: '09:09' },
      { role: 'assistant', content: 'Done! Our team will contact you shortly. You can also reach us at +966 511 028 280 or info@culinova.com.', time: '09:09' },
    ],
  },
  {
    session_key: 'sample-conv-04',
    visitor: 'Visitor 4f21',
    channel: 'chat',
    language: 'English',
    started_at: daysAgo(3, 21, 40),
    duration_min: 3,
    messages_count: 4,
    lead_captured: false,
    satisfaction: 4,
    transcript: [
      { role: 'user', content: 'What sectors do you serve?', time: '21:40' },
      { role: 'assistant', content: 'Culinova serves restaurants and hotels, hospitals and healthcare, schools and education, catering and institutional clients, plus private villas and premium residential projects across Saudi Arabia.', time: '21:40' },
      { role: 'user', content: 'And where are you located?', time: '21:42' },
      { role: 'assistant', content: 'We are based in Riyadh, Al Yarmouk District. You can reach us at +966 511 028 280 or through the contact form at culinova.sa.', time: '21:42' },
    ],
  },
  {
    session_key: 'sample-conv-05',
    visitor: 'Abdullah Al-Shehri',
    channel: 'voice',
    language: 'Arabic',
    started_at: daysAgo(4, 19, 18),
    duration_min: 8,
    messages_count: 6,
    lead_captured: true,
    satisfaction: 5,
    transcript: [
      { role: 'assistant', content: 'أهلاً وسهلاً! أنا مساعد كولينوفا الصوتي. كيف أقدر أخدمك؟', time: '19:18' },
      { role: 'user', content: 'أفتتح مطعم ستيك جديد وأحتاج خط طبخ كامل مع تبريد', time: '19:19' },
      { role: 'assistant', content: 'مبروك على المشروع! نفذنا مشاريع مشابهة مثل مطعم ديل باسيون. نجهز خطوط الطبخ والتبريد مع التصميم والتوريد والتركيب والتشغيل.', time: '19:20' },
      { role: 'user', content: 'كم تستغرق مدة التنفيذ عادة؟', time: '19:22' },
      { role: 'assistant', content: 'المدة تعتمد على حجم المشروع والمساحة، ونحددها بدقة بعد المعاينة. أرحب بترتيب استشارة مع فريقنا الهندسي — ممكن رقمك أو بريدك؟', time: '19:23' },
      { role: 'user', content: 'abdullah@alshehrigroup.sa', time: '19:24' },
    ],
  },
  {
    session_key: 'sample-conv-06',
    visitor: 'Noura Al-Dosari',
    channel: 'chat',
    language: 'English',
    started_at: daysAgo(6, 11, 40),
    duration_min: 5,
    messages_count: 4,
    lead_captured: true,
    satisfaction: 4,
    transcript: [
      { role: 'user', content: 'We need industrial washers and dryers for our laundry business. Do you supply equipment only?', time: '11:40' },
      { role: 'assistant', content: 'Yes — equipment supply is one of our six core services. We source from 65+ global manufacturers and match equipment to your operational needs and budget. We can also handle installation and commissioning if needed.', time: '11:40' },
      { role: 'user', content: 'Great. Contact me at noura@pearllaundry.sa', time: '11:43' },
      { role: 'assistant', content: 'Thank you, Noura! Our team will be in touch shortly to discuss capacity and specifications.', time: '11:43' },
    ],
  },
  {
    session_key: 'sample-conv-07',
    visitor: 'Visitor 9a3c',
    channel: 'voice',
    language: 'English',
    started_at: daysAgo(8, 16, 8),
    duration_min: 4,
    messages_count: 4,
    lead_captured: false,
    satisfaction: 3,
    transcript: [
      { role: 'assistant', content: 'Welcome to Culinova! How can I help you today?', time: '16:08' },
      { role: 'user', content: 'How much does a commercial kitchen cost roughly?', time: '16:09' },
      { role: 'assistant', content: 'Pricing depends heavily on capacity, equipment selection, and site conditions, so we never quote fixed prices without a site assessment. Our team can give you an accurate proposal after a consultation — shall I arrange one?', time: '16:09' },
      { role: 'user', content: 'Not yet, just researching. Thanks.', time: '16:11' },
    ],
  },
  {
    session_key: 'sample-conv-08',
    visitor: 'Layla Al-Ghamdi',
    channel: 'chat',
    language: 'English',
    started_at: daysAgo(10, 9, 50),
    duration_min: 9,
    messages_count: 6,
    lead_captured: true,
    satisfaction: 5,
    transcript: [
      { role: 'user', content: 'Our hospital needs a central kitchen for patient meals. HACCP compliance is mandatory.', time: '09:50' },
      { role: 'assistant', content: 'You are in the right place — HACCP-aligned planning is central to how Culinova designs. We build large-scale food production environments for hospitals with hygiene-focused workflows and Saudi regulatory compliance.', time: '09:50' },
      { role: 'user', content: 'Have you done hospital projects before?', time: '09:53' },
      { role: 'assistant', content: 'Yes — Najran Private Hospital is a reference project where we delivered both kitchen and laundry engineering for healthcare catering operations.', time: '09:53' },
      { role: 'user', content: 'Perfect. Reach me at l.ghamdi@citycare.sa', time: '09:56' },
      { role: 'assistant', content: 'Thank you, Layla! Our engineering team will contact you to arrange a site visit and consultation.', time: '09:56' },
    ],
  },
  {
    session_key: 'sample-conv-09',
    visitor: 'Visitor 7be0',
    channel: 'chat',
    language: 'Arabic',
    started_at: daysAgo(14, 13, 22),
    duration_min: 2,
    messages_count: 4,
    lead_captured: false,
    satisfaction: 4,
    transcript: [
      { role: 'user', content: 'هل تقدمون عقود صيانة؟', time: '13:22' },
      { role: 'assistant', content: 'نعم، نقدم عقود صيانة ودعم فني مستمر لإطالة عمر المعدات والحفاظ على الأداء وتقليل التوقف. هل لديكم مطبخ أو مغسلة قائمة حالياً؟', time: '13:22' },
      { role: 'user', content: 'سأتواصل معكم لاحقاً، شكراً', time: '13:24' },
      { role: 'assistant', content: 'على الرحب والسعة! يمكنكم الاتصال بنا في أي وقت على +966 511 028 280.', time: '13:24' },
    ],
  },
  {
    session_key: 'sample-conv-10',
    visitor: 'Maha Al-Juhani',
    channel: 'chat',
    language: 'English',
    started_at: daysAgo(24, 14, 0),
    duration_min: 6,
    messages_count: 4,
    lead_captured: true,
    satisfaction: 5,
    transcript: [
      { role: 'user', content: 'We have an existing central kitchen and want a maintenance contract.', time: '14:00' },
      { role: 'assistant', content: 'We offer ongoing maintenance and technical support contracts designed to extend equipment life and reduce downtime. Our team can assess your current setup and propose a service plan.', time: '14:00' },
      { role: 'user', content: 'Sounds good — maha@goldenfork.sa', time: '14:04' },
      { role: 'assistant', content: 'Thank you, Maha! We will contact you to schedule an assessment visit.', time: '14:04' },
    ],
  },
]

/* ============ 3. Extra training entries ============ */

const TRAINING_EXTRA = [
  {
    title: 'Equipment brands and sourcing',
    category: 'Services',
    content:
      'Culinova sources kitchen and laundry equipment from 65+ global manufacturers. Equipment is matched to operational needs and budget rather than pushing specific brands. Cold chain, cooking lines, ventilation, and industrial laundry machines are all covered.',
    status: 'published',
  },
  {
    title: 'Consultation booking flow',
    category: 'Process',
    content:
      'When a visitor shows buying intent, collect their name, company, and email or phone, then confirm the team will reach out. Consultations include a site assessment before any pricing or timeline is discussed.',
    status: 'draft',
  },
]

/* ============ 4. Settings default ============ */

const DEFAULT_SETTINGS = {
  model: 'gpt-4o-mini',
  voiceModel: 'gpt-realtime',
  voiceName: 'marin',
  chatbotEnabled: true,
  voiceEnabled: true,
  leadCapture: true,
  showBranding: true,
  templateId: 'classic-gold',
  custom: { primary: '#0a0a0a', accent: '#d4af37', surface: '#faf8f3', text: '#1a1a1a' },
  orbThemeId: 'gold',
  radius: 22,
  position: 'right',
  welcomeTitle: 'Professional Kitchen & Laundry',
}

/* ============ Run ============ */

let summary = []

// Leads (skip duplicates by email)
{
  const { data: existing } = await supabase.from('agent_leads').select('email')
  const have = new Set((existing ?? []).map((row) => row.email))
  const fresh = LEADS.filter((lead) => !have.has(lead.email))
  if (fresh.length > 0) {
    const { error } = await supabase.from('agent_leads').insert(fresh)
    if (error) throw new Error(`leads: ${error.message}`)
  }
  summary.push(`agent_leads: +${fresh.length} (skipped ${LEADS.length - fresh.length} existing)`)
}

// Conversations (upsert by session_key)
{
  const { error } = await supabase
    .from('agent_conversations')
    .upsert(CONVERSATIONS, { onConflict: 'session_key' })
  if (error) throw new Error(`conversations: ${error.message}`)
  summary.push(`agent_conversations: ${CONVERSATIONS.length} upserted`)
}

// Training (skip duplicates by title)
{
  const { data: existing } = await supabase.from('agent_training_entries').select('title')
  const have = new Set((existing ?? []).map((row) => row.title))
  const fresh = TRAINING_EXTRA.filter((entry) => !have.has(entry.title))
  if (fresh.length > 0) {
    const { error } = await supabase.from('agent_training_entries').insert(fresh)
    if (error) throw new Error(`training: ${error.message}`)
  }
  summary.push(`agent_training_entries: +${fresh.length}`)
}

// Settings (only fill if empty)
{
  const { data: row } = await supabase.from('agent_settings').select('data').eq('id', 1).single()
  if (!row?.data || Object.keys(row.data).length === 0) {
    const { error } = await supabase
      .from('agent_settings')
      .upsert({ id: 1, data: DEFAULT_SETTINGS, updated_at: new Date().toISOString() })
    if (error) throw new Error(`settings: ${error.message}`)
    summary.push('agent_settings: defaults written')
  } else {
    summary.push('agent_settings: already configured, untouched')
  }
}

// Staff user (role-based access demo)
{
  const staffEmail = 'staff@culinova.sa'
  const { data: existing } = await supabase
    .from('agent_admin_users')
    .select('id')
    .eq('email', staffEmail)
    .maybeSingle()

  if (!existing) {
    const { data: created, error: authError } = await supabase.auth.admin.createUser({
      email: staffEmail,
      password: 'Staff@112233',
      email_confirm: true,
    })
    if (authError) throw new Error(`staff user: ${authError.message}`)
    const { error: profileError } = await supabase.from('agent_admin_users').insert({
      id: created.user.id,
      email: staffEmail,
      full_name: 'Demo Staff Member',
      role: 'staff',
    })
    if (profileError) throw new Error(`staff profile: ${profileError.message}`)
    summary.push(`agent_admin_users: staff account created (${staffEmail} / Staff@112233)`)
  } else {
    summary.push('agent_admin_users: staff account already exists')
  }
}

// Audit logs
{
  const LOG_SAMPLES = [
    { actor_email: 'system', action: 'system.seed', target: 'sample data', detail: { source: 'cli' }, created_at: daysAgo(0, 8, 45) },
    { actor_email: 'admin@culinova.sa', action: 'lead.status_changed', target: 'Khalid Al-Otaibi', detail: { status: 'qualified' }, created_at: daysAgo(1, 11, 5) },
    { actor_email: 'admin@culinova.sa', action: 'training.updated', target: 'Consultation booking flow', detail: {}, created_at: daysAgo(2, 10, 30) },
    { actor_email: 'staff@culinova.sa', action: 'auth.signed_in', target: 'admin panel', detail: {}, created_at: daysAgo(2, 9, 0) },
    { actor_email: 'admin@culinova.sa', action: 'settings.saved', target: 'widget settings', detail: {}, created_at: daysAgo(3, 17, 12) },
  ]
  const { count } = await supabase
    .from('agent_audit_logs')
    .select('id', { count: 'exact', head: true })
    .eq('action', 'system.seed')
  if (!count || count === 0) {
    const { error } = await supabase.from('agent_audit_logs').insert(LOG_SAMPLES)
    if (error) throw new Error(`audit logs: ${error.message}`)
    summary.push(`agent_audit_logs: +${LOG_SAMPLES.length}`)
  } else {
    summary.push('agent_audit_logs: sample logs already present')
  }
}

console.log('Sample data seeded:\n' + summary.map((line) => `  - ${line}`).join('\n'))
