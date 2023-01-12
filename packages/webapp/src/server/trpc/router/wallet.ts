import { schemas, VerifiableCredential } from "../schemas";
import { protectedProcedure, router } from "../trpc";

import { appRouter } from "./_app";

const ensureUserExists = (userdid: string) => {
  if (!database.otherCredentialsDB[userdid]) {
    database.otherCredentialsDB[userdid] = [];
  }
};

const lacksPersonCredential = (userdid: string) => {
  return !database.personalCredentialsDB[userdid];
};

export const walletRouter = router({
  getPersonalCredential: protectedProcedure.input(schemas.userAddressSchema).query(({ ctx }) => {
    const userdid = `did:ethr:${ctx.session.address}`;
    const personalCredential = database.personalCredentialsDB[userdid];
    return personalCredential!!;
  }),
  /**
   * NOTE: This calls folkeregisteret directly to obtain VC.
   * In a real scenario, the wallet would not do this and the VC would come from elsewhere.
   */
  generatePersonalCredential: protectedProcedure
    .input(schemas.userAddressSchema)
    .mutation(async ({ ctx, input }) => {
      const userdid = `did:ethr:${ctx.session.address}`;
      ensureUserExists(userdid);

      if (lacksPersonCredential(userdid)) {
        const personalCredential = await appRouter
          .createCaller(ctx)
          .folkeregisteret.personCredential(input);

        database.personalCredentialsDB[userdid] = personalCredential;
      }
    }),
  list: protectedProcedure.query(async ({ ctx }) => {
    const userdid = `did:ethr:${ctx.session.address}`;

    const otherCredentials = database.otherCredentialsDB[userdid] ?? [];
    const personalCredential: VerifiableCredential = database.personalCredentialsDB[userdid]!!;

    if (personalCredential) {
      return [personalCredential, ...otherCredentials];
    } else {
      return otherCredentials;
    }
  }),
  save: protectedProcedure.input(schemas.verifiableCredential).mutation(async ({ input, ctx }) => {
    const userdid = `did:ethr:${ctx.session.address}`;

    if (input.credentialSubject.id !== userdid) {
      throw new Error("Credential subject does not match user");
    }

    ensureUserExists(userdid);

    (database.otherCredentialsDB[userdid] as VerifiableCredential[]).push(input);

    return input;
  }),
});
