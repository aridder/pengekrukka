import { opticianRouter } from "./optician";
import { router } from "../trpc";
import { doctorRouter } from "./doctor";
import { folkeregisteretRouter } from "./folkeregisteret";
import { walletRouter } from "./wallet";
import { welfareRouter } from "./welfare";

export const appRouter = router({
  folkeregisteret: folkeregisteretRouter,
  doctor: doctorRouter,
  welfare: welfareRouter,
  wallet: walletRouter,
  optician: opticianRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
