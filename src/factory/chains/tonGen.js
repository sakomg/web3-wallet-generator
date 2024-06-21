import { mnemonicNew, mnemonicToPrivateKey } from "ton-crypto";
import { WalletContractV4 } from "ton";
import WalletGenerator from "../walletGenerator.js";

export default class TONWalletGenerator extends WalletGenerator {
	async createWallet() {
		let mnemonics = await mnemonicNew();
		let keyPair = await mnemonicToPrivateKey(mnemonics);
		let wallet = WalletContractV4.create({
			workchain: 0,
			publicKey: keyPair.publicKey,
		});

		return {
			idx: null,
			password: null,
			wallet: {
				address: wallet.address,
				privateKey: keyPair.secretKey.toString("hex"),
				seed: mnemonics.join(" "),
			},
		};
	}
}
