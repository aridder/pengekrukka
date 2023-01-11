import { PersonalCredential, schemas, VerifiableCredential } from "../schemas";
import { protectedProcedure, router } from "../trpc";
import { appRouter } from "./_app";

const otherCredentialsDB: { [key in string]: VerifiableCredential[] } = {};
const personalCredentialsDB: { [key in string]: PersonalCredential } = {};

const ensureUserExists = (userdid: string) => {
  if (!otherCredentialsDB[userdid]) {
    otherCredentialsDB[userdid] = [];
  }
};

const lacksPersonCredential = (userdid: string) => {
  return !personalCredentialsDB[userdid];
};

export const walletRouter = router({
  getPersonalCredential: protectedProcedure.input(schemas.userAddressSchema).query(({ ctx }) => {
    const userdid = `did:ethr:${ctx.session.address}`;
    const personalCredential = personalCredentialsDB[userdid];
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

        personalCredentialsDB[userdid] = personalCredential;
      }
    }),
  list: protectedProcedure.input(schemas.userAddressSchema).query(async ({ input, ctx }) => {
    const userdid = `did:ethr:${ctx.session.address}`;

    const otherCredentials = otherCredentialsDB[userdid] ?? [];
    const personalCredential = personalCredentialsDB[userdid] ?? [];

    return [personalCredential, ...otherCredentials];
  }),
  save: protectedProcedure.input(schemas.verifiableCredential).mutation(async ({ input, ctx }) => {
    const userdid = `did:ethr:${ctx.session.address}`;

    if (input.credentialSubject.id !== userdid) {
      throw new Error("Credential subject does not match user");
    }

    ensureUserExists(userdid);

    (otherCredentialsDB[userdid] as VerifiableCredential[]).push(input);

    return input;
  }),
});
