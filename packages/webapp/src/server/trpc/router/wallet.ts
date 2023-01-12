import { schemas, VerifiableCredential } from "../schemas";
import { protectedProcedure, router } from "../trpc";

const credentialsTable: VerifiableCredential[] = [];

export const walletRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    const userdid = `did:ethr:${ctx.session.address}`;

    const userCredentials = credentialsTable.filter((vc) => vc.credentialSubject.id === userdid);
    return userCredentials;
  }),
  save: protectedProcedure.input(schemas.verifiableCredential).mutation(async ({ input, ctx }) => {
    const userdid = `did:ethr:${ctx.session.address}`;

    if (input.credentialSubject.id !== userdid) {
      throw new Error("Credential subject does not match user");
    }

    credentialsTable.push(input);
    return input;
  }),
});
