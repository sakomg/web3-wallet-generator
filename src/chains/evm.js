import { ethers } from "ethers";
import { generateRandomPassword } from "../utils/generatePassword.js";
import { save } from "../csv/save.js";

(function main() {
  const count = parseInt(process.argv[2]);
  const csvContent = generateWallets(count);
  save("EVM", csvContent);
})();

function generateWallets(count) {
  if (!count) {
    throw new Error("Enter count of wallets");
  }

  let csvContent = "";

  for (let idx = 1; idx <= count; idx++) {
    const wallet = ethers.Wallet.createRandom();
    const mnemonic = wallet.mnemonic.phrase;
    const passwordToWallet = generateRandomPassword(12);
    csvContent += `${idx},${passwordToWallet},${wallet.address},${wallet.privateKey},${mnemonic}\n`;
  }

  return csvContent;
}
