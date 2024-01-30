import {
  arrToBufArr,
  ecsign,
  privateToPublic,
  stripHexPrefix,
  toBuffer,
} from "@ethereumjs/util";
import { concatSig } from "@metamask/eth-sig-util";
import { Hex } from "@metamask/utils";
import { keccak256 } from "ethereum-cryptography/keccak";
import SimpleKeyring from "./simple-keyring";

type AAWallet = {
  privateKey: Buffer;
  publicKey: Buffer;
  contractAddr: Hex;
};

export default class SimpleAAKeyring extends SimpleKeyring {
  #aawallets: AAWallet[];

  constructor(
    privateKeys: string[] = [],
    contractAddrs: Hex[] = [],
    type: string = "Simple AA Keyring",
  ) {
    super(privateKeys, type);
    this.#aawallets = [];
    /* istanbul ignore next: It's not possible to write a unit test for this, because a constructor isn't allowed
     * to be async. Jest can't await the constructor, and when the error gets thrown, Jest can't catch it. */
    this.deserializeAAWallets(privateKeys, contractAddrs).catch(
      (error: Error) => {
        throw new Error(
          `Problem deserializing SimpleAAKeyring ${error.message}`,
        );
      },
    );
  }

  async serializeAAWallets() {
    return this.#aawallets.map((a) => a.privateKey.toString("hex"));
  }

  async deserializeAAWallets(
    privateKeys: string[] = [],
    contractAddrs: Hex[] = [],
  ) {
    this.#aawallets = privateKeys
      .map((hexPrivateKey, index) => {
        const strippedHexPrivateKey = stripHexPrefix(hexPrivateKey);
        const privateKey = Buffer.from(strippedHexPrivateKey, "hex");
        const publicKey = privateToPublic(privateKey);
        const contractAddr = contractAddrs[index];

        return { privateKey, publicKey, contractAddr };
      })
      .filter((wallet): wallet is AAWallet => !!wallet);
  }

  async addAAWallets(
    numAccounts = 1,
    privateKeys: Buffer[],
    contractAddrs: Hex[],
  ) {
    const newWallets = [];
    for (let i = 0; i < numAccounts; i++) {
      const privateKey = privateKeys[i];
      const contractAddr = contractAddrs[i];
      if (privateKey === undefined || contractAddr === undefined) {
        continue;
      }
      const publicKey = privateToPublic(privateKey);
      newWallets.push({ privateKey, publicKey, contractAddr });
    }
    this.#aawallets = this.#aawallets.concat(newWallets);
    const hexWallets = newWallets.map(({ contractAddr }) => contractAddr);
    return hexWallets;
  }

  async getAAWallets() {
    return this.#aawallets.map((a) => a.contractAddr);
  }

  async exportAAWallet(address: Hex, withAppKeyOrigin: "") {
    const wallet = this.#getWalletForAccount(address, withAppKeyOrigin);
    return wallet.privateKey.toString("hex");
  }

  removeAAWallet(contractAddr: string) {
    if (
      !this.#aawallets
        .map(({ contractAddr }) => contractAddr.toLowerCase())
        .includes(stripHexPrefix(contractAddr).toLowerCase())
    ) {
      throw new Error(`Address ${contractAddr} not found in this keyring`);
    }

    this.#aawallets = this.#aawallets.filter(
      ({ contractAddr }) =>
        contractAddr.toLowerCase() !==
        stripHexPrefix(contractAddr).toLowerCase(),
    );
  }

  /**
   * @params address must be the userOp.sender
   * @returns Used in the userOp.signature
   */
  async signUserOp(address: Hex, userOpHash: string, withAppKeyOrigin: "") {
    const message = stripHexPrefix(userOpHash);
    if (message.length === 0 || !message.match(/^[a-fA-F0-9]*$/u)) {
      throw new Error("Cannot sign invalid message");
    }
    const privKey = this.#getPrivateKeyFor(address, withAppKeyOrigin);
    const msgSig = ecsign(Buffer.from(message, "hex"), privKey);
    const rawMsgSig = concatSig(toBuffer(msgSig.v), msgSig.r, msgSig.s);
    return rawMsgSig;
  }

  #getPrivateKeyFor(address: Hex, withAppKeyOrigin: "") {
    if (!address) {
      throw new Error("Must specify address.");
    }
    const wallet = this.#getWalletForAccount(address, withAppKeyOrigin);
    return wallet.privateKey;
  }

  #getWalletForAccount(contractAddr: Hex, withAppKeyOrigin: string) {
    let wallet = this.#aawallets.find(
      ({ contractAddr }) => contractAddr === contractAddr,
    );
    if (!wallet) {
      throw new Error("Simple AA Keyring - Unable to find matching address.");
    }

    const { privateKey } = wallet;
    const appKeyOriginBuffer = Buffer.from(withAppKeyOrigin, "utf8");
    const appKeyBuffer = Buffer.concat([privateKey, appKeyOriginBuffer]);
    const appKeyPrivateKey = arrToBufArr(keccak256(appKeyBuffer));
    const appKeyPublicKey = privateToPublic(appKeyPrivateKey);
    wallet = {
      privateKey: appKeyPrivateKey,
      publicKey: appKeyPublicKey,
      contractAddr: contractAddr,
    };

    return wallet;
  }
}
