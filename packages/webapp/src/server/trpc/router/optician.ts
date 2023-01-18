import { VCConfig } from "./../vc-shared";
import buildGroth16 from "websnark/src/groth16";
import { Groth16 } from "websnark/src/groth16";
import { faker } from "@faker-js/faker";
import { TRPCError } from "@trpc/server";
import { sign } from "crypto";
import { ethers } from "ethers";
import { z } from "zod";
import { addDidPrefix } from "../../../utils";
import { getConfig } from "../../../utils/config";
import { withdraw } from "../../blockchain/blockchain";
import { encryption } from "../../blockchain/encryption";
import { getNokTokenFor, getTornadoContractFor } from "../../blockchain/tornado";
import { schemas, WelfareCredential } from "../schemas";
import { protectedProcedure, router } from "../trpc";
import { generateVC, OpticianName, VerifiableCredentialType } from "../vc-shared";
import build from "next/dist/build";
import { LogDescription } from "ethers/lib/utils.js";

/**
 * NOTE: amount and optician are not used in this hackathon implementaiton.
 * The amount is fixed to 1,- NOK in the contract in order to not overspend the test account
 * Optician is always HANSENS_BRILLEFORETNING.
 */
const withdrawWelfareMoney = async (encryptedNote: string, config: VCConfig) => {
  const signer = ethers.Wallet.fromMnemonic(config.mnemonic).connect(
    new ethers.providers.JsonRpcProvider(process.env.RUNTIME_RPC_NODE as string)
  );
  console.log("Signer address:", await signer.getAddress());
  console.log("Signer private key:", signer.privateKey);
  const contract = getTornadoContractFor(signer);
  const nokContract = getNokTokenFor(signer);
  const opticianPublicKey = ethers.Wallet.fromMnemonic(
    process.env.WELFARE_MNEMONIC as string
  ).publicKey.slice(2);

  //TODO: In a real scenario, this server would not have access to the mnenomic, and would have to get the public key elsewhere
  const opticianPrivateKey = signer.privateKey;
  const decrypted = await encryption.decrypt({
    encryptedString: encryptedNote,
    receiverPrivateKey: opticianPrivateKey,
    senderPublicKey: opticianPublicKey,
  });

  const result = await withdraw(
    contract,
    decrypted,
    await signer.getAddress(),
    await buildGroth16()
  );
  return result;
};

export const opticianRouter = router({
  convertWelfareToken: protectedProcedure
    .input(z.object({ credential: schemas.welfareCredential }))
    .mutation(async ({ input: { credential }, ctx }) => {
      const secret = credential.credentialSubject.tornadoNote;
      const config = getConfig("OPTICIAN_MNEMONIC");
      const res = await withdrawWelfareMoney(secret, config);
      console.log("Withdraw result:", res);
      return res;
    }),
});
