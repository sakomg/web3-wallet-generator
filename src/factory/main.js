import { generateRandomPassword } from "../utils/generatePassword.js";
import WalletGeneratorFactory from "./walletGeneratorFactory.js";

export default async function generateWallets(chain, count) {
	if (!count) {
		throw new Error(`[${chain}] Enter count of wallets`);
	}

	const walletGenerator = WalletGeneratorFactory.getWalletGenerator(chain);
	const result = [];

	for (let idx = 1; idx <= count; idx++) {
		const wallet = await walletGenerator.createWallet(idx);
		wallet.idx = idx;
		wallet.password = generateRandomPassword(12);
		result.push(wallet);
	}

	return result;
}
