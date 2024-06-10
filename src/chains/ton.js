import { mnemonicNew, mnemonicToPrivateKey } from "ton-crypto";
import { WalletContractV4 } from "ton";
import { generateRandomPassword } from "../utils/generatePassword.js";
import { save } from "../csv/save.js";

(async function main() {
  const count = parseInt(process.argv[2]);
  const csvContent = await generateWallets(count);
  save("TON", csvContent);
})();

async function generateWallets(count) {
  if (!count) {
    throw new Error("Enter count of wallets");
  }

  let csvContent = "";

  for (let idx = 1; idx <= count; idx++) {
    let mnemonics = await mnemonicNew();
    let keyPair = await mnemonicToPrivateKey(mnemonics);
    const passwordToWallet = generateRandomPassword(12);
    let wallet = WalletContractV4.create({
      workchain: 0,
      publicKey: keyPair.publicKey,
    });

    csvContent += `${idx},${passwordToWallet},${
      wallet.address
    },${keyPair.secretKey.toString("hex")},${mnemonics.join(" ")}\n`;
  }

  return csvContent;
}
