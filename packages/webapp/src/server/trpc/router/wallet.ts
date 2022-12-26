import { VerifiableCredential } from "@pengekrukka/vc-shared";
import { z } from "zod";
import { protectedProcedure, router } from "../trpc";

const validation = z.object({ publicKey: z.string() });
const saveValidation = z.object({
  vc: z.object({
    "@context": z.array(z.string()).or(z.string()),
    type: z.array(z.string()).or(z.string()).optional(),
    issuer: z.string().or(
      z.object({
        id: z.string(),
      })
    ),
    issuanceDate: z.string(),
    credentialSubject: z.object({
      id: z.string().optional(),
    }),
    proof: z.object({
      type: z.string().optional(),
      created: z.string().optional(),
      proofPurpose: z.string().optional(),
      verificationMethod: z.string().optional(),
      jws: z.string().optional(),
    }),
  }),
});

const credentialsTable: VerifiableCredential[] = [];

export const walletRouter = router({
  list: protectedProcedure.input(validation).query(async ({ input, ctx }) => {
    const userdid = `did:ethr:${ctx.session.address}`;

    console.log("userdid", userdid);
    console.log("credentialsTable", credentialsTable);
    const userCredentials = credentialsTable.filter((vc) => vc.credentialSubject.id === userdid);
    console.log("userCredentials", userCredentials);
    return userCredentials;
  }),
  save: protectedProcedure.input(saveValidation).mutation(async ({ input, ctx }) => {
    console.log("user", ctx.session.user);
    const userdid = `did:ethr:${ctx.session.address}`;
    console.log("userdid", userdid);
    console.log("input.vc.credentialSubject.id", input.vc.credentialSubject.id);

    if (input.vc.credentialSubject.id !== userdid) {
      throw new Error("Credential subject does not match user");
    }

    credentialsTable.push(input.vc);
    return input.vc;
  }),
});
