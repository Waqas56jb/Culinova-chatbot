type CulinovaLogoProps = {
  size?: 'sm' | 'md' | 'hero'
  variant?: 'full' | 'icon'
  className?: string
}

const sizeClassMap = {
  sm: 'culinova-logo-img--sm',
  md: 'culinova-logo-img--md',
  hero: 'culinova-logo-img--hero',
} as const

export function CulinovaLogo({
  size = 'md',
  variant = 'full',
  className = '',
}: CulinovaLogoProps) {
  const variantClass = variant === 'icon' ? 'culinova-logo-img--icon' : 'culinova-logo-img--full'

  return (
    <img
      src="/logo.png"
      alt="Culinova"
      className={`culinova-logo-img ${sizeClassMap[size]} ${variantClass} ${className}`.trim()}
      draggable={false}
    />
  )
}

/** @deprecated Use CulinovaLogo instead */
export const CulinovaMark = CulinovaLogo
