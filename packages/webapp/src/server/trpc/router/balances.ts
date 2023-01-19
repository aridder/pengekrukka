import { faker } from "@faker-js/faker";
import { PersonalCredential, schemas } from "../schemas";
import { protectedProcedure, router } from "../trpc";
import { database } from "./database/database";
import { appRouter } from "./_app";

type Balance = { address: string; displayName: string; balance: number };

const address1 = faker.finance.ethereumAddress();
const address2 = faker.finance.ethereumAddress();
const address3 = faker.finance.ethereumAddress();
const address4 = faker.finance.ethereumAddress();

export const balanceRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    const MOCKS: Balance[] = [
      { address: address1, displayName: "MOCK ACCOUNT 1", balance: faker.datatype.number({min: 0, max: 10}) },
      { address: address2, displayName: "MOCK ACCOUNT 2", balance: faker.datatype.number({min: 0, max: 10}) },
      { address: address3, displayName: "MOCK ACCOUNT 3", balance: faker.datatype.number({min: 0, max: 10}) },
      { address: address4, displayName: "MOCK ACCOUNT 4", balance: faker.datatype.number({min: 0, max: 10}) },
    ];
    return MOCKS;
  }),
});
