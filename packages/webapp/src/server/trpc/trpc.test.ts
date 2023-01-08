import { faker } from "@faker-js/faker";
import { expect } from "chai";
import { describe, it } from "vitest";
import Zod, { ZodObject, ZodRawShape } from "zod";
import { schemas } from "./trpc";

//THINKABOUT: use in rest of codebase as the "main type"?
type PersonalCredentialSchema = Zod.infer<typeof schemas.personalCredential>;

/**
 * Utility function that generates
 * test functions for Zod validations.
 */
const generateTestFunctions = <T extends ZodRawShape>(validator: ZodObject<T>) => {
  const isInvalidWith = (data: PersonalCredentialSchema) => {
    expect(() => {
      validator.parse(data);
    }).to.throw();
  };

  const isValidWith = (data: PersonalCredentialSchema) => {
    expect(() => {
      validator.parse(data);
    }).not.to.throw();
  };

  return { isInvalidWith, isValidWith };
};

const fakeDid = () => `did:ethr:${faker.finance.ethereumAddress()}`;

describe("TRPC utils", () => {
  describe("The validations", () => {
    describe("personal credential validation", () => {
      const { isValidWith, isInvalidWith } = generateTestFunctions(schemas.personalCredential);

      const valid: () => PersonalCredentialSchema = () => ({
        did: fakeDid(),
        service: {
          host: faker.internet.url(),
          base: "/journal",
          produces: "GlassesProofCredential",
          requires: [
            {
              type: "credential",
              issuer: fakeDid(),
              credential: "PersonCredential",
            },
          ],
        },
      });

      it("Does not throw if object conforms to spec", () => {
        isValidWith(valid());
      });

      it("throws irrelevant data", () => {
        isInvalidWith({ a: "a", b: "b" } as any as PersonalCredentialSchema);
      });

      it("throws if did does not start with 'did:ethr'", () => {
        isInvalidWith({
          ...valid(),
          did: "does-not-start-with-did:ethr",
        });
      });

      it("throws if produces is not a verifiable credential type", () => {
        isInvalidWith({
          ...valid(),
          service: {
            ...valid().service,
            produces: "Not A Credential Type",
          },
        } as any as PersonalCredentialSchema);
      });

      it("Accepts an empty array for 'requires'", () => {
        isValidWith({
          ...valid(),
          service: {
            ...valid().service,
            requires: [],
          },
        });
      });

      it("Accepts a list of requirements conforming to spec", () => {
        isValidWith({
          ...valid(),
          service: {
            ...valid().service,
            requires: [
              {
                type: "credential",
                issuer: fakeDid(),
                credential: "GlassesProofCredential",
              },
              {
                type: "credential",
                issuer: fakeDid(),
                credential: "VerifiableCredential",
              },
              {
                type: "credential",
                issuer: fakeDid(),
                credential: "WelfareCredential",
              },
            ],
          },
        });
      });

      it("Does not accept a list of requirements with irrelevant data", () => {
        isInvalidWith({
          ...valid(),
          service: {
            ...valid().service,
            requires: [{ irrelevant: "data" }],
          },
        } as any as PersonalCredentialSchema);
      });
    });
  });
});
