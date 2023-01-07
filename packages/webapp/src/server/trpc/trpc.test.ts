import { faker } from "@faker-js/faker";
import { expect } from "chai";
import { describe, it } from "vitest";
import Zod, { ZodObject, ZodRawShape } from "zod";
import { schemas } from "./trpc";

/**
 * Utility function that generates
 * test functions for Zod validations.
 */
const generateTestFunctions = <T extends ZodRawShape>(validator: ZodObject<T>) => {
  const isInvalidWith = (data: unknown) => {
    expect(() => {
      validator.parse(data);
    }).to.throw();
  };

  const isValidWith = (data: unknown) => {
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

      const valid: () => Zod.infer<typeof schemas.personalCredential> = () => ({
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
        isInvalidWith({ a: "a", b: "b" });
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
          produces: "Not A Credential Type",
        });
      });

      it("Accepts an empty array for 'requires'", () => {
        isValidWith({
          ...valid(),
          requires: [],
        });
      });

      it("Accepts a list of requirements conforming to spec", () => {
        isValidWith({
          ...valid(),
          requires: [
            {
              type: "credential",
              issuer: fakeDid(),
              credential: "credential",
            },
            {
              type: "credential",
              issuer: fakeDid(),
              credential: "credential",
            },
            {
              type: "credential",
              issuer: fakeDid(),
              credential: "credential",
            },
          ],
        });
      });

      it.only("Does not accept a list of requirements with irrelevant data", () => {
        isInvalidWith({
          ...valid(),
          requires: [{ irrelevant: "data" }],
        });
      });
    });
  });
});
