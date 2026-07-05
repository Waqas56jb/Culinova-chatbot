export const CHAT_GREETING =
  'Hello! I am your **Culinova Assistant**. How may I help you with kitchen or laundry engineering today?'

const CONTACT_INFO = `**Contact our team**

- **Phone:** [+966 511 028 280](tel:+966511028280)
- **Email:** [info@culinova.com](mailto:info@culinova.com)
- **Address:** Riyadh, Al Yarmouk District, Saudi Arabia`

const SERVICES_RESPONSE = `### Our Services

Culinova offers six integrated engineering services:

1. **Central Kitchen Engineering:** large-scale food production for hospitals, schools, and catering
2. **Commercial Kitchen Solutions:** restaurants, hotels, and hospitality kitchens
3. **Central Laundry Systems:** industrial laundry for hospitals, hotels, and institutions
4. **Equipment Supply:** kitchen and laundry equipment from 65+ global manufacturers
5. **Installation & Commissioning:** professional setup, calibration, and testing
6. **Maintenance & Technical Support:** ongoing service to reduce downtime

Which sector are you planning for? Hospitality, healthcare, education, or something else?`

const PROCESS_RESPONSE = `### Project Delivery Process

Every Culinova project follows four engineering steps.

#### 1. Understanding Your Project

We analyze your operational concept: menu, capacity, workflow, and space for kitchens. For laundry, we review volume and clean or dirty zones.

#### 2. Design & Planning

Detailed layouts aligned with hygiene standards, HACCP principles, and regulatory compliance.

#### 3. Technical Development

Electrical, plumbing, ventilation, humidity control, and equipment specifications before installation.

#### 4. Installation & Execution

On-site installation, calibration, safety verification, and operational readiness testing.

Would you like to discuss a specific facility type?`

const CONSULTATION_RESPONSE = `### Book a Consultation

Ready to start your project? Our team is available for consultations.

${CONTACT_INFO}

You can also share your requirements through our contact form at [culinova.sa](https://culinova.sa). We typically begin by understanding your operational needs before proposing a tailored solution.`

const ABOUT_RESPONSE = `### About Culinova

Culinova is a specialized Saudi company with **20+ years of experience** and **100+ projects delivered**.

We engineer commercial kitchens, central kitchens, and industrial laundry facilities for:

- Restaurants and hotels
- Hospitals and healthcare
- Schools and education
- Catering and institutional clients

Our approach is engineering-driven, combining workflow design, global equipment access, and long-term support from design through commissioning.`

const PROJECTS_RESPONSE = `### Selected Projects

- **Najran Private Hospital:** kitchen and laundry for healthcare catering
- **Riyadh Schools (Misk International):** kitchen facilities for boys and girls campuses
- **Al Sayed Fish Market:** full coordination and equipment supply
- **Del Pasion Restaurant & Cigar Lounge:** cooking and refrigeration setup
- **Private Villas:** ventilation and fire suppression systems

Which sector is closest to your project?`

function matches(text: string, keywords: string[]): boolean {
  const normalized = text.toLowerCase()
  return keywords.some((keyword) => normalized.includes(keyword))
}

export function getAssistantReply(userMessage: string): string {
  const text = userMessage.trim()

  if (!text) {
    return 'Please share your question and I will guide you to the right Culinova service or next step.'
  }

  if (matches(text, ['service', 'offer', 'provide', 'do you do', 'what do you'])) {
    return SERVICES_RESPONSE
  }

  if (matches(text, ['process', 'step', 'workflow', 'deliver', 'how do you work', 'how it works'])) {
    return PROCESS_RESPONSE
  }

  if (matches(text, ['contact', 'consult', 'appointment', 'phone', 'email', 'book', 'reach'])) {
    return CONSULTATION_RESPONSE
  }

  if (matches(text, ['about', 'who are', 'experience', 'company', 'culinova'])) {
    return ABOUT_RESPONSE
  }

  if (matches(text, ['project', 'portfolio', 'hospital', 'school', 'restaurant', 'past work'])) {
    return PROJECTS_RESPONSE
  }

  if (matches(text, ['kitchen', 'central kitchen', 'commercial kitchen'])) {
    return `For kitchen projects, Culinova designs environments optimized for workflow, hygiene, and long-term reliability. This covers restaurants, hotels, and central kitchens serving hospitals and schools.

${SERVICES_RESPONSE}`
  }

  if (matches(text, ['laundry', 'washing', 'linen'])) {
    return `Culinova engineers **Central Laundry Systems** for hospitals, hotels, and institutional operations. This includes clean and dirty zone separation, ventilation, moisture control, and high-capacity processing design.

${PROCESS_RESPONSE}`
  }

  if (matches(text, ['equipment', 'supply', 'brand', 'manufacturer'])) {
    return `Our **Equipment Supply** service gives access to a portfolio sourced from **65+ global manufacturers**, selected to match each project's operational requirements and budget without compromising safety or reliability.

${CONTACT_INFO}`
  }

  if (matches(text, ['maintenance', 'support', 'repair', 'service contract'])) {
    return `Culinova provides **Maintenance & Technical Support** to extend equipment lifespan, maintain performance, and reduce downtime. We support facilities long after commissioning.

${CONTACT_INFO}`
  }

  if (matches(text, ['hello', 'hi', 'hey', 'salam', 'assalam'])) {
    return CHAT_GREETING
  }

  return `Thank you for your question. Culinova specializes in engineering professional kitchen and laundry environments across Saudi Arabia.

**I can help with:**

- Our six core services
- The 4-step project delivery process
- Past projects by sector
- Booking a consultation

${CONTACT_INFO}`
}
