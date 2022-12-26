import { router } from "../trpc";
import { doctorRouter } from "./doctor";
import { welfareRouter } from "./welfare";

export const appRouter = router({
  doctor: doctorRouter,
  welfare: welfareRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
