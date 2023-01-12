import { PersonalCredential, schemas } from "../schemas";
import { protectedProcedure, router } from "../trpc";
import { database } from "./database/database";
import { appRouter } from "./_app";

export const walletRouter = router({
  /**
   * NOTE: In additoin to retrieving the PersonCredentia, this also calls folkeregisteret
   * directly to generate it if it is not present.
   * In a real scenario, the wallet would not do this and the VC would come from elsewhere.
   */
  getPersonalCredential: protectedProcedure
    .input(schemas.userAddressSchema)
    .query(async ({ ctx, input }) => {
      const userdid = `did:ethr:${ctx.session.address}`;
      const personalCredential = database.getPersonalCredential(userdid);

      if (personalCredential == null) {
        const newPersonalCredential: PersonalCredential = await appRouter
          .createCaller(ctx)
          .folkeregisteret.personCredential({ publicKey: input.publicKey });

        database.upsert(userdid, newPersonalCredential);
        return newPersonalCredential;
      } else {
        return personalCredential;
      }
    }),
  list: protectedProcedure.input(schemas.userAddressSchema).query(async ({ input, ctx }) => {
    const userdid = `did:ethr:${ctx.session.address}`;
    return database.list(userdid);
  }),
  save: protectedProcedure.input(schemas.verifiableCredential).mutation(async ({ input, ctx }) => {
    const userdid = `did:ethr:${ctx.session.address}`;

    if (input.credentialSubject.id !== userdid) {
      throw new Error("Credential subject does not match user");
    }

    database.upsert(userdid, input);

    return input;
  }),
});
