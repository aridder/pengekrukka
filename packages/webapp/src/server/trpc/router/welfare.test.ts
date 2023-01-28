import { faker } from "@faker-js/faker";
import { describe, expect, it } from "vitest";
import { addDidPrefix } from "../../../utils";
import { getAPICaller, mockGlassesCredential, withIssuerEnv } from "../../../utils/test-utils";
import { OpticianName } from "../vc-shared";
import { calculateGlassesVoucherAmount } from "./welfare";

describe("the welfare router", async () => {
  it(
    "can be called without throwing",
    withIssuerEnv({}, async () => {
      const address = faker.finance.ethereumAddress() as `0x${string}`;
      const caller = getAPICaller(address);
      await caller.welfare.convertWelfareToken({
        credential: {
          ...mockGlassesCredential(),
          credentialSubject: {
            id: addDidPrefix(address),
            needsGlasses: true,
          },
        },
        optician: OpticianName.Specsavers,
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
          credential: {
            ...mockGlassesCredential(),
            credentialSubject: {
              id: secondAddress,
              needsGlasses: true,
            },
          },
          optician: OpticianName.TestOptician,
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
        credential: {
          ...mockGlassesCredential(),
          credentialSubject: {
            id: addDidPrefix(publicKey),
            needsGlasses: true,
          },
        },
        optician: OpticianName.Brilleland,
      });
      expect(response.proof).not.to.be.null;
      expect(response.credentialSubject).not.to.be.undefined;
    })
  );

  describe("the calculation of welfare amount", () => {
    it("Does return a number", () => {
      const result = calculateGlassesVoucherAmount(100);
      expect(typeof result).to.be.equal("number");
    });

    function testRange(options: { from: number; to: number; expected: number }) {
      it(`Returns ${options.expected},- for incomes between ${options.from} and ${options.to}`, () => {
        for (let income = options.from; income < options.from; income += 10) {
          const result = calculateGlassesVoucherAmount(income);
          expect(result).to.be.equal(options.expected);
        }
      });
    }

    [
      { from: 0, to: 200_000, expected: 2000 },
      { from: 600_000, to: 800_000, expected: 500 },
      { from: 800_000, to: 5_000_000, expected: 250 },
      { from: 200_000, to: 600_000, expected: 500 },
    ].map(testRange);
  });
});
