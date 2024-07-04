"use client";
import Link from "next/link";
import SignInButton from "./SignInButton";
import { useSession } from "next-auth/react";
import ProfileMenu from "./ProfileMenu";

export default function Navbar() {
  const { data: session } = useSession();
  return (
    <nav
      className={`w-full flex items-center ${
        session ? "justify-end" : "justify-between"
      } md:justify-between px-10 py-5 shadow-md absolute`}
    >
      <Link href="/" className={`${session && "hidden md:block"}`}>
        <div className="flex items-center gap-2">
          <h1 className="text-3xl font-bold text-primary">Divider </h1>
        </div>
      </Link>
      {session ? <ProfileMenu session={session} /> : <SignInButton />}
    </nav>
  );
}
