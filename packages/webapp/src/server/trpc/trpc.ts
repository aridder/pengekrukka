import { verifiableCredentialTypes } from "@pengekrukka/vc-shared";
import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { z } from "zod";

import { type Context } from "./context";

const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter({ shape }) {
    return shape;
  },
});

const isAuthed = t.middleware(({ next, ctx }) => {
  if (!ctx.session?.user?.name || !("address" in ctx.session)) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
    });
  }
  return next({
    ctx: {
      // Infers the `session` as non-nullable
      session: ctx.session,
    },
  });
});

const ethereumDid = z.string().startsWith("did:ethr:0x");
const credentialType = z.enum(verifiableCredentialTypes);

//TODO: the type accessible with ._type with frontend

export const schemas = {
  personalCredential: z.object({
    did: ethereumDid,
    service: z.object({
      host: z.string().url(),
      base: z.string().startsWith("/"),
      produces: credentialType,
      requires: z.array(
        z.object({
          type: z.enum(["credential", "token"] as const),
          issuer: ethereumDid,
          credential: credentialType,
        })
      ),
    }),
  }),
};

export const router = t.router;

export const publicProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(isAuthed);
