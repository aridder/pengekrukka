import { expect } from "chai";
import { ethers } from "hardhat";
import { describe, it } from "mocha";
import { getDeployedContract, setupNOKToken } from "./test-utils";

describe("TokenLock", async () => {
  it("should revert with NotSupported() if one the unsupported ERC-20 functions is called", async () => {
    const tokenLock = await getDeployedContract("TokenLock");
    const { config } = await setupNOKToken();

    await expect(
      tokenLock.allowance(config.ME_ADDRESS, config.ME_ADDRESS)
    ).to.be.rejectedWith("NotSupported()");
    await expect(tokenLock.approve(config.ME_ADDRESS, 1000)).to.be.rejectedWith(
      "NotSupported()"
    );
    await expect(tokenLock.transfer(config.ME_ADDRESS, 100)).to.be.rejectedWith(
      "NotSupported()"
    );
    await expect(
      tokenLock.transferFrom(config.ME_ADDRESS, config.ME_ADDRESS, 100)
    ).to.be.rejectedWith("NotSupported()");
  });

  it("sets the owner and stores the provided arguments", async () => {
    const { contract: cbContract } = await setupNOKToken();
    const tokenLock = await getDeployedContract("TokenLock");

    expect(await tokenLock.token()).to.equal(cbContract.address);
    expect(await tokenLock.lockDuration()).to.equal(0);
    expect(await tokenLock.name()).to.equal("MyLock");
    expect(await tokenLock.symbol()).to.equal("ML");
  });

  it("emits a Transfer event", async () => {
    const { config, transfer, contract: nokToken } = await setupNOKToken();

    const tokenLock = await getDeployedContract("TokenLock");

    const [user] = await ethers.getSigners();
    const amount = 10;
    await transfer({
      amount,
      sender: config.WHALE_ADDRESS,
      receiver: user.address,
    });

    await nokToken.connect(user).approve(tokenLock.address, amount);

    await expect(tokenLock.connect(user).deposit(1))
      .to.emit(tokenLock, "Transfer")
      .withArgs(user.address, tokenLock.address, 1);
  });
});
