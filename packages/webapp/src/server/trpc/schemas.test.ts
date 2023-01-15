import { expect } from "chai";
import { describe, it } from "vitest";
import { ZodObject, ZodRawShape } from "zod";
import { mockPersonCredential } from "../../utils/test-utils";
import { PersonalCredentialSchema, schemas } from "./schemas";

/**
 * Utility function that generates
 * test functions for Zod validations.
 */
const generateTestFunctions = <T extends ZodRawShape>(validator: ZodObject<T, "strict">) => {
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

describe("TRPC utils", () => {
  describe("The validations", () => {
    describe("personal credential validation", () => {
      const { isValidWith, isInvalidWith } = generateTestFunctions(schemas.verifiableCredential);

      it("Does not throw if object conforms to spec", () => {
        isValidWith(mockPersonCredential());
      });

      it("throws irrelevant data", () => {
        isInvalidWith({ a: "a", b: "b" } as any as PersonalCredentialSchema);
      });

      it("throws if did does not start with 'did:ethr'", () => {
        isInvalidWith({
          ...mockPersonCredential(),
          credentialSubject: {
            ...mockPersonCredential().credentialSubject,
            id: "does-not-start-with-did:ethr",
          },
        });
      });

      it("Does not allow extra keys", () => {
        isInvalidWith({
          ...mockPersonCredential(),
          //@ts-expect-error
          extra: "key",
        });
      });
    });
  });
});
