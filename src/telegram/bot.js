import { createActor } from "xstate";
import { Bot } from "grammy";
import { walletMachine } from "../state/walletMachine.js";
import { chainKeyboard, exportAsKeyboard } from "../utils/constants.js";
import TelegramHandler from "./handlers.js";

export default class Telegram {
	#bot;
	#data;
	#actor;
	#handlers;
	#state = {};

	constructor(config, data) {
		this.#data = data;
		this.#bot = new Bot(config.TELEGRAM_TOKEN);
		this.#actor = createActor(walletMachine);
		this.#actor.subscribe((state) => this.onStateChange(state));
		this.#actor.start();
		this.#handlers = new TelegramHandler(this.#actor, this.#data, this.#state);
		this.setupBot();
	}

	get bot() {
		return this.#bot;
	}

	setupBot() {
		this.#bot.command("start", async (ctx) => {
			this.#actor.send({ type: "START" });
			await this.sendMessageSafely(ctx, this.#data.start, {
				reply_markup: {
					inline_keyboard: chainKeyboard,
				},
			});
		});

		this.#bot.command("help", async (ctx) => {
			await this.sendMessageSafely(ctx, this.#data.help);
		});

		this.#bot.command("thanks", async (ctx) => {
			await this.sendMessageSafely(ctx, this.#data.thanks);
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
			SELECT_CHAIN: this.#handlers.handleSelectChain.bind(this.#handlers),
			SELECT_NUMBER: this.#handlers.handleSelectNumber.bind(this.#handlers),
			SELECT_EXPORT_FORMAT: this.#handlers.handleSelectExportAs.bind(this.#handlers),
		};

		const handler = actionHandlers[action];
		if (handler) {
			await handler(value, ctx);
		}
	}

	async onMessage(ctx) {
		const numberOfWallets = ctx.message.text;
		if (this.isValidNumber(numberOfWallets)) {
			this.#actor.send({ type: "ENTER_CUSTOM_NUMBER", value: numberOfWallets });
			await this.sendMessageSafely(ctx, this.#data.select_number.replace("{number}", numberOfWallets), {
				reply_markup: {
					inline_keyboard: exportAsKeyboard,
				},
			});
		} else {
			await this.sendMessageSafely(ctx, this.#data.invalid_number);
		}
	}

	async sendMessageSafely(ctx, message, options) {
		try {
			await ctx.reply(message, options);
		} catch (error) {
			console.log("Error while sending message:", error);
		}
	}

	onStateChange(state) {
		this.#state[state.value] = state.context;
	}

	isValidNumber(value) {
		const regex = /^\d+$/;
		return regex.test(value) && parseInt(value) > 0 && parseInt(value) <= 500;
	}
}
