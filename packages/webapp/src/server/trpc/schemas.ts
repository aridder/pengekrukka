import { z } from "zod";
import { VerifiableCredentialType } from "./vc-shared";

export type PersonalCredentialSchema = Zod.infer<typeof schemas.personalCredential>;

const didSchema = z.string().startsWith("did:ethr:0x");

/**
 * Our flavour of [Veramo's VerifiableCredential type](https://github.com/uport-project/veramo/blob/a110e96655c940bc8432c040c078a295e5a1fc79/packages/core/src/types/vc-data-model.ts#L98-L104)
 */
const verifiableCredential = z
  .object({
    issuer: z
      .object({
        id: didSchema,
      })
      .or(z.string()),
    credentialSubject: z.object({
      id: didSchema,
    }),
    type: z.array(z.nativeEnum(VerifiableCredentialType)),
    "@context": z.string().url().array(),
    issuanceDate: z.string(),
    expirationDate: z.string(),
    proof: z.object({
      type: z.string(),
      jwt: z.string(),
    }),
    id: z.string().optional(),
  })
  .strict();

export type VerifiableCredential = z.infer<typeof verifiableCredential>;
export type PersonalCredential = z.infer<typeof personalCredential>;

const personalCredential = verifiableCredential.extend({
  type: z.array(z.literal(VerifiableCredentialType.PersonCredential)),
});

export const schemas = {
  userAddressSchema: z.object({
    publicKey: z.string(),
  }),
  personalCredential,
  verifiableCredential,
};
