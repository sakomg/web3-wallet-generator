import { createActor } from "xstate";
import { Bot, InputFile, session } from "grammy";
import { walletMachine } from "../state/walletMachine.js";
import { chainKeyboard, exportAsKeyboard, numberKeyboard } from "../utils/constants.js";
import { generateEVMWallets } from "../chains/evm.js";
import { generateTONWallets } from "../chains/ton.js";
import { currentTime } from "../utils/datetime.js";
import Wallets from "../format/prepareStruc.js";

export default class Telegram {
	#bot;
	#data;
	#actor;
	#state = {};

	constructor(config, data) {
		this.#data = data;
		this.#bot = new Bot(config.TELEGRAM_TOKEN);
		this.#bot.use(session());
		this.#actor = createActor(walletMachine);
		this.#actor.subscribe((state) => this.onStateChange(state));
		this.#actor.start();

		this.setupBot();
	}

	setupBot() {
		this.#bot.command("start", async (ctx) => {
			this.#actor.send({ type: "START" });
			await ctx.reply(this.#data.start, {
				reply_markup: {
					inline_keyboard: chainKeyboard,
				},
			});
		});

		this.#bot.command("help", async (ctx) => {
			await ctx.reply(this.#data.help);
		});

		this.#bot.command("thanks", async (ctx) => {
			await ctx.reply(this.#data.thanks);
		});

		this.#bot.on("message", async (ctx) => {
			this.onMessage(ctx);
		});

		this.#bot.on("callback_query:data", async (ctx) => {
			const data = ctx.callbackQuery.data;
			this.onCallbackQuery(data, ctx);
		});
	}

	async onCallbackQuery(data, ctx) {
		const [action, value] = data.split(":");

		const actionHandlers = {
			SELECT_CHAIN: this.handleSelectChain.bind(this),
			SELECT_NUMBER: this.handleSelectNumber.bind(this),
			SELECT_EXPORT_FORMAT: this.handleSelectExportAs.bind(this),
		};

		const handler = actionHandlers[action];
		if (handler) {
			await handler(value, ctx);
		}
	}

	async handleSelectChain(chainValue, ctx) {
		this.#actor.send({ type: "SELECT_CHAIN", value: chainValue });
		const messageId = ctx.callbackQuery.message.message_id;
		const result = await this.deleteMessage(ctx, messageId);
		if (result.success) {
			await ctx.reply(this.#data.select_chain.replace("{chain}", chainValue), {
				reply_markup: {
					inline_keyboard: numberKeyboard,
				},
			});
		} else {
			await ctx.reply(result.message);
		}
	}

	async handleSelectNumber(numberValue, ctx) {
		if (numberValue === "CUSTOM") {
			this.#actor.send({ type: "SELECT_CUSTOM" });
			await ctx.reply(this.#data.enter_number_wallets);
			return;
		}

		this.#actor.send({ type: "SELECT_NUMBER", value: numberValue });
		const messageId = ctx.callbackQuery.message.message_id;
		const result = await this.deleteMessage(ctx, messageId);
		if (result.success) {
			await ctx.reply(this.#data.select_number.replace("{number}", numberValue), {
				reply_markup: {
					inline_keyboard: exportAsKeyboard,
				},
			});
		} else {
			await ctx.reply(result.message);
		}
	}

	async handleSelectExportAs(formatValue, ctx) {
		this.#actor.send({ type: "SELECT_EXPORT_FORMAT", value: formatValue });
		const messageId = ctx.callbackQuery.message.message_id;
		const result = await this.deleteMessage(ctx, messageId);
		if (result.success) {
			await ctx.reply(this.#data.select_export_format.replace("{format}", formatValue));

			const walletHandler = {
				EVM: generateEVMWallets,
				TON: generateTONWallets,
			};

			console.log(this.#state);
			const { chain, numberOfWallets, exportFormat } = this.#state["generatingWallets"];
			const wallets = await walletHandler[chain](numberOfWallets);
			const result = this.buildContent(exportFormat, wallets);

			if (!result.success) {
				await ctx.reply(result.value);
			}

			if (exportFormat == "MESSAGE") {
				await this.replyMessageAsChunks(ctx, result.value);
			} else {
				const time = currentTime();
				const filename = `${chain}-wallets-${time}`;
				const buffer = Buffer.from(result.value, "utf-8");
				await ctx.replyWithDocument(new InputFile(buffer, filename + "." + exportFormat.toLowerCase()));
			}
		} else {
			await ctx.reply(result.message);
		}

		await ctx.reply(this.#data.wallet_generation_success);
		this.#actor.send({ type: "RESET" });
	}

	async onMessage(ctx) {
		const numberOfWallets = ctx.message.text;
		if (this.isValidNumber(numberOfWallets)) {
			this.#actor.send({ type: "ENTER_CUSTOM_NUMBER", value: numberOfWallets });
			await ctx.reply(this.#data.select_number.replace("{number}", numberOfWallets), {
				reply_markup: {
					inline_keyboard: exportAsKeyboard,
				},
			});
		} else {
			await ctx.reply(this.#data.invalid_number);
		}
	}

	async replyMessageAsChunks(ctx, walletsArray) {
		if (walletsArray.length === 1) {
			await ctx.reply(walletsArray[0].join("\n"));
		} else {
			for (let i = 0; i < walletsArray.length; i++) {
				const chunk = walletsArray[i].join("\n");
				await ctx.reply(chunk);
			}
		}
	}

	onStateChange(state) {
		this.#state[state.value] = state.context;
	}

	isValidNumber = (value) => {
		const customNumber = parseInt(value);
		return !isNaN(customNumber) && customNumber > 0 && customNumber <= 500;
	};

	async deleteMessage(ctx, messageId) {
		console.log(messageId);
		const result = {
			success: true,
			message: null,
		};
		try {
			await ctx.api.deleteMessage(ctx.chat.id, messageId);
		} catch (error) {
			result.success = false;
			result.message = "❌ " + error;
		}

		return result;
	}

	buildContent(format, arrayWallets) {
		const result = {
			success: true,
			value: null,
		};
		try {
			const walletsPresentation = new Wallets(format, arrayWallets);
			result.value = walletsPresentation.getContent();
		} catch (e) {
			result.success = false;
			result.value = e;
		}

		return result;
	}

	live() {
		this.#bot.start();
	}
}
