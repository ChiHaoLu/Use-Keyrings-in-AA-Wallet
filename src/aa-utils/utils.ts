const ethers = require("ethers");
import { PackedUserOperation, UserOperation } from "./UserOperation";

const SimpleAccountFactoryAddr = "0x9406Cc6185a346906296840746125a0E44976454"; // deployed on sepolia
let ABI = ["function createAccount(address owner,uint256 salt)"]; // ref. https://github.com/eth-infinitism/account-abstraction/blob/develop/contracts/samples/SimpleAccountFactory.sol
let iface = ethers.utils.Interface(ABI);

import { BigNumberish, keccak256, BytesLike, hexlify } from "ethers";

export function getPreComputeAddress(owner: string, salt: BigNumberish) {
  const saltBytes32 = ethers.utils.hexZeroPad(hexlify(salt as BytesLike), 32);
  return (
    "0x" +
    keccak256(
      ethers.utils.hexConcat([
        "0xff",
        SimpleAccountFactoryAddr,
        saltBytes32,
        keccak256(getInitCode(owner, salt)),
      ]),
    ).slice(-40)
  );
}

export function getInitCode(ownerAddr: string, salt: BigNumberish) {
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

function packAccountGasLimits(
  validationGasLimit: BigNumberish,
  callGasLimit: BigNumberish,
): string {
  return ethers.utils.hexConcat([
    ethers.utils.hexZeroPad(
      ethers.utils.hexlify(validationGasLimit, { hexPad: "left" }),
      16,
    ),
    ethers.utils.hexZeroPad(
      ethers.utils.hexlify(callGasLimit, { hexPad: "left" }),
      16,
    ),
  ]);
}

function packUserOp(userOp: UserOperation): PackedUserOperation {
  const accountGasLimits = packAccountGasLimits(
    userOp.verificationGasLimit,
    userOp.callGasLimit,
  );
  let paymasterAndData = "0x";
  if (userOp.paymaster.length >= 20) {
    throw Error("Not support paymaster currently");
  }
  return {
    sender: userOp.sender,
    nonce: userOp.nonce,
    callData: userOp.callData,
    accountGasLimits,
    initCode: userOp.initCode,
    preVerificationGas: userOp.preVerificationGas,
    maxFeePerGas: userOp.maxFeePerGas,
    maxPriorityFeePerGas: userOp.maxPriorityFeePerGas,
    paymasterAndData,
    signature: userOp.signature,
  };
}

function encodeUserOp(userOp: UserOperation, forSignature = true): string {
  const packedUserOp = packUserOp(userOp);
  if (forSignature) {
    return ethers.utils.defaultAbiCoder.encode(
      [
        "address",
        "uint256",
        "bytes32",
        "bytes32",
        "bytes32",
        "uint256",
        "uint256",
        "uint256",
        "bytes32",
      ],
      [
        packedUserOp.sender,
        packedUserOp.nonce,
        keccak256(packedUserOp.initCode as BytesLike),
        keccak256(packedUserOp.callData as BytesLike),
        packedUserOp.accountGasLimits,
        packedUserOp.preVerificationGas,
        packedUserOp.maxFeePerGas,
        packedUserOp.maxPriorityFeePerGas,
        keccak256(packedUserOp.paymasterAndData as BytesLike),
      ],
    );
  } else {
    // for the purpose of calculating gas cost encode also signature (and no keccak of bytes)
    return ethers.utils.defaultAbiCoder.encode(
      [
        "address",
        "uint256",
        "bytes",
        "bytes",
        "bytes32",
        "uint256",
        "uint256",
        "uint256",
        "bytes",
        "bytes",
      ],
      [
        packedUserOp.sender,
        packedUserOp.nonce,
        packedUserOp.initCode,
        packedUserOp.callData,
        packedUserOp.accountGasLimits,
        packedUserOp.preVerificationGas,
        packedUserOp.maxFeePerGas,
        packedUserOp.maxPriorityFeePerGas,
        packedUserOp.paymasterAndData,
        packedUserOp.signature,
      ],
    );
  }
}

export function getUserOpHash(
  op: UserOperation,
  entryPoint: string,
  chainId: number,
): string {
  const userOpHash = keccak256(encodeUserOp(op, true));
  const enc = ethers.utils.defaultAbiCoder.encode(
    ["bytes32", "address", "uint256"],
    [userOpHash, entryPoint, chainId],
  );
  return keccak256(enc);
}
