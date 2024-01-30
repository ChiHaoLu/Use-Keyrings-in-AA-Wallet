import {
  arrToBufArr,
  bufferToHex,
  ecsign,
  privateToPublic,
  publicToAddress,
  stripHexPrefix,
  toBuffer,
} from "@ethereumjs/util";
import { add0x, Eip1024EncryptedData, Hex, Keyring } from "@metamask/utils";
import SimpleKeyring from "./simple-keyring";

export default class SimpleAAKeyring extends SimpleKeyring {
  #aawallets: { privateKey: Buffer; publicKey: Buffer; contractAddr: string }[];

  constructor(privateKeys: string[] = []) {
    super();
    this.#aawallets = [];
  }

  async addAAAccounts(
    numAccounts = 1,
    privateKey: Buffer,
    contractAddr: string
  ) {
    const newWallets = [];
    for (let i = 0; i < numAccounts; i++) {
      const publicKey = privateToPublic(privateKey);
      newWallets.push({ privateKey, publicKey, contractAddr });
    }
    this.#aawallets = this.#aawallets.concat(newWallets);
    const hexWallets = newWallets.map(({ publicKey }) =>
      add0x(bufferToHex(publicToAddress(publicKey)))
    );
    return hexWallets;
  }

  async getAAAccounts() {
    return this.#aawallets.map(({ contractAddr }) =>
      contractAddr
    );
  }
}
