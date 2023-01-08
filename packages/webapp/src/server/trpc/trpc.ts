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

export type PersonalCredentialSchema = Zod.infer<typeof schemas.personalCredential>;

const didSchema = z.string().startsWith("did:ethr:0x");
export const schemas = {
  userAddressSchema: z.object({
    publicKey: z.string(),
  }),
  personalCredential: z
    .object({
      credentialSubject: z
        .object({
          id: didSchema,
        })
        .passthrough(),
      "@context": z.string().url().array(),
      issuer: z.object({
        id: didSchema,
      }),
      proof: z.object({
        type: z.string(),
        jwt: z.string(),
      }),
      type: z.enum(verifiableCredentialTypes),
      issuanceDate: z.string(),
    })
    .strict(),
};

export const router = t.router;

export const publicProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(isAuthed);
