# 💲 Web3 Wallet Generator (Telegram Bot)

![GitHub repo size](https://img.shields.io/github/repo-size/sakomg/web3-wallet-generator)
![GitHub last commit](https://img.shields.io/github/last-commit/sakomg/web3-wallet-generator)
![GitHub issues](https://img.shields.io/github/issues/sakomg/web3-wallet-generator)

This bot helps users generate cryptocurrency wallets for different blockchain networks directly through Telegram. The bot supports multiple formats for exporting wallet data and ensures that all generated data remains secure and private, accessible only by the user.

## Table of Contents

- [Features](#features)
- [Usage](#usage)
- [Security](#security)
- [Contributing](#contributing)
- [Support](#support)
- [License](#license)

## Features

- **Support for Multiple Chains**: Generate wallets for Ethereum (EVM) and TON (Telegram Open Network).
- **User-Friendly Interface**: Interact with the bot through simple Telegram commands and prompts.
- **Fast and Easy to Use**: Generate wallets in just a few clicks without any technical knowledge.
- **Export Options**: Choose from multiple formats (CSV, TXT, JSON, or message) to export your wallet details.
- **Open Source**: Full transparency and community-driven development.
- **Privacy First**: All generated data remains in the hands of the user; no data is stored or transmitted to external servers.

## Usage

1. Open Telegram and search for `@generate_wallets_bot`.
2. Start a conversation with the bot by typing `/start`.
3. Follow the prompts to:
   - Select a blockchain network (e.g., Ethereum, TON).
   - Choose the number of wallets to generate.
   - Select the format for exporting your wallet data (CSV, TXT, JSON, or message).

The bot will generate the requested wallets and send you the details in your chosen format. The process is designed to be simple and quick, allowing you to generate wallets in just a few steps.

## Security

One of the main advantages of this bot is its focus on security and privacy:

- **Open Source**: The code is open for review, ensuring transparency.
- **Local Generation**: Wallets are generated locally within the bot, and data is never transmitted to external servers.
- **User-Controlled Data**: All generated wallet details are sent directly to the user, ensuring that only the user has access to the sensitive information.

## Contributing

Welcome contributions from the community! If you have ideas, bug reports, or improvements, feel free to open an issue or submit a pull request.

### Adding Support for New Chains

Developers can extend the bot by adding support for new blockchain networks. To do this, follow these steps:

1. Implement wallet generation logic for the new chain.
2. Update the bot's state machine to include the new chain.
3. Submit a pull request with the new functionality.

## Support

If you find this project useful and would like to support its development, you can send crypto donations to the following Ethereum (EVM) wallet address:

```text
0x0D7D1Dd57D03872298236403d8d5d7A78135d417
```

Your support is greatly appreciated!

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more details.
