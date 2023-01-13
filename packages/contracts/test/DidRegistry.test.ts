import { expect } from "chai";
import { Resolver } from "did-resolver";
import { formatBytes32String, toUtf8Bytes } from "ethers/lib/utils";
import { getResolver } from "ethr-did-resolver";
import { ethers } from "hardhat";
import { EthereumDIDRegistry } from "../typechain-types/contracts/EthereumDIDRegistry";
import { getDeployedContract } from "./test-utils";

describe("EthereumDIDRegistry", async () => {
  const didRegistry = (await getDeployedContract("EthereumDIDRegistry")) as EthereumDIDRegistry;

  describe("Check owner", async () => {
    it("can access both accounts", async () => {
      const [owner] = await ethers.getSigners();
      const ownerIdentityOwner = await didRegistry.identityOwner(owner.address);
      expect(ownerIdentityOwner).to.equal(owner.address);
    });
  });

  describe("Did resolver", async () => {
    it("add service with addAttribute should reflect in did document from resolver", async () => {
      const [owner, u1] = await ethers.getSigners();
      const providerConfig = {
        networks: [
          {
            name: "private",
            registry: didRegistry.address,
            provider: ethers.provider,
          },
        ],
      };

      // getResolver will return an object with a key/value pair of { "ethr": resolver } where resolver is a function used by the generic did resolver.
      const ethrDidResolver = getResolver(providerConfig);
      const didResolver = new Resolver(ethrDidResolver);

      const resolved = await didResolver.resolve(`did:ethr:private:${u1.address}`);

      expect(resolved.didDocument?.service).to.be.undefined;

      const setAttributeTx = await didRegistry
        .connect(u1)
        .setAttribute(
          u1.address,
          formatBytes32String("did/svc/identitet"),
          toUtf8Bytes("https://folkeregisteret.no/identitet"),
          10000000
        );

      const res = await setAttributeTx.wait();

      const resolvedAfter = await didResolver.resolve(`did:ethr:private:${u1.address}`);
      expect(resolvedAfter.didDocument!.service!.length).to.equal(1);
      expect(resolvedAfter.didDocument!.service![0].type).to.equal("identitet");
      expect(resolvedAfter.didDocument!.service![0].serviceEndpoint).to.equal("https://folkeregisteret.no/identitet");
    });
  });
});
