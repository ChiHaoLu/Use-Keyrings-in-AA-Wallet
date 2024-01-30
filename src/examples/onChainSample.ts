const ethers = require("ethers");
import dotenv from "dotenv";
dotenv.config();
import { generateKey } from "../utils";
import { Hex } from "@metamask/utils";
import SimpleAAKeyring from "../aa-keyring";
import {
  getPreComputeAddress,
  getUserOpHash,
  getInitCode,
} from "../aa-utils/utils";
import {
  bufferToHex,
  privateToPublic,
  publicToAddress,
} from "@ethereumjs/util";
import { add0x } from "@metamask/utils";

const EntryPointAddr = "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789"; // deployed on sepolia

async function main() {
  // Setup keyring
  // precomputed the account address from simple account factory
  const privKey = generateKey();
  const publicKey = privateToPublic(privKey);
  const eoaAddress = add0x(bufferToHex(publicToAddress(publicKey)));
  const salt = 42;
  const contractAddr = getPreComputeAddress(eoaAddress, salt);
  const keyring = new SimpleAAKeyring();
  keyring.addAAWallets(1, [privKey], [contractAddr as Hex]);

  // Setup Client
  const provider = new ethers.providers.JsonRpcProvider(
    process.env.SEPOLIA_URL as string,
  );

  // Construct the userOp with initCode
  const hash = getUserOpHash(
    {
      sender: contractAddr,
      nonce: 0,
      initCode: getInitCode(eoaAddress, salt),
      callData: "",
      callGasLimit: "",
      verificationGasLimit: "",
      preVerificationGas: "",
      maxFeePerGas: "",
      maxPriorityFeePerGas: "",
      paymaster: "",
      paymasterVerificationGasLimit: "",
      paymasterPostOpGasLimit: "",
      paymasterData: "",
      signature: "",
    },
    EntryPointAddr,
    11155111,
  );

  // Sign userOp
  keyring.signUserOp(contractAddr as Hex, hash, "");

  // Send userOp

  // Check the account contract is deployed or not
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
