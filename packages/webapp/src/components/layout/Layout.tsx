import Wallet from "../Wallet";

interface Props {
  children: React.ReactNode;
}

export default function Layout({ children }: Props) {
  return (
    <>
      <div className="flex h-full w-full flex-row justify-between">
        <div className="h-full w-4/5">
          <div className="m-10 mx-auto max-w-xl justify-center gap-4">{children}</div>
        </div>
        <div className="h-screen w-1/5">
          <Wallet />
        </div>
      </div>
    </>
  );
}
