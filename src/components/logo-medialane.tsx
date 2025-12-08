import Link from 'next/link'
import Image from "next/image";

export function LogoMedialane() {
  return (
    <div className="flex items-center space-x-2 ml-4">
    <Link href="/">
        <Image
          src="/medialane.png"
          alt="Medialane"
          width={207}
          height={36}
        />
    </Link>
    </div>
  )
}