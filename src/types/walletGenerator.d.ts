declare module "walletGenerator" {
	export interface Wallet {
		idx: string | null;
		password: string | null;
		wallet: {
			address: string;
			privateKey: string;
			seed: string;
		};
	}

	export class WalletGenerator {
		createWallet(): Promise<Wallet>;
	}

	export class SolanaWalletGenerator extends WalletGenerator {
		createWallet(): Promise<Wallet>;
	}

	export class TonWalletGenerator extends WalletGenerator {
		createWallet(): Promise<Wallet>;
	}

	export class EvmWalletGenerator extends WalletGenerator {
		createWallet(): Promise<Wallet>;
	}

	export class WalletGeneratorFactory {
		static getWalletGenerator(chain: string): WalletGenerator;
	}
}
