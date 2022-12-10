import { router } from "../trpc";
import { eidsivaRouter } from "./eidsiva";
import { exampleRouter } from "./example";

export const appRouter = router({
  example: exampleRouter,
  eidsiva: eidsivaRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
