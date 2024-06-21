import { InputFile } from "grammy";
import { currentTime } from "../utils/datetime.js";
import { exportAsKeyboard, numberKeyboard } from "../utils/constants.js";
import generateWallets from "../factory/main.js";
import Wallets from "../format/prepareStruc.js";

export default class TelegramHandler {
	#actor;
	#data;
	#state;

	constructor(actor, data, state) {
		this.#actor = actor;
		this.#data = data;
		this.#state = state;
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

			console.log(this.#state);
			const { chain, numberOfWallets, exportFormat } = this.#state["generatingWallets"];
			const wallets = await generateWallets(chain, numberOfWallets);
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

	async deleteMessage(ctx, messageId) {
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
}
