const ethers = require("ethers");
import SimpleAAKeyring from "../aa-keyring";
import { generateKey } from "../utils";
import { Hex } from "@metamask/utils";

const EntryPointAddr = "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789"; // deployed on sepolia
const SimpleAccountFactoryAddr = "0x9406Cc6185a346906296840746125a0E44976454"; // deployed on sepolia
let ABI = ["function createAccount(address owner,uint256 salt)"]; // ref. https://github.com/eth-infinitism/account-abstraction/blob/develop/contracts/samples/SimpleAccountFactory.sol
let iface = ethers.utils.Interface(ABI);

function getInitCode(ownerAddr: string, salt: number) {
  const initCalldata = iface.encodeFunctionData("createAccount", [
    ownerAddr,
    salt,
  ]);
  const initCode = ethers.utils.solidityKeccak256(
    ["address", "bytes"],
    [SimpleAccountFactoryAddr, initCalldata],
  );
  return initCode;
}

async function main() {
  // Setup keyring
  const keyring = new SimpleAAKeyring();
  keyring.addAAWallets(
    1,
    [generateKey()],
    [`0x000000000000000000000000000000000000000${1}` as Hex],
  );

  // Setup Client

  // Construct the userOp with initCode

  // Sign userOp

  // Send userOp

  // Check the account contract is deployed or not
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
