import { DetailedHTMLProps, HTMLAttributes } from "react";
import Wallet from "../Wallet";

type Props = DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>

export default function Layout(props: Props) {
  return (
    <>
      <div className={`flex h-full w-full flex-row justify-between ${props.className}`}>
        <div className="h-full w-4/5">
          <div className="m-10 mx-auto max-w-xl justify-center gap-4">{props.children}</div>
        </div>
        <div className="h-screen w-1/5">
          <Wallet />
        </div>
      </div>
    </>
  );
}
