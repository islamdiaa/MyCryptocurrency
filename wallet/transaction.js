// 

const ChainUtil = require('../chain-util');
const {MINING_REWARD} = require('../config');



class Transaction {
	id;
	input;
	outputs;

	constructor() {
		this.id = ChainUtil.id();
		this.input = {
			timestamp: 0,
			amount: 0,
			address: '',
			signature: ''
		};
		this.outputs = [];
	}

	addOutput(senderWallet, recipient, amount) {
		const senderOutput = this.outputs.find(
			output => output.address === senderWallet.publicKey
		);
		if (senderOutput && amount > senderOutput.amount) {
			console.log(`Amount: ${amount} exceeds the balance.`);
			throw("Amount exceeds the balance");
		}

		if (senderOutput) {
			senderOutput.amount = senderOutput.amount - amount;
		}
		this.outputs.push({amount, address: recipient});
		Transaction.signTransaction(this, senderWallet);
		return this;
	}

	static transactionsWithOutputs(senderWallet, outputs) {
		const transaction = new this();
		transaction.outputs.push(...outputs);
		Transaction.signTransaction(transaction, senderWallet);
		return transaction;
	}

	static newTransaction(
		senderWallet,
		recipient,
		amount
	) {
		if (amount > senderWallet.balance) {
			console.log(`Amount: ${amount} exceeds balance.`);
			throw "Amount exceeds the balance";
		}
		return Transaction.transactionsWithOutputs(senderWallet, [
				{amount: senderWallet.balance - amount, address: senderWallet.publicKey},
				{amount: amount, address: recipient}]
		);
	}

	static rewardTransaction(minerWallet, blockchainWallet) {
		return Transaction.transactionsWithOutputs(
			blockchainWallet,
			[{amount: MINING_REWARD, address: minerWallet.publicKey}]
		);
	}

	static signTransaction(transaction, senderWallet) {
		transaction.input = {
			timestamp: Date.now(),
			amount: senderWallet.balance,
			address: senderWallet.publicKey,
			signature: senderWallet.sign(
				ChainUtil.hash(transaction.outputs)
			)
		}
	}

	static verifyTransaction(transaction) {
		if (!transaction.input) {
			return;
		}
		return ChainUtil.verifySignature(
			transaction.input.address,
			transaction.input.signature,
			ChainUtil.hash(transaction.outputs)
		);
	}
}

module.exports = Transaction;
