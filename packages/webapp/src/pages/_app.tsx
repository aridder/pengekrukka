import { AppProps } from "next/app";

import { trpc } from "../utils/trpc";

import { getDefaultWallets, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import {
  GetSiweMessageOptions,
  RainbowKitSiweNextAuthProvider,
} from "@rainbow-me/rainbowkit-siwe-next-auth";
import { Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { configureChains, createClient, goerli, WagmiConfig } from "wagmi";
import { alchemyProvider } from "wagmi/providers/alchemy";
import "../styles/globals.css";

export const { chains, provider } = configureChains(
  [goerli],
  [alchemyProvider({ apiKey: "a5_qQXElDGIyQok3JxHKzn9sfpjvJ4P2" })]
);

const { connectors } = getDefaultWallets({
  appName: "Pengekrukka",
  chains,
});

const client = createClient({
  connectors,
  autoConnect: true,
  provider,
});

const getSiweMessageOptions: GetSiweMessageOptions = () => ({
  statement: "Sign in to Pengekrukka",
});

const MyApp = ({
  Component,
  pageProps,
}: AppProps<{
  session: Session;
}>) => {
  return (
    <WagmiConfig client={client}>
      <SessionProvider session={pageProps.session} refetchInterval={0}>
        <RainbowKitSiweNextAuthProvider
          getSiweMessageOptions={getSiweMessageOptions}
        >
          <RainbowKitProvider chains={chains}>
            <Component {...pageProps} />
          </RainbowKitProvider>
        </RainbowKitSiweNextAuthProvider>
      </SessionProvider>
    </WagmiConfig>
  );
};

export default trpc.withTRPC(MyApp);
