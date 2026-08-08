type BrandMarkProps = {
  size?: number
  className?: string
}

export function BrandMark({ size = 28, className = '' }: BrandMarkProps) {
  return (
    <img
      className={`brand-logo ${className}`.trim()}
      src="/logo.png"
      alt=""
      width={size}
      height={size}
      decoding="async"
    />
  )
}

export function BrandName({
  bilingual = false,
  className = '',
}: {
  bilingual?: boolean
  className?: string
}) {
  return (
    <span className={className} translate="no">
      {bilingual ? '童步 Childsteps' : '童步'}
    </span>
  )
}
