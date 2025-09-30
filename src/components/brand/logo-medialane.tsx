import Link from 'next/link'
import Image from "next/image";

export function LogoMedialane() {
  return (
    <div className="flex items-center">
    <Link href="/">
        <Image
          className="hidden dark:block"
          src="/medialane-ip-marketplace-w.png"
          alt="dark-mode-image"
          width={177}
          height={33}
        />
        <Image
          className="block dark:hidden"
          src="/medialane-ip-marketplace-w.png"
          alt="light-mode-image"
          width={177}
          height={33}
        />       
    </Link>
    </div>
  )
}