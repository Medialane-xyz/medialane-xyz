import Link from 'next/link'
import Image from "next/image";

export function LogoMedialane() {
  return (
    <div className="flex items-center space-x-2 ml-4">
    <Link href="/">
        <Image
          src="/medialane-light-logo.png"
          alt="Medialane"
          width={200}
          height={35}
        />
    </Link>
    </div>
  )
}