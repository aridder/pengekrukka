import { faker } from "@faker-js/faker";
import { beforeAll, describe, expect, it } from "vitest";
import {
  fakeDid,
  mockAnyCredential,
  mockGlassesCredential,
  mockPersonCredential,
} from "../../../../utils/test-utils";
import { VerifiableCredentialType } from "../../vc-shared";
import { database } from "./database";

describe("Database implementation", () => {
  beforeAll(() => {
    database.resetDatabase();
  });

  const persistRandom = (
    userId = fakeDid(),
    mocker = mockAnyCredential,
    n = faker.datatype.number({ min: 1, max: 10 })
  ) => {
    const credentials = new Array(n)
      .fill(null)
      .map(() => mocker())
      .map((credential) => database.upsert(userId, credential));

    return { userId, credentials };
  };

  describe("Listing content", () => {
    it("returns an array", () => {
      const result = database.list(fakeDid());
      expect(result).to.toEqual([]);
    });

    it("returns objects after they're persisted", () => {
      const { credentials, userId } = persistRandom();
      const result = database.list(userId);

      expect(result?.length).toBeGreaterThan(0);
      expect(result?.length).to.be.equal(credentials.length);
    });
  });

  describe("getPersonalCredential", () => {
    it("returns a personal credential", () => {
      const { userId } = persistRandom(fakeDid(), mockPersonCredential);

      const retrieved = database.getPersonalCredential(userId);
      expect(retrieved?.type.includes(VerifiableCredentialType.PersonCredential)).to.be.true;
    });

    it("does not return other credentials", () => {
      const { userId } = persistRandom(fakeDid(), mockGlassesCredential);
      const retrieved = database.getPersonalCredential(userId);
      expect(retrieved).to.be.null;
    });
  });

  describe("resetDatabase", () => {
    it("removes previously added data", () => {
      const { userId } = persistRandom();
      const resultBefore = database.list(userId);

      expect(resultBefore?.length).toBeGreaterThan(0);

      database.resetDatabase();

      const resultAfter = database.list(userId);
      expect(resultAfter).to.have.lengthOf(0);
    });
  });
});
