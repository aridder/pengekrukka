export const shortenDid = (did: string) => {
  return did.slice(0, 15) + "..." + did.slice(did.length - 4, did.length);
};

export const addDidPrefix = (publicKey: `0x${string}`): `did:ethr:0x${string}` =>
  `did:ethr:${publicKey}`;

export const toReadableDate = (date: string) => {
  const dateObj = new Date(date);
  return dateObj.toDateString();
};
