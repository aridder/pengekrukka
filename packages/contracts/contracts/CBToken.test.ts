import { faker } from "@faker-js/faker";
import { expect } from "chai";
import { setupNOKToken } from "./test-utils";

describe("CBContract", async () => {
  it("setup", async () => {
    const { getBalance, transfer, config } = await setupNOKToken();

    describe("Transfer", () => {
      it("can access both accounts", async () => {
        const [myAccount, whaleAccount] = await getBalance(
          config.ME_ADDRESS,
          config.WHALE_ADDRESS
        );
        expect(myAccount).not.to.be.undefined;
        expect(whaleAccount).not.to.be.undefined;
      });

      it("decreases sender balance when transferring", async () => {
        const [before] = await getBalance(config.WHALE_ADDRESS);

        const amount = faker.datatype.number();
        await transfer({
          amount,
          sender: config.WHALE_ADDRESS,
          receiver: config.ME_ADDRESS,
        });

        const [after] = await getBalance(config.WHALE_ADDRESS);

        expect(after).to.equal(before - amount);
      });

      it("increases the receiver balance when transferring", async () => {
        const [before] = await getBalance(config.ME_ADDRESS);

        const amount = faker.datatype.number();
        await transfer({
          amount,
          sender: config.WHALE_ADDRESS,
          receiver: config.ME_ADDRESS,
        });

        const [after] = await getBalance(config.ME_ADDRESS);

        expect(after).to.equal(before + amount);
      });

      it("Does not transfer if sender does not have the funds available", async () => {
        const [meBefore, whaleBefore] = await getBalance(
          config.ME_ADDRESS,
          config.WHALE_ADDRESS
        );
        expect(
          transfer({
            amount: meBefore + 1, //i.e. more than is available
            sender: config.ME_ADDRESS,
            receiver: config.WHALE_ADDRESS,
          })
        ).rejectedWith(Error);

        const [meAfter, whaleAfter] = await getBalance(
          config.ME_ADDRESS,
          config.WHALE_ADDRESS
        );

        //i.e. no change
        expect(meAfter).equal(meBefore);
        expect(whaleAfter).equal(whaleBefore);
      });
    });
  });
});
