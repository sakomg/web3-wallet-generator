import { Bot, InputFile, session } from "grammy";
import { walletMachine } from "../state/walletMachine.js";
import { createActor } from "xstate";
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

		this.#bot.on("message", async (ctx) => {
			const text = ctx.message.text;
			this.onMessage(text, ctx);
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
		await ctx.reply(`You've selected ${chainValue}. How many wallets would you like to generate?`, {
			reply_markup: {
				inline_keyboard: numberKeyboard,
			},
		});
	}

	async handleSelectNumber(numberValue, ctx) {
		this.#actor.send({ type: "SELECT_NUMBER", value: numberValue });
		await ctx.reply(`You've selected ${numberValue}. How you want to get wallets?`, {
			reply_markup: {
				inline_keyboard: exportAsKeyboard,
			},
		});
	}

	async handleSelectExportAs(formatValue, ctx) {
		this.#actor.send({ type: "SELECT_EXPORT_FORMAT", value: formatValue });
		await ctx.reply(`You've selected ${formatValue}. Second...`);

		const walletHandler = {
			EVM: generateEVMWallets,
			TON: generateTONWallets,
		};
		const { chain, numberOfWallets, exportFormat } = this.#state["generatingWallets"];
		const wallets = await walletHandler[chain](numberOfWallets);
		const result = this.buildContent(exportFormat, wallets);

		if (!result.success) {
			await ctx.reply(result.value);
		}

		if (exportFormat == "MESSAGE") {
			await ctx.reply(result.value);
		} else {
			const time = currentTime();
			const filename = `${chain}-wallets-${time}`;
			const buffer = Buffer.from(result.value, "utf-8");
			await ctx.replyWithDocument(new InputFile(buffer, filename + "." + exportFormat.toLowerCase()));
		}

		this.#actor.send({ type: "RESET" });
	}

	onMessage(text, ctx) {
		console.log(ctx);
		console.log(text);
		this.#actor.send({ type: "USER_INPUT", value: text });
	}

	onStateChange(state) {
		this.#state[state.value] = state.context;
		console.log("state", this.#state);
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
