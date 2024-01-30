# Use Keyrings in AA Wallet

If EOA is one of your aa wallet's owner, the Metamask KeyringController is a good helper to store the private key in the browser.

This repo is modified from the example of [eth-simple-keyring](https://github.com/MetaMask/eth-simple-keyring).

## Run

### 1. Run the test

```
# TBD
```

### 2. Run the example

#### 2.1 Run the off-chain example

```
$ yarn sample:offchain
>
yarn run v1.22.19
$ ts-node src/examples/offChainSample.ts
[
  {
    "address": "0x0000000000000000000000000000000000000001",
    "privateKey": "68f935d806a690b36c08f9e479c7877bb9cb76b3c8a72fc667033d25c47b1672"
  },
  {
    "address": "0x0000000000000000000000000000000000000002",
    "privateKey": "60781eec58494d47f05a01232599c56f2a0ef1ff4499fc7faad8dd2fdc6c5eba"
  },
  {
    "address": "0x0000000000000000000000000000000000000003",
    "privateKey": "33d0e4fd190db45ce81b66ce96695bd1c3b31b36108fb9ad6bd1df40587f516f"
  }
]
✨  Done in 0.75s.
```

#### 2.2 Run the on-chain example

Make sure to fill the `.env` fields.

```
$ yarn sample:onchain
>
yarn run v1.22.19
```

#### 2.3 Run the keyring controller example

```
# TBD
```

### 3. Run the formatter

```
$ yarn format
```

### 4. Run the Linter

```
$ yarn lint
```

## Reference

- [MetaMask - Utils: `src/keyring.ts`](https://github.com/MetaMask/utils/blob/main/src/keyring.ts)
- [KeyringController](https://github.com/MetaMask/KeyringController/tree/main)
