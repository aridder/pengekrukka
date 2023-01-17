import { faker } from "@faker-js/faker";
import { TestContext, TestFunction } from "vitest";
import { appRouter } from "../server/trpc/router/_app";
import {
  GlassesProofCredential,
  PersonalCredential,
  VerifiableCredential,
} from "../server/trpc/schemas";
import { VerifiableCredentialType } from "../server/trpc/vc-shared";
import { MnemonicConfig } from "./config";

const envKeys = [...MnemonicConfig, "RUNTIME_RPC_NODE", "FORKING_RPC_NODE", "BASE_URL"] as const;
type TestEnvironment = { [key in typeof envKeys[number]]: string };

export const withIssuerEnv =
  (overrides: Partial<TestEnvironment>, action: TestFunction) => async (context: TestContext) => {
    const config: TestEnvironment = {
      WELFARE_MNEMONIC:
        "method salon soft whip predict develop shift misery wild exhibit anger curve",
      DOCTOR_MNEMONIC:
        "engage impulse federal index journey muffin hunt recall smile amateur betray sport",
      OPTICIAN_MNEMONIC:
        "naive apple embrace two gossip current crucial ivory typical toe walk canal",
      FREDRIK_MNEMONIC:
        "gauge swift critic choose churn message avoid dust drive inherit wrestle steel",
      FOLKEREGISTERET_MNEMONIC:
        "gauge swift critic choose churn message avoid dust drive inherit wrestle steel",
      RUNTIME_RPC_NODE: "https://eth-goerli.g.alchemy.com/v2/MpVc6bA01dS6MQbdBpqMA9fHxrGyYKQT",
      FORKING_RPC_NODE: "https://eth-goerli.g.alchemy.com/v2/MpVc6bA01dS6MQbdBpqMA9fHxrGyYKQT",
      BASE_URL: "http://localhost:3000",
      ...overrides,
    };

    const original = process.env;
    for (const key of envKeys) {
      process.env[key] = config[key];
    }

    await action(context);
    process.env = original;
  };

export const getAPICaller = (address: string = "default-address-from-tests") =>
  appRouter.createCaller({
    session: {
      address: address,
      expires: "never",
      user: {
        name: "test",
        email: "",
      },
    } as any,
  });

export const fakeDid = () => `did:ethr:0x${faker.finance.ethereumAddress()}`;

const random = <T>(array: T[]): T => {
  const index = Math.floor(Math.random() * array.length);
  const value = array[index];

  return value as T;
};

const randomCredentialType = () => {
  const possible = Array.from(Object.values(VerifiableCredentialType));
  return random(possible);
};

export const mockAnyCredential = (subjectId = fakeDid()): VerifiableCredential => ({
  credentialSubject: {
    id: subjectId,
  },
  "@context": [faker.internet.url()],
  issuer: {
    id: fakeDid(),
  },
  proof: {
    type: "proof2020",
    jwt: faker.datatype.uuid(),
  },
  type: [randomCredentialType(), randomCredentialType()],
  expirationDate: faker.date.soon().toISOString(),
  issuanceDate: faker.date.recent().toISOString(),
});

export const mockPersonCredential = (subjectId: string = fakeDid()): PersonalCredential => ({
  ...mockAnyCredential(subjectId),
  type: [VerifiableCredentialType.PersonCredential, VerifiableCredentialType.VerifiableCredential],
  credentialSubject: {
    ...mockAnyCredential(subjectId).credentialSubject,
    ssn: faker.datatype.uuid(),
    income: {
      amount: faker.datatype.number({ min: 0, max: 5_000_000 }),
      currency: "NOK",
    },
  },
});

export const mockGlassesCredential = (subjectId = fakeDid()): GlassesProofCredential => ({
  ...mockAnyCredential(subjectId),
  credentialSubject: {
    id: mockAnyCredential().credentialSubject.id,
    needsGlasses: true,
  },
  type: [
    VerifiableCredentialType.GlassesProofCredential,
    VerifiableCredentialType.VerifiableCredential,
  ],
});
