import { ConnectButton } from "@rainbow-me/rainbowkit";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { useDisconnect } from "wagmi";
import { sites } from "../pages";

export default function Header() {
  const { data: session, status } = useSession();
  const loading = status === "loading";
  const { disconnect } = useDisconnect();

  return (
    <div className="flex flex-row place-content-between bg-blue-600 px-10 py-2">
      <div className="flex flex-row items-start space-x-20 lg:inline-flex lg:h-auto lg:w-auto lg:flex-row">
        {sites.map((site, index) => (
          <Link key={index} href={site.link}>
            <p className="text-l items-center justify-center rounded px-3 py-2 font-bold text-white hover:bg-green-600 hover:text-white lg:inline-flex lg:w-auto ">
              {site.name}
            </p>
          </Link>
        ))}
      </div>
      <ConnectButton />
    </div>
  );
}
