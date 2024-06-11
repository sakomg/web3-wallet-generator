import "dotenv/config";
import fs from "fs/promises";
import Telegram from "./telegram/bot.js";
import express from "express";
import { webhookCallback } from "grammy";

const data = await fs.readFile("./data/text.json", "utf8");
const isDevelopment = process.env.NODE_ENV !== "production";
const token = process.env.TELEGRAM_TOKEN;

if (!data || Object.keys(data).length === 0) {
	throw new Error("Add messages to text.json file");
}

const instance = new Telegram(process.env, JSON.parse(data));

if (isDevelopment) {
	console.log("development");
	instance.bot.start();
} else {
	console.log("production");
	const domain = String(process.env.DOMAIN);
	const secretPath = String(process.env.TELEGRAM_TOKEN);
	console.log(domain);
	const app = express();

	app.use(express.json());
	app.use(`/${secretPath}`, webhookCallback(instance.bot, "express"));

	const port = process.env.PORT || 3000;
	app.listen(Number(port), async () => {
		console.log("server running...");
		await instance.bot.api.setWebhook(`https://${domain}/${secretPath}`);
	});
}
