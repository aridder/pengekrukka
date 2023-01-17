import { expect } from "chai";
import { faker } from "@faker-js/faker";
import { describe, it } from "vitest";
import { encryption } from "./encryption";
import EthCrypto from "eth-crypto"

const alice = EthCrypto.createIdentity();
const bob = EthCrypto.createIdentity();

describe("Encryption functions", () => {
  describe("Encryption", () => {
    it("Can be called without throwing", () => {
      expect(async () => {
        await encryption.encrypt({ message: "secret message shh", receiverPublicKey: alice.publicKey, senderPrivateKye: bob.privateKey });
      }).not.to.throw();
    });

    it("Returns an indecipherable string", async () => {
        const message = "a secret message"
        const result = await encryption.encrypt({message, receiverPublicKey: alice.publicKey, senderPrivateKye: bob.privateKey})

        expect(result).not.to.contain(message)
    })
  });

  describe("Decryption", () => {

    it("Returns the same message", async () => {
        const message = faker.lorem.paragraph(1)
        const encryptedString = await encryption.encrypt({message, receiverPublicKey: alice.publicKey, senderPrivateKye: bob.privateKey})

        const decrypted = await encryption.decrypt({
            encryptedString, 
            receiverPrivateKey: alice.privateKey, 
            senderPublicKey: bob.publicKey
        })

        expect(decrypted).to.equal(message);
    })
  })
});
