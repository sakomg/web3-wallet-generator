import { Keypair } from "@solana/web3.js";
import { derivePath } from "ed25519-hd-key";
import WalletGenerator from "../walletGenerator.js";
import bip39 from "bip39";

export default class SolanaWalletGenerator extends WalletGenerator {
	async createWallet() {
		const mnemonic = bip39.generateMnemonic(256);
		const seed = bip39.mnemonicToSeedSync(mnemonic);
		const { key } = derivePath("m/44'/501'/0'/0'", seed);
		const keypair = Keypair.fromSeed(key);
		return {
			idx: null,
			password: null,
			wallet: {
				address: keypair.publicKey.toBase58(),
				privateKey: Buffer.from(keypair.secretKey).toString("hex"),
				seed: mnemonic,
			},
		};
	}
}
