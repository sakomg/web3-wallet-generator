export default class Wallets {
	#wallets = [];
	#format = "";

	constructor(format, wallets) {
		this.#format = format;
		this.#wallets = wallets;
	}

	getContent() {
		if (!this.#format) {
			throw new Error(`⚠️ Provide format to export wallets.`);
		}

		const formatHandlers = {
			CSV: this.#asCSV.bind(this),
			TXT: this.#asText.bind(this),
			MESSAGE: this.#asMessage.bind(this),
			JSON: this.#asJSON.bind(this),
		};

		const handler = formatHandlers[this.#format];

		if (!handler) {
			throw new Error(`⚠️ Unsupported format (${this.#format}) to export wallets.`);
		}

		return handler();
	}

	#asCSV() {
		let csvContent = "Account,Password,Address,Private Key,Seed Phrase\r\n";
		for (let idx = 0; idx < this.#wallets.length; idx++) {
			const w = this.#wallets[idx];
			csvContent += `${w.idx},${w.password},${w.wallet.address},${w.wallet.privateKey},${w.wallet.seed}\r\n`;
		}
		return csvContent;
	}

	#asText() {
		let txtContent = "";
		for (let idx = 0; idx < this.#wallets.length; idx++) {
			const w = this.#wallets[idx];
			txtContent += `Account: ${w.idx}\r\nPassword: ${w.password}\r\nAddress: ${w.wallet.address}\r\nPrivate Key: ${w.wallet.privateKey}\r\nSeed Phrase: ${w.wallet.seed}\n\n`;
		}
		return txtContent;
	}

	#asJSON() {
		return JSON.stringify(this.#wallets, null, 2);
	}

	#asMessage() {
		let walletsArray = [];
		let chunk = [];

		for (let idx = 0; idx < this.#wallets.length; idx++) {
			const w = this.#wallets[idx];
			const walletInfo = `Account: ${w.idx}\nPassword: ${w.password}\nAddress: ${w.wallet.address}\nPrivate Key: ${w.wallet.privateKey}\nSeed Phrase: ${w.wallet.seed}\n\n`;

			if (chunk.length < 5) {
				chunk.push(walletInfo);
			} else {
				walletsArray.push([...chunk]);
				chunk = [walletInfo];
			}
		}

		if (chunk.length > 0) {
			walletsArray.push([...chunk]);
		}

		return walletsArray;
	}
}
