export const languageKeyboard = [
	[
		{
			text: "🇷🇺",
			callback_data: "SELECT_LANGUAGE:RU",
		},
	],
	[
		{
			text: "🇬🇧",
			callback_data: "SELECT_LANGUAGE:ENG",
		},
	],
];

export const chainKeyboard = [
	[
		{
			text: "💎 TON (Telegram Open Network)",
			callback_data: "SELECT_CHAIN:TON",
		},
	],
	[
		{
			text: "🦊 EVM (Ethereum Virtual Machine)",
			callback_data: "SELECT_CHAIN:EVM",
		},
	],
];

export const numberKeyboard = [
	[
		{ text: "1", callback_data: "SELECT_NUMBER:1" },
		{ text: "5", callback_data: "SELECT_NUMBER:5" },
	],
	[
		{ text: "10", callback_data: "SELECT_NUMBER:10" },
		{ text: "20", callback_data: "SELECT_NUMBER:20" },
	],
	[{ text: "Custom", callback_data: "SELECT_NUMBER:CUSTOM" }],
];

export const exportAsKeyboard = [
	[
		{ text: "csv", callback_data: "SELECT_EXPORT_FORMAT:CSV" },
		{ text: "txt", callback_data: "SELECT_EXPORT_FORMAT:TXT" },
	],
	[
		{ text: "json", callback_data: "SELECT_EXPORT_FORMAT:JSON" },
		{ text: "message", callback_data: "SELECT_EXPORT_FORMAT:MESSAGE" },
	],
];
