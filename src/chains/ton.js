import { mnemonicNew, mnemonicToPrivateKey } from "ton-crypto";
import { WalletContractV4 } from "ton";
import { generateRandomPassword } from "../utils/generatePassword.js";

export async function generateTONWallets(count) {
	if (!count) {
		throw new Error("Enter count of wallets");
	}

	const result = [];

	for (let idx = 1; idx <= count; idx++) {
		let mnemonics = await mnemonicNew();
		let keyPair = await mnemonicToPrivateKey(mnemonics);
		const password = generateRandomPassword(12);
		let wallet = WalletContractV4.create({
			workchain: 0,
			publicKey: keyPair.publicKey,
		});

		result.push({
			idx,
			password,
			wallet: {
				address: wallet.address,
				privateKey: keyPair.secretKey.toString("hex"),
				seed: mnemonics.join(" "),
			},
		});
	}

	return result;
}
