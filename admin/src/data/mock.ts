import type {
  Conversation,
  DailyPoint,
  Lead,
  TrainingEntry,
  WidgetTemplate,
} from '@/types'

/* Deterministic pseudo-random so charts look organic but stable */
function seeded(seed: number) {
  let value = seed
  return () => {
    value = (value * 9301 + 49297) % 233280
    return value / 233280
  }
}

const rand = seeded(7)

export const DAILY_SERIES: DailyPoint[] = Array.from({ length: 30 }, (_, i) => {
  const date = new Date()
  date.setDate(date.getDate() - (29 - i))
  const weekday = date.getDay()
  const weekendDip = weekday === 5 ? 0.6 : 1
  const trend = 1 + i / 40

  const conversations = Math.round((14 + rand() * 18) * trend * weekendDip)
  const leads = Math.round(conversations * (0.22 + rand() * 0.16))
  const voiceSessions = Math.round(conversations * (0.28 + rand() * 0.18))

  return {
    date: date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
    conversations,
    leads,
    voiceSessions,
  }
})

export const CHANNEL_SPLIT = [
  { name: 'Text chat', value: 64 },
  { name: 'Voice agent', value: 36 },
]

export const LANGUAGE_SPLIT = [
  { name: 'Arabic', value: 52 },
  { name: 'English', value: 38 },
  { name: 'Urdu', value: 7 },
  { name: 'Other', value: 3 },
]

export const TOP_INTENTS = [
  { name: 'Services overview', value: 31 },
  { name: 'Book consultation', value: 24 },
  { name: 'Central kitchen', value: 17 },
  { name: 'Laundry systems', value: 12 },
  { name: 'Equipment supply', value: 9 },
  { name: 'Maintenance', value: 7 },
]

export const HOURLY_ACTIVITY = Array.from({ length: 12 }, (_, i) => ({
  hour: `${(i * 2).toString().padStart(2, '0')}:00`,
  sessions: Math.round(2 + rand() * 20 * (i > 3 && i < 11 ? 1.6 : 0.5)),
}))

export const LEADS: Lead[] = [
  {
    id: 'L-1042',
    name: 'Abdullah Al-Rashid',
    company: 'Najd Hospitality Group',
    phone: '+966 55 210 8843',
    email: 'abdullah@najdgroup.sa',
    sector: 'Hospitality',
    interest: 'Central kitchen for 3 hotels',
    source: 'voice',
    status: 'qualified',
    createdAt: '2026-07-05T08:42:00',
  },
  {
    id: 'L-1041',
    name: 'Sara Al-Otaibi',
    company: 'Riyadh Care Hospital',
    phone: '+966 50 774 2210',
    email: 's.otaibi@riyadhcare.sa',
    sector: 'Healthcare',
    interest: 'Laundry system upgrade',
    source: 'chat',
    status: 'new',
    createdAt: '2026-07-05T07:15:00',
  },
  {
    id: 'L-1040',
    name: 'Mohammed Farsi',
    company: 'Bloom Catering',
    phone: '+966 54 991 0031',
    email: 'm.farsi@bloomcatering.sa',
    sector: 'Catering',
    interest: 'Equipment supply, 2 sites',
    source: 'chat',
    status: 'contacted',
    createdAt: '2026-07-04T19:03:00',
  },
  {
    id: 'L-1039',
    name: 'Fatima Zahrani',
    company: 'Misk Schools',
    phone: '+966 56 320 7789',
    email: 'f.zahrani@misk.edu.sa',
    sector: 'Education',
    interest: 'Campus kitchen redesign',
    source: 'voice',
    status: 'qualified',
    createdAt: '2026-07-04T14:27:00',
  },
  {
    id: 'L-1038',
    name: 'Khalid Mansour',
    company: 'Del Pasion Restaurants',
    phone: '+966 53 448 1265',
    email: 'khalid@delpasion.sa',
    sector: 'Hospitality',
    interest: 'Cooking line + refrigeration',
    source: 'chat',
    status: 'closed',
    createdAt: '2026-07-03T11:52:00',
  },
  {
    id: 'L-1037',
    name: 'Noura Al-Harbi',
    company: 'Seven Villas Estate',
    phone: '+966 59 118 6640',
    email: 'noura.h@sevenvillas.sa',
    sector: 'Residential',
    interest: 'Villa ventilation + fire suppression',
    source: 'voice',
    status: 'contacted',
    createdAt: '2026-07-03T09:20:00',
  },
  {
    id: 'L-1036',
    name: 'Omar Bakr',
    company: 'Coastal Fish Markets',
    phone: '+966 55 602 3318',
    email: 'omar@coastalfish.sa',
    sector: 'Retail',
    interest: 'Full market coordination',
    source: 'chat',
    status: 'new',
    createdAt: '2026-07-02T16:44:00',
  },
  {
    id: 'L-1035',
    name: 'Layla Qurashi',
    company: 'Andalus Hotels',
    phone: '+966 50 233 9174',
    email: 'l.qurashi@andalus.sa',
    sector: 'Hospitality',
    interest: 'Central laundry, 400 rooms',
    source: 'voice',
    status: 'qualified',
    createdAt: '2026-07-02T10:08:00',
  },
]

export const CONVERSATIONS: Conversation[] = [
  {
    id: 'C-2210',
    visitor: 'Visitor 8843 (Riyadh)',
    channel: 'voice',
    language: 'Arabic',
    startedAt: '2026-07-05T08:36:00',
    durationMin: 6,
    messagesCount: 14,
    leadCaptured: true,
    satisfaction: 5,
    transcript: [
      { role: 'assistant', content: 'Welcome to Culinova. How can I help with your kitchen or laundry project?', time: '08:36' },
      { role: 'user', content: 'We are opening three hotels in Riyadh and need a central kitchen.', time: '08:37' },
      { role: 'assistant', content: 'Excellent. Central Kitchen Engineering is one of our core services. May I ask the expected daily meal capacity?', time: '08:37' },
      { role: 'user', content: 'Around 4,000 meals per day across the properties.', time: '08:38' },
      { role: 'assistant', content: 'That scale suits a dedicated central production facility with distribution planning. Our team follows a 4-step process starting with capacity and workflow analysis.', time: '08:39' },
      { role: 'user', content: 'How do we start? Can someone visit the site?', time: '08:40' },
      { role: 'assistant', content: 'Certainly. You can reach our team at +966 511 028 280 or info@culinova.com to arrange a consultation and site visit. May I take your contact details?', time: '08:41' },
      { role: 'user', content: 'Abdullah Al-Rashid, Najd Hospitality Group. 055 210 8843.', time: '08:42' },
    ],
  },
  {
    id: 'C-2209',
    visitor: 'Visitor 2210 (Jeddah)',
    channel: 'chat',
    language: 'English',
    startedAt: '2026-07-05T07:10:00',
    durationMin: 4,
    messagesCount: 9,
    leadCaptured: true,
    satisfaction: 4,
    transcript: [
      { role: 'assistant', content: 'Hello! I am your Culinova Assistant. How may I help you today?', time: '07:10' },
      { role: 'user', content: 'Our hospital laundry is outdated. Do you handle upgrades?', time: '07:11' },
      { role: 'assistant', content: 'Yes. We engineer Central Laundry Systems for hospitals including clean and dirty zone separation, ventilation, and high-capacity processing.', time: '07:11' },
      { role: 'user', content: 'What is the typical project flow?', time: '07:12' },
      { role: 'assistant', content: 'Four steps: understanding your volumes, design and planning, technical development, then installation and commissioning.', time: '07:13' },
      { role: 'user', content: 'Please have someone contact me. s.otaibi@riyadhcare.sa', time: '07:15' },
    ],
  },
  {
    id: 'C-2208',
    visitor: 'Visitor 5521 (Dammam)',
    channel: 'chat',
    language: 'Arabic',
    startedAt: '2026-07-04T18:55:00',
    durationMin: 5,
    messagesCount: 11,
    leadCaptured: true,
    satisfaction: 5,
    transcript: [
      { role: 'assistant', content: 'مرحباً! أنا مساعد كولينوفا. كيف يمكنني مساعدتك؟', time: '18:55' },
      { role: 'user', content: 'نحتاج تجهيز مطبخين لشركة تموين', time: '18:56' },
      { role: 'assistant', content: 'بالتأكيد. نوفر توريد المعدات من أكثر من 65 مصنعاً عالمياً مع التركيب والتشغيل.', time: '18:57' },
      { role: 'user', content: 'ما هي خطوات العمل؟', time: '18:58' },
      { role: 'assistant', content: 'نبدأ بدراسة المشروع، ثم التصميم والتخطيط، فالتطوير التقني، وأخيراً التركيب والتشغيل.', time: '18:59' },
      { role: 'user', content: 'تواصلوا معي: m.farsi@bloomcatering.sa', time: '19:03' },
    ],
  },
  {
    id: 'C-2207',
    visitor: 'Visitor 7789 (Riyadh)',
    channel: 'voice',
    language: 'English',
    startedAt: '2026-07-04T14:18:00',
    durationMin: 8,
    messagesCount: 16,
    leadCaptured: true,
    satisfaction: 5,
    transcript: [
      { role: 'assistant', content: 'Welcome to Culinova. What facility are you planning?', time: '14:18' },
      { role: 'user', content: 'We manage school campuses and want to redesign two kitchens.', time: '14:19' },
      { role: 'assistant', content: 'We have delivered kitchen facilities for Riyadh Schools including boys and girls campuses. What is your student capacity?', time: '14:20' },
      { role: 'user', content: 'About 1,800 students per campus.', time: '14:21' },
      { role: 'assistant', content: 'Understood. HACCP-aligned layouts and workflow separation will be key. I recommend a consultation to review your spaces.', time: '14:23' },
      { role: 'user', content: 'Sounds good, my email is f.zahrani@misk.edu.sa', time: '14:27' },
    ],
  },
  {
    id: 'C-2206',
    visitor: 'Visitor 3318 (Khobar)',
    channel: 'chat',
    language: 'English',
    startedAt: '2026-07-02T16:38:00',
    durationMin: 3,
    messagesCount: 7,
    leadCaptured: true,
    satisfaction: 4,
    transcript: [
      { role: 'assistant', content: 'Hello! How may I help you with kitchen or laundry engineering today?', time: '16:38' },
      { role: 'user', content: 'Do you handle fish market facilities?', time: '16:39' },
      { role: 'assistant', content: 'Yes. We delivered full coordination and equipment supply for Al Sayed Fish Market.', time: '16:40' },
      { role: 'user', content: 'Great, contact me at omar@coastalfish.sa', time: '16:44' },
    ],
  },
  {
    id: 'C-2205',
    visitor: 'Visitor 1147 (Mecca)',
    channel: 'voice',
    language: 'Urdu',
    startedAt: '2026-07-02T12:05:00',
    durationMin: 4,
    messagesCount: 8,
    leadCaptured: false,
    satisfaction: 4,
    transcript: [
      { role: 'assistant', content: 'Culinova mein khush aamdeed. Main aapki kya madad kar sakta hoon?', time: '12:05' },
      { role: 'user', content: 'Restaurant kitchen ke liye equipment ki price kya hai?', time: '12:06' },
      { role: 'assistant', content: 'Qeemat capacity aur layout par depend karti hai. Hamari team consultation ke baad accurate proposal deti hai. Phone: +966 511 028 280.', time: '12:07' },
      { role: 'user', content: 'Theek hai, main sochta hoon.', time: '12:09' },
    ],
  },
]

export const TRAINING_ENTRIES: TrainingEntry[] = [
  {
    id: 'T-01',
    title: 'Company profile & positioning',
    category: 'Company',
    content:
      'Culinova is a specialized Saudi engineering company with 20+ years of experience and 100+ delivered projects across commercial kitchens, central kitchens, and industrial laundry facilities.',
    status: 'published',
    updatedAt: '2026-07-01',
  },
  {
    id: 'T-02',
    title: 'Six core services',
    category: 'Services',
    content:
      'Central Kitchen Engineering, Commercial Kitchen Solutions, Central Laundry Systems, Equipment Supply (65+ manufacturers), Installation & Commissioning, Maintenance & Technical Support.',
    status: 'published',
    updatedAt: '2026-07-01',
  },
  {
    id: 'T-03',
    title: '4-step project delivery process',
    category: 'Process',
    content:
      '1) Understanding the project: menu, capacity, workflow. 2) Design & planning: HACCP-aligned layouts. 3) Technical development: MEP, ventilation, humidity. 4) Installation & execution with commissioning.',
    status: 'published',
    updatedAt: '2026-06-28',
  },
  {
    id: 'T-04',
    title: 'Reference projects',
    category: 'Projects',
    content:
      'Najran Private Hospital (kitchen + laundry), Riyadh Schools Misk International, Al Sayed Fish Market, Del Pasion Restaurant, private villas ventilation and fire suppression.',
    status: 'published',
    updatedAt: '2026-06-25',
  },
  {
    id: 'T-05',
    title: 'Contact & consultation booking',
    category: 'Contact',
    content:
      'Phone +966 511 028 280, email info@culinova.com, Riyadh Al Yarmouk District. Pricing requires consultation; never quote fixed prices in chat.',
    status: 'published',
    updatedAt: '2026-06-25',
  },
  {
    id: 'T-06',
    title: 'Ramadan operating hours',
    category: 'Company',
    content: 'Seasonal working hours draft for Ramadan period. Pending approval from operations.',
    status: 'draft',
    updatedAt: '2026-06-20',
  },
]

export const WIDGET_TEMPLATES: WidgetTemplate[] = [
  {
    id: 'classic-gold',
    name: 'Classic Gold',
    description: 'Signature Culinova look. Black, cream, and gold.',
    primary: '#0a0a0a',
    accent: '#d4af37',
    surface: '#faf8f3',
    text: '#1a1a1a',
  },
  {
    id: 'midnight',
    name: 'Midnight',
    description: 'Full dark luxury with soft gold glow.',
    primary: '#05050a',
    accent: '#e6c55c',
    surface: '#12121a',
    text: '#f2efe6',
  },
  {
    id: 'ivory',
    name: 'Ivory Minimal',
    description: 'Bright, airy, understated elegance.',
    primary: '#2b2b2b',
    accent: '#b99742',
    surface: '#ffffff',
    text: '#222222',
  },
  {
    id: 'emerald',
    name: 'Emerald Estate',
    description: 'Deep green with brass accents for hospitality brands.',
    primary: '#0d2b22',
    accent: '#c9a24b',
    surface: '#f5f7f4',
    text: '#14261f',
  },
  {
    id: 'royal',
    name: 'Royal Sapphire',
    description: 'Navy and gold for corporate healthcare clients.',
    primary: '#101d3a',
    accent: '#d8b45a',
    surface: '#f6f7fb',
    text: '#16213c',
  },
  {
    id: 'desert',
    name: 'Desert Sand',
    description: 'Warm terracotta and sand tones.',
    primary: '#5a382a',
    accent: '#c96f3b',
    surface: '#faf4ec',
    text: '#3a2c22',
  },
  {
    id: 'graphite',
    name: 'Graphite Pro',
    description: 'Neutral slate with silver detailing.',
    primary: '#1c1f24',
    accent: '#9aa4b2',
    surface: '#f4f5f7',
    text: '#23262b',
  },
  {
    id: 'ruby',
    name: 'Ruby Reserve',
    description: 'Bold burgundy with champagne highlights.',
    primary: '#3a0d16',
    accent: '#d9a860',
    surface: '#faf5f2',
    text: '#33131b',
  },
]
