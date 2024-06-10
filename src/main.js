import "dotenv/config";
import fs from "fs/promises";
import Telegram from "./telegram/bot.js";

class App {
  async live() {
    const data = await fs.readFile("./data/text.json", "utf8");

    if (!data || Object.keys(data).length === 0) {
      throw new Error("Add messages to text.json file");
    }

    new Telegram(process.env, JSON.parse(data)).live();
  }
}

new App().live();
