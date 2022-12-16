import { describe, expect, it } from "vitest";
import { getFakeProvider } from "../../utils/test";
import actions from "./actions";

describe("the authentication actions", () => {
  describe("The login action", () => {
    it("can be called without crashing", () => {
      expect(async () => {
        const provider = getFakeProvider();
        await actions.login(provider);
      }).not.equals(false);
    });

    it("Does use the provider", async () => {
      const provider = getFakeProvider();
      await actions.login(provider);
      expect(provider.getSigner).toHaveBeenCalled();
    });

    it("Does call send with eth_requestAccounts", async () => {
      const provider = getFakeProvider();
      await actions.login(provider);
      expect(provider.send).toHaveBeenCalledWith("eth_requestAccounts", []);
    });

    it("Does call try to get a signer from the provider", async () => {
      const provider = getFakeProvider();
      await actions.login(provider);
      expect(provider.getSigner).toHaveBeenCalled();
    });

    it("Does return a signer", async () => {
      const provider = getFakeProvider();
      const signer = await actions.login(provider);

      expect(signer.getAddress).not.to.be.undefined;
    });
  });
});
