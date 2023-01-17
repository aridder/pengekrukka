import fs from "fs";
import path from "path";
import _withdraw from "./withdraw.json";



const _proving_key = fs.readFileSync(path.resolve("src", "server" ,"blockchain", "circuits",  "withdraw_proving_key.bin")).buffer;

export const proving_key = _proving_key;
export const withdraw: any = _withdraw;
