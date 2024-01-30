import SimpleAAKeyring from "../aa-keyring";
import { generateKey } from "../utils";
import { Hex } from "@metamask/utils";

const keyring = new SimpleAAKeyring();
const accountNum = 3;

let accounts: Record<string, string>[] = [];

keyring // eslint-disable-line @typescript-eslint/no-floating-promises
  .addAAWallets(
    accountNum,
    Array(accountNum).fill(null).map(() => generateKey()),
    Array(accountNum).fill(null).map((_, i) => `0x000000000000000000000000000000000000000${i + 1}` as Hex)
  )
  .then(async (newContractAddresses) => {
    accounts = newContractAddresses.map((address) => {
      return { address };
    });
    return keyring.serializeAAWallets();
  })
  .then((privateKeys) => {
    privateKeys.forEach((privateKey, index) => {
      accounts[index]!.privateKey = privateKey; // eslint-disable-line @typescript-eslint/no-non-null-assertion
    });
  })
  .then(() => {
    const jsonAccounts = JSON.stringify(accounts, null, 2);
    console.log(jsonAccounts);
  });
