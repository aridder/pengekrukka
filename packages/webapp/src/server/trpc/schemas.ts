import { verifiableCredentialTypes } from "@pengekrukka/vc-shared";
import { z } from "zod";

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
      type: z.enum(verifiableCredentialTypes).array(),
      issuanceDate: z.string(),
    })
    .strict(),
};
