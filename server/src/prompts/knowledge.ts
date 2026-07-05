/**
 * Ground-truth company knowledge for prompt grounding.
 * Keep this aligned with culinova.sa public information.
 */
export const CULINOVA_KNOWLEDGE = {
  company: {
    name: 'Culinova',
    website: 'https://culinova.sa',
    tagline: 'Professional Kitchen & Laundry Engineering',
    region: 'Saudi Arabia',
    experience: '20+ years',
    projectsDelivered: '100+ projects',
    positioning:
      'Specialized Saudi engineering company for commercial kitchens, central kitchens, and industrial laundry facilities.',
  },

  contact: {
    phone: '+966 511 028 280',
    phoneTel: '+966511028280',
    email: 'info@culinova.com',
    address: 'Riyadh, Al Yarmouk District, Saudi Arabia',
    contactForm: 'https://culinova.sa',
  },

  services: [
    {
      name: 'Central Kitchen Engineering',
      summary:
        'Large-scale food production environments for hospitals, schools, catering operations, and institutional clients.',
    },
    {
      name: 'Commercial Kitchen Solutions',
      summary:
        'Restaurants, hotels, hospitality kitchens, and food service operations with workflow-focused design.',
    },
    {
      name: 'Central Laundry Systems',
      summary:
        'Industrial laundry for hospitals, hotels, and institutions with clean/dirty zone separation and capacity planning.',
    },
    {
      name: 'Equipment Supply',
      summary:
        'Kitchen and laundry equipment sourced from 65+ global manufacturers, matched to operational needs and budget.',
    },
    {
      name: 'Installation & Commissioning',
      summary:
        'Professional on-site installation, calibration, safety verification, and operational readiness testing.',
    },
    {
      name: 'Maintenance & Technical Support',
      summary:
        'Ongoing service contracts to extend equipment life, maintain performance, and reduce downtime.',
    },
  ],

  process: [
    {
      step: 1,
      title: 'Understanding Your Project',
      detail:
        'Analyze operational concept: menu, capacity, workflow, and space for kitchens. For laundry, review volume, linen types, and clean/dirty zone requirements.',
    },
    {
      step: 2,
      title: 'Design & Planning',
      detail:
        'Detailed layouts aligned with hygiene standards, HACCP principles, and Saudi regulatory compliance.',
    },
    {
      step: 3,
      title: 'Technical Development',
      detail:
        'Electrical, plumbing, ventilation, humidity control, and equipment specifications before installation begins.',
    },
    {
      step: 4,
      title: 'Installation & Execution',
      detail:
        'On-site installation, calibration, safety verification, and operational readiness testing.',
    },
  ],

  sectors: [
    'Restaurants and hotels',
    'Hospitals and healthcare',
    'Schools and education',
    'Catering and institutional clients',
    'Private villas and premium residential',
  ],

  projects: [
    {
      name: 'Najran Private Hospital',
      sector: 'Healthcare',
      scope: 'Kitchen and laundry engineering for healthcare catering operations.',
    },
    {
      name: 'Riyadh Schools (Misk International)',
      sector: 'Education',
      scope: 'Kitchen facilities for boys and girls campuses.',
    },
    {
      name: 'Al Sayed Fish Market',
      sector: 'Retail / Food',
      scope: 'Full coordination and equipment supply.',
    },
    {
      name: 'Del Pasion Restaurant & Cigar Lounge',
      sector: 'Hospitality',
      scope: 'Cooking line and refrigeration setup.',
    },
    {
      name: 'Private Villas',
      sector: 'Residential',
      scope: 'Ventilation and fire suppression systems.',
    },
  ],

  capabilities: [
    'Workflow and hygiene-focused kitchen design',
    'HACCP-aligned planning',
    'Ventilation, humidity, and MEP coordination',
    'Global equipment sourcing (65+ manufacturers)',
    'End-to-end delivery from concept to commissioning',
    'Long-term maintenance and technical support',
  ],

  boundaries: [
    'Do not quote exact prices or timelines without a site assessment.',
    'Do not invent project names, certifications, or partnerships not listed here.',
    'Do not provide legal, medical, or food safety certification guarantees.',
    'Direct pricing and formal proposals to a consultation with the Culinova team.',
  ],
} as const

export function formatKnowledgeForPrompt(): string {
  const k = CULINOVA_KNOWLEDGE

  const servicesBlock = k.services
    .map((s, i) => `${i + 1}. **${s.name}:** ${s.summary}`)
    .join('\n')

  const processBlock = k.process
    .map((p) => `${p.step}. **${p.title}:** ${p.detail}`)
    .join('\n')

  const projectsBlock = k.projects
    .map((p) => `- **${p.name}** (${p.sector}): ${p.scope}`)
    .join('\n')

  const sectorsBlock = k.sectors.map((s) => `- ${s}`).join('\n')

  const capabilitiesBlock = k.capabilities.map((c) => `- ${c}`).join('\n')

  const boundariesBlock = k.boundaries.map((b) => `- ${b}`).join('\n')

  return `
## Company Profile
- **Name:** ${k.company.name}
- **Website:** ${k.company.website}
- **Focus:** ${k.company.tagline}
- **Region:** ${k.company.region}
- **Experience:** ${k.company.experience}, ${k.company.projectsDelivered} delivered
- **Positioning:** ${k.company.positioning}

## Contact (share when user asks to book, contact, call, or visit)
- **Phone:** ${k.contact.phone}
- **Email:** ${k.contact.email}
- **Address:** ${k.contact.address}
- **Website / contact form:** ${k.contact.contactForm}

## Core Services
${servicesBlock}

## Project Delivery Process (4 Steps)
${processBlock}

## Sectors Served
${sectorsBlock}

## Selected Projects (reference only, do not invent others)
${projectsBlock}

## Engineering Capabilities
${capabilitiesBlock}

## Response Boundaries
${boundariesBlock}
`.trim()
}
