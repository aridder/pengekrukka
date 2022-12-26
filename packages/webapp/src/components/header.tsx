import { ConnectButton } from "@rainbow-me/rainbowkit";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { useDisconnect } from "wagmi";

export default function Header() {
  const { data: session, status } = useSession();
  const loading = status === "loading";
  const { disconnect } = useDisconnect();

  return (
    <div className="flex flex-row place-content-between bg-blue-600 px-10 py-2">
      <div className="flex flex-row items-start space-x-20 lg:inline-flex lg:h-auto lg:w-auto lg:flex-row">
        <Link href="/">
          <p className="text-l items-center justify-center rounded px-3 py-2 font-bold text-white hover:bg-green-600 hover:text-white lg:inline-flex lg:w-auto ">
            Home
          </p>
        </Link>
        <Link href="/doctor">
          <p className="text-l items-center justify-center rounded px-3 py-2 font-bold text-white hover:bg-green-600 hover:text-white lg:inline-flex lg:w-auto ">
            Doctor
          </p>
        </Link>
        <Link href="/siwe">
          <p className="text-l items-center justify-center rounded px-3 py-2 font-bold text-white hover:bg-green-600 hover:text-white lg:inline-flex lg:w-auto ">
            Siwe
          </p>
        </Link>
      </div>
      <ConnectButton />
    </div>
  );
}
