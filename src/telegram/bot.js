import { Bot, session } from "grammy";
import { walletMachine } from "../state/walletMachine.js";
import { createActor } from "xstate";
import {
  chainKeyboard,
  exportAsKeyboard,
  numberKeyboard,
} from "../utils/constants.js";

export default class Telegram {
  #bot;
  #data;
  #actor;

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
    await ctx.reply(
      `You've selected ${chainValue}. How many wallets would you like to generate?`,
      {
        reply_markup: {
          inline_keyboard: numberKeyboard,
        },
      }
    );
  }

  async handleSelectNumber(numberValue, ctx) {
    this.#actor.send({ type: "SELECT_NUMBER", value: numberValue });
    await ctx.reply(
      `You've selected ${numberValue}. How you want to get wallets?`,
      {
        reply_markup: {
          inline_keyboard: exportAsKeyboard,
        },
      }
    );
  }

  async handleSelectExportAs(formatValue, ctx) {
    this.#actor.send({ type: "SELECT_EXPORT_FORMAT", value: formatValue });
  }

  onMessage(text, ctx) {
    console.log(ctx);
    this.#actor.send({ type: "USER_INPUT", value: text });
  }

  onStateChange(state) {
    console.log(state.value, state.context);
    // Handle state changes if needed
  }

  live() {
    this.#bot.start();
  }
}
