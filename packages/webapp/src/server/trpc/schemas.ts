import { z } from "zod";
import { VerifiableCredentialType } from "./vc-shared";

export type PersonalCredentialSchema = Zod.infer<typeof schemas.personalCredential>;

const didSchema = z.string().startsWith("did:ethr:0x");
const didGoerliSchema = z.string().startsWith("did:ethr:5:0x");

const baseSubjectSchema = z.object({
  id: didSchema.or(didGoerliSchema),
});
/**
 * Our flavour of [Veramo's VerifiableCredential type](https://github.com/uport-project/veramo/blob/a110e96655c940bc8432c040c078a295e5a1fc79/packages/core/src/types/vc-data-model.ts#L98-L104)
 */
const verifiableCredential = z
  .object({
    issuer: z
      .object({
        id: didSchema.or(didGoerliSchema),
      })
      .or(z.string()),
    credentialSubject: baseSubjectSchema,
    type: z.array(z.nativeEnum(VerifiableCredentialType)),
    "@context": z.string().url().array(),
    issuanceDate: z.string(),
    expirationDate: z.string().optional(),
    proof: z.object({
      type: z.string(),
      jwt: z.string(),
    }),
    id: z.string().optional(),
  })
  .strict();

export type VerifiableCredential = z.infer<typeof verifiableCredential>;
export type PersonalCredential = z.infer<typeof personalCredential>;
export type GlassesCredential = z.infer<typeof glassesCredential>;

const personalCredential = verifiableCredential.extend({
  /**TODO: make stricter for personalCredential */
  type: z.array(
    z
      .literal(VerifiableCredentialType.VerifiableCredential)
      .or(z.literal(VerifiableCredentialType.PersonCredential))
  ),
});

const glassesCredential = verifiableCredential.extend({
  type: z.array(
    z
      .literal(VerifiableCredentialType.VerifiableCredential)
      .or(z.literal(VerifiableCredentialType.GlassesProofCredential))
  ),
  credentialSubject: baseSubjectSchema.extend({
    amount: z.number().min(0),
  }),
});

export const schemas = {
  userAddressSchema: z.object({
    publicKey: z.string(),
  }),
  personalCredential,
  verifiableCredential,
  glassesCredential,
};
