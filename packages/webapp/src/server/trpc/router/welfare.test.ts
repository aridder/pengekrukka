import { faker } from "@faker-js/faker";
import { describe, expect, it } from "vitest";
import { addDidPrefix } from "../../../utils";
import { getAPICaller, mockGlassesCredential, withIssuerEnv } from "../../../utils/test-utils";

describe("the welfare router", async () => {
  it(
    "can be called without throwing",
    withIssuerEnv({}, async () => {
      const address = faker.finance.ethereumAddress() as `0x${string}`;
      const caller = getAPICaller(address);
      await caller.welfare.convertWelfareToken({
        ...mockGlassesCredential(),
        credentialSubject: {
          id: addDidPrefix(address),
          needsGlasses: true,
        },
      });
    })
  );

  it(
    "throws an error if user is not the owner of the certificate",
    withIssuerEnv({}, async () => {
      const firstAddress = faker.finance.ethereumAddress();
      const secondAddress = faker.finance.ethereumAddress();

      expect(firstAddress).not.to.equal(secondAddress);

      const caller = getAPICaller(firstAddress);
      await expect(
        caller.welfare.convertWelfareToken({
          ...mockGlassesCredential(),
          credentialSubject: {
            id: secondAddress,
            needsGlasses: true,
          },
        })
      ).rejects.toThrow();
    })
  );

  it(
    "does return a VC on valid request",
    withIssuerEnv({}, async () => {
      const publicKey = "0x123";

      const caller = getAPICaller(publicKey);
      const response = await caller.welfare.convertWelfareToken({
        ...mockGlassesCredential(),
        credentialSubject: {
          id: addDidPrefix(publicKey),
          needsGlasses: true,
        },
      });
      expect(response.proof).not.to.be.null;
      expect(response.credentialSubject).not.to.be.undefined;
    })
  );
});
