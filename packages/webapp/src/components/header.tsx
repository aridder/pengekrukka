import { ConnectButton } from "@rainbow-me/rainbowkit";

export default function Header() {
  return (
    <div className="flex flex-row place-content-between bg-blue-600 px-10 py-2">
      <div className="flex flex-row items-start space-x-20 lg:inline-flex lg:h-auto lg:w-auto lg:flex-row"></div>
      <ConnectButton />
    </div>
  );
}
