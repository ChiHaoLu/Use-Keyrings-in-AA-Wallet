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

type AAWallet = {
    privateKey: Buffer;
    publicKey: Buffer;
    contractAddr: Hex 
}

export default class SimpleAAKeyring extends SimpleKeyring {
  #aawallets: AAWallet[];

  constructor(
    privateKeys: string[] = [],
    contractAddrs: Hex[] = [],
    type: string = "Simple AA Keyring"
  ) {
    super(privateKeys, type);
    this.#aawallets = [];
    /* istanbul ignore next: It's not possible to write a unit test for this, because a constructor isn't allowed
     * to be async. Jest can't await the constructor, and when the error gets thrown, Jest can't catch it. */
    this.deserializeAAWallets(privateKeys).catch(
      (error: Error) => {
        throw new Error(`Problem deserializing SimpleKeyring ${error.message}`);
      }
    );
  }

  async serializeAAWallets() {
    return this.#aawallets.map((a) => a.privateKey.toString("hex"));
  }

  async deserializeAAWallets(privateKeys: string[] = []) {
    this.#aawallets = privateKeys
      .map((hexPrivateKey) => {
        const strippedHexPrivateKey = stripHexPrefix(hexPrivateKey);
        const privateKey = Buffer.from(strippedHexPrivateKey, "hex");
        const publicKey = privateToPublic(privateKey);
        const contractAddr = this.#aawallets.find((wallet) =>
          wallet.privateKey.equals(privateKey)
        )?.contractAddr;

        return { privateKey, publicKey, contractAddr };
      })
      .filter((wallet): wallet is AAWallet => !!wallet);
  }

  async addAAAccounts(numAccounts = 1, privateKey: Buffer, contractAddr: Hex) {
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
    return this.#aawallets.map((a) => a.contractAddr);
  }
}
