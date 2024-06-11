import { ethers } from "ethers";
import { generateRandomPassword } from "../utils/generatePassword.js";

export async function generateEVMWallets(count) {
  if (!count) {
    throw new Error("Enter count of wallets");
  }

  const result = [];

  for (let idx = 1; idx <= count; idx++) {
    const wallet = ethers.Wallet.createRandom();
    const mnemonic = wallet.mnemonic.phrase;
    const password = generateRandomPassword(12);
    result.push({
      idx,
      password,
      wallet: {
        address: wallet.address,
        privateKey: wallet.privateKey,
        seed: mnemonic,
      },
    });
  }

  return result;
}
