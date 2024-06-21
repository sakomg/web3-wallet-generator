import { ethers } from "ethers";
import WalletGenerator from "../walletGenerator.js";

export default class EVMWalletGenerator extends WalletGenerator {
	async createWallet() {
		const wallet = ethers.Wallet.createRandom();
		const mnemonic = wallet.mnemonic.phrase;
		return {
			idx: null,
			password: null,
			wallet: {
				address: wallet.address,
				privateKey: wallet.privateKey,
				seed: mnemonic,
			},
		};
	}
}
