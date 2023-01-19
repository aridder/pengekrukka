import { DetailedHTMLProps, HTMLAttributes } from "react";
import { BalanceList } from "../BalanceList";
import Wallet from "../Wallet";

type Props = DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>

export default function Layout(props: Props) {
  return (
    <div className="flex flex-col h-screen justify-between">
      <div className={`flex h-auto w-auto flex-row justify-between ${props.className}`}>
        <div className="h-auto w-4/5">
          <div className="m-10 mx-auto max-w-xl justify-center gap-4">{props.children}</div>
        </div>
        <div className="h-screen w-1/5">
          <Wallet />
        </div>
      </div>
      <div className="h-10"><BalanceList /></div>
    </div>
  );
}
