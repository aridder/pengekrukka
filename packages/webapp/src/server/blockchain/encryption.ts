import EthCrypto from "eth-crypto";

const encrypt = async (options: {
  message: string;
  receiverPublicKey: string;
  senderPrivateKye: string;
}) => {
  const signature = EthCrypto.sign(
    options.senderPrivateKye,
    EthCrypto.hash.keccak256(options.message)
  );
  const payload = {
    message: options.message,
    signature,
  };
  const encrypted = await EthCrypto.encryptWithPublicKey(
    options.receiverPublicKey,
    JSON.stringify(payload)
  );

  const encryptedString = EthCrypto.cipher.stringify(encrypted);
  return encryptedString;
};

const decrypt = async (options: {
  encryptedString: string;
  senderPublicKey: string;
  receiverPrivateKey: string;
}) => {
  const encryptedObject = EthCrypto.cipher.parse(options.encryptedString);

  const decrypted = await EthCrypto.decryptWithPrivateKey(
    options.receiverPrivateKey,
    encryptedObject
  );
  const decryptedPayload = JSON.parse(decrypted);

  // check signature
  const senderAddress = EthCrypto.recoverPublicKey(
    decryptedPayload.signature,
    EthCrypto.hash.keccak256(decryptedPayload.message)
  );

  //TODO verify sender address against sender public key

  return decryptedPayload.message;
};

export const encryption = {
  encrypt,
  decrypt,
};
