export const shortenDid = (did: string) => {
  return did.slice(0, 15) + "..." + did.slice(did.length - 4, did.length);
};

export const formatDate = (date: string) => {
  const dateObj = new Date(date);
  return dateObj.toLocaleDateString();
};
