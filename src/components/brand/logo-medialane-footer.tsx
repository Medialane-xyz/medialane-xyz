import Link from 'next/link'
import Image from "next/image";

export function LogoMedialaneFooter() {
  return (
    <div className="flex items-center">
    <Link href="/">
      
        <Image
          className="hidden dark:block"
          src="/medialane-ip-marketplace-logo.png"
          alt="dark-mode-image"
          width={364}
          height={68}
        />
        <Image
          className="block dark:hidden"
          src="/medialane-ip-marketplace-logo.png"
          alt="light-mode-image"
          width={364}
          height={68}
        />
         
    </Link>
    </div>
  )
}