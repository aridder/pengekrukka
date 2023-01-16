import fs from "fs";
import _withdraw from "./withdraw.json";

const _proving_key = fs.readFileSync("./withdraw_proving_key.bin").buffer;

export const proving_key = _proving_key;
export const withdraw = _withdraw;
