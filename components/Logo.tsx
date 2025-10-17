import Image from 'next/image'
import Link from 'next/link'

interface LogoProps {
  href?: string
  className?: string
}

export default function Logo({ href = '/', className = '' }: LogoProps) {
  return (
    <Link href={href} className={`flex items-center ${className}`}>
      <div className="flex items-center space-x-3">
        <div className="bg-white rounded-lg p-2 shadow-sm">
          <Image
            src="/supplement-factory-logo1.png"
            alt="SOP Management"
            width={120}
            height={40}
            className="h-8 w-auto"
            priority
          />
        </div>
      </div>
    </Link>
  )
}




