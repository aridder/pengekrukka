import fs from "fs";
import path from "path";
import { PersonalCredential, VerifiableCredential } from "../../schemas";
import { VerifiableCredentialType } from "../../vc-shared";

const PATH = path.resolve("database.json");

type Database = {
  [key in string]: VerifiableCredential[];
};

function readDB() {
  const data = fs.readFileSync(PATH);
  const parsed = JSON.parse(data.toString());

  return parsed as Database;
}

function writeDB(database: Database) {
  const data = JSON.stringify(database);
  fs.writeFileSync(PATH, data);
}

const list = (userId: string): VerifiableCredential[] => {
  const parsed = readDB();
  const credentials = parsed[userId];

  return credentials ? credentials : [];
};

const upsert = (userDid: string, credential: VerifiableCredential): VerifiableCredential => {
  const database = readDB();

  if (database[userDid] === undefined) {
    database[userDid] = [];
  }

  database[userDid]!.push(credential);
  writeDB(database);
  return credential;
};

const getPersonalCredential = (userId: string): PersonalCredential | null => {
  const credentials = list(userId);
  const personalCredential = credentials.find((credential) =>
    credential.type.includes(VerifiableCredentialType.PersonCredential)
  );

  if (personalCredential === undefined) {
    return null;
  } else {
    return personalCredential as PersonalCredential;
  }
};

/**
 * DANGER: actually wipes the entire file
 */
const resetDatabase = () => {
  fs.createWriteStream(PATH, {
    flags: "a",
  });
  writeDB({});
};

export const database = {
  list,
  upsert,
  resetDatabase,
  getPersonalCredential,
};
