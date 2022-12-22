import { welfareRouter } from "./welfare";
import { router } from "../trpc";
import { doctorRouter } from "./doctor";
import { exampleRouter } from "./example";

export const appRouter = router({
  example: exampleRouter,
  doctor: doctorRouter,
  welfare: welfareRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
