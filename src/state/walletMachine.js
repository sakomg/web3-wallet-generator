import { createMachine } from "xstate";

export const walletMachine = createMachine(
	{
		id: "wallet",
		initial: "idle",
		context: {
			chain: null,
			numberOfWallets: null,
			exportFormat: null,
		},
		states: {
			idle: {
				on: {
					START: "selectingChain",
				},
			},
			selectingChain: {
				on: {
					SELECT_CHAIN: {
						target: "selectingNumber",
						actions: "setChain",
					},
				},
			},
			selectingNumber: {
				on: {
					SELECT_NUMBER: {
						target: "selectingExportFormat",
						actions: "setNumberOfWallets",
					},
				},
			},
			selectingExportFormat: {
				on: {
					SELECT_EXPORT_FORMAT: {
						target: "generatingWallets",
						actions: "setExportFormat",
					},
				},
			},
			generatingWallets: {
				entry: "generateWallets",
				on: {
					RESET: "idle",
				},
			},
		},
	},
	{
		actions: {
			setChain: ({ context, event }) => {
				context.chain = event.value;
			},
			setNumberOfWallets: ({ context, event }) => {
				context.numberOfWallets = event.value;
			},
			setExportFormat: ({ context, event }) => {
				context.exportFormat = event.value;
			},
			generateWallets: ({ context }) => {
				console.log(`Generating ${context.numberOfWallets} wallets for ${context.chain} in ${context.exportFormat} format.`);
			},
		},
	}
);
