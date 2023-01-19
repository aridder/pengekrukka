import React, { useEffect } from "react";
import { trpc } from "../utils/trpc";

type Balance = { address: string; displayName: string; balance: number };
const Card = (props: Balance) => (
  <div className="m-2 w-auto rounded-md border border-black shadow-md">
    <h3>{props.displayName}</h3>
    <p>{props.balance}</p>
    <p>{props.address}</p>
  </div>
);

export const BalanceList = () => {
  const utils = trpc.useContext();
  const [balances, setBalances] = React.useState<Balance[]>([]);

  const updateBalances = async () => {
    const balances = await utils.client.balanceRouter.list.query();
    setBalances(balances);
  };

  /** Polling for backend updates.
   * TODO: listen with websockets
   */
  useEffect(() => {
    const id = setInterval(() => {
      updateBalances();
    }, 2000);

    return () => clearInterval(id);
  }, []);

  return (
    <>
      <h2 className="text-center text-3xl m-3 underline">Jukselapp for kontoer</h2>

      <div className="m-auto flex max-w-screen-lg flex-wrap justify-evenly">
        {balances.map((balance) => (
          <Card key={balance.address} {...balance} />
        ))}
      </div>
    </>
  );
};
