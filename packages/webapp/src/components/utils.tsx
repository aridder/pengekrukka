import { useEffect, useState } from "react";

/**
 * Wraps components that are only meant to be rendered on client
 * side. Needed because NextJS's rendering strategy and wagmi
 * are incompatible.
 *
 * Problem is explained in- and the code is adapted from
 * [this article](https://codingwithmanny.medium.com/understanding-hydration-errors-in-nextjs-13-with-a-web3-wallet-connection-8155c340fbd5)
 *
 */
export function ClientOnly({ children }: { children: React.ReactNode }) {
  // State / Props
  const [hasMounted, setHasMounted] = useState(false);

  // Hooks
  useEffect(() => {
    setHasMounted(true);
  }, []);

  // Render
  if (!hasMounted) return null;

  return <div>{children}</div>;
}
