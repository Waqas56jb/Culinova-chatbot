/**
 * Seeds agent_training_entries with the real Culinova knowledge base
 * (same facts the chatbot is grounded on). Skips if entries already exist.
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

const { count } = await supabase
  .from('agent_training_entries')
  .select('id', { count: 'exact', head: true })

if (count && count > 0) {
  console.log(`agent_training_entries already has ${count} entries. Skipping seed.`)
  process.exit(0)
}

const ENTRIES = [
  {
    title: 'Company profile',
    category: 'Company',
    content:
      'Culinova (culinova.sa) is a specialized Saudi engineering company for commercial kitchens, central kitchens, and industrial laundry facilities. 20+ years of experience, 100+ projects delivered across Saudi Arabia. Tagline: Professional Kitchen & Laundry Engineering.',
    status: 'published',
  },
  {
    title: 'Contact information',
    category: 'Contact',
    content:
      'Phone: +966 511 028 280. Email: info@culinova.com. Address: Riyadh, Al Yarmouk District, Saudi Arabia. Website and contact form: https://culinova.sa. Share these when a visitor asks to book, call, or visit.',
    status: 'published',
  },
  {
    title: 'Core services',
    category: 'Services',
    content:
      'Six core services: 1) Central Kitchen Engineering for hospitals, schools, catering. 2) Commercial Kitchen Solutions for restaurants, hotels, hospitality. 3) Central Laundry Systems with clean/dirty zone separation. 4) Equipment Supply from 65+ global manufacturers. 5) Installation & Commissioning with calibration and safety verification. 6) Maintenance & Technical Support contracts.',
    status: 'published',
  },
  {
    title: 'Project delivery process',
    category: 'Process',
    content:
      'Four steps: 1) Understanding Your Project — analyze menu, capacity, workflow, space, and laundry volume. 2) Design & Planning — layouts aligned with hygiene standards, HACCP, and Saudi regulatory compliance. 3) Technical Development — electrical, plumbing, ventilation, humidity control specifications. 4) Installation & Execution — on-site installation, calibration, safety verification, and readiness testing.',
    status: 'published',
  },
  {
    title: 'Sectors served',
    category: 'Company',
    content:
      'Restaurants and hotels, hospitals and healthcare, schools and education, catering and institutional clients, private villas and premium residential.',
    status: 'published',
  },
  {
    title: 'Reference projects',
    category: 'Projects',
    content:
      'Najran Private Hospital (healthcare kitchen and laundry engineering). Riyadh Schools / Misk International (kitchen facilities for boys and girls campuses). Al Sayed Fish Market (full coordination and equipment supply). Del Pasion Restaurant & Cigar Lounge (cooking line and refrigeration). Private villas (ventilation and fire suppression systems). Never invent other project names.',
    status: 'published',
  },
  {
    title: 'Pricing and boundaries',
    category: 'Process',
    content:
      'Never quote exact prices or timelines without a site assessment. Direct pricing and formal proposals to a consultation with the Culinova team. Do not invent certifications or partnerships. Do not give legal, medical, or food safety certification guarantees.',
    status: 'published',
  },
]

const { error } = await supabase.from('agent_training_entries').insert(ENTRIES)

if (error) {
  console.error('Seed failed:', error.message)
  process.exit(1)
}

console.log(`Seeded ${ENTRIES.length} real Culinova training entries.`)
