import "dotenv/config";
import fs from "fs/promises";
import Telegram from "./telegram/bot.js";
import express from "express";
import path from "path";
import { webhookCallback } from "grammy";

const language = "eng"; // TODO: add ru support

(async function main() {
	try {
		const data = await fs.readFile(`./data/${language}.json`, "utf8");
		const isDevelopment = process.env.NODE_ENV !== "production";

		if (!data || Object.keys(data).length === 0) {
			throw new Error("An error occurred during setup language file.");
		}

		const instance = new Telegram(process.env, JSON.parse(data));

		if (isDevelopment) {
			console.log("development");
			instance.bot.start();
		} else {
			console.log("production");
			const secretPath = String(process.env.TELEGRAM_TOKEN);
			const app = express();

			app.use(express.json());
			app.use(`/${secretPath}`, webhookCallback(instance.bot, "express"));
			app.get("/", (req, res) => {
        res.sendFile(path.join(process.cwd(), "public", "index.html"));
      });

			const port = process.env.PORT || 3000;
			app.listen(Number(port), async () => {
				console.log(`server running on ${port} port...`);
			});
		}
	} catch (error) {
		console.error("An error occurred:", error);
		process.exit(1);
	}
})();
