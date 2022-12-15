import { z } from "zod";
import { publicProcedure, router } from "../trpc";

//TODO: the type accessible with ._type with frontend
const validation = z.object({ publicKey: z.string() });

export const eidsivaRouter = router({
  getUsageVC: publicProcedure.input(validation).query(async ({ input }) => {
    return {
      vc: await generateVC(input.publicKey),
    };
  }),
});
