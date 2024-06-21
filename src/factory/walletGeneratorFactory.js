import SolanaGen from "./chains/solanaGen.js";
import EVMGen from "./chains/evmGen.js";
import TonGen from "./chains/tonGen.js";

const walletGenerators = {
	sol: SolanaGen,
	evm: EVMGen,
	ton: TonGen,
};

export default class WalletGeneratorFactory {
	static getWalletGenerator(chain) {
		if (!chain) {
			throw new Error("Provide chain to create wallets");
		}
		const WalletGeneratorClass = walletGenerators[chain.toLowerCase()];
		if (!WalletGeneratorClass) {
			throw new Error(`Unsupported chain: ${chain}`);
		}
		return new WalletGeneratorClass();
	}
}
