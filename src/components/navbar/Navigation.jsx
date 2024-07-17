"use client";
import Link from "next/link";
import SignInButton from "./SignInButton";
import { useSession } from "next-auth/react";
import ProfileMenu from "./ProfileMenu";
import Image from "next/image";

export default function Navbar() {
  const { data: session } = useSession();
  return (
    <nav
      className={`w-full flex items-center justify-between md:justify-between px-10 py-5 shadow-md absolute`}
    >
      <Link href="/">
        <div className="flex items-center gap-2">
          <h1
            className={`text-3xl font-bold dark:text-secondary text-primary hidden md:block`}
          >
            BUN CHEE
          </h1>
          <div className="flex justify-center items-center md:hidden">
            <Image src="/logo.png" alt="logo" width={50} height={50} />
          </div>
        </div>
      </Link>
      {session ? <ProfileMenu session={session} /> : <SignInButton />}
    </nav>
  );
}
