const Blockchain = require('../blockchain');
const ChainUtil = require('../chain-util');
const Transaction = require('./transaction');
const TransactionPool = require('./transaction-pool');
const {INITIAL_BALANCE} = require('../config');


class Wallet {
	balance;
	keyPair;
	publicKey;
	address;

	constructor() {
		this.balance = INITIAL_BALANCE;
		this.keyPair = ChainUtil.genKeyPair();
		this.publicKey = this.keyPair.getPublic().encode('hex');
	}

	toString() {
		return `Wallet -
			publicKey: ${this.publicKey.toString()}
			balance  : ${this.balance}`;
	}

	sign(dataHash) {
		return this.keyPair.sign(dataHash);
	}

	createTransaction(
		recipient,
		amount,
		blockchain,
		transactionPool
	) {
		this.balance = this.calculateBalance(blockchain);
		if (amount > this.balance) {
			console.log(
				`Amount: ${amount} exceeds the current balance: ${this.balance}`
			);
			throw("Amount exceeds the current balance!");
		}
		let transaction = transactionPool.existingTransaction(this.publicKey);

		if (transaction) {
			transaction.addOutput(this, recipient, amount);
		} else {
			transaction = Transaction.newTransaction(this, recipient, amount);
			transactionPool.updateOrAddTransaction(transaction);
		}
		return transaction;
	}

	calculateBalance(blockchain) {
		let balance = INITIAL_BALANCE;
		let transactions = [];
		blockchain.chain.forEach(block => block.data.forEach(transaction => {
			transactions.push(transaction);
		}));

		const walletInputTs = transactions.filter(
			transaction => transaction.input.address === this.publicKey
		);

		let startTime = 0;
		if (walletInputTs.length > 0) {
			const recentInputT = walletInputTs.reduce(
				(prev, current) =>
					prev.input.timestamp > current.input.timestamp ? prev : current
			);
			balance = 0;
			startTime = recentInputT.input.timestamp;
		}

		transactions.forEach(transaction => {
			if (transaction.input.timestamp >= startTime) {
				transaction.outputs.forEach(output => {
					if (output.address === this.publicKey) {
						balance += output.amount;
					}
				});
			}
		});

		return balance;
	}

	getInfo() {
		return {
			balance: this.balance,
			address: this.publicKey
		}
	}

	static blockchainWallet() {
		const blockchainWallet = new this();
		blockchainWallet.address = 'blockchain-wallet';
		return blockchainWallet;
	}
}

module.exports = Wallet;
