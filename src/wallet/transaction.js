// @flow

const ChainUtil = require('../chain-util');
const {MINING_REWARD} = require('../config');

export type TransactionInput = {
	timestamp: number,
	amount: number,
	address: string,
	signature: string
}

export type TransactionOutput = {
	amount: number,
	address: string
}

class Transaction {
	id: string;
	input: TransactionInput;
	outputs: Array<TransactionOutput>;

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

	addOutput(senderWallet: any, recipient: string, amount: number): Transaction {
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

	static transactionsWithOutputs(senderWallet: any, outputs: Array<TransactionOutput>) {
		const transaction = new this();
		transaction.outputs.push(...outputs);
		Transaction.signTransaction(transaction, senderWallet);
		return transaction;
	}

	static newTransaction(
		senderWallet: any,
		recipient: string,
		amount: number
	): Transaction {
		if (amount > senderWallet.balance) {
			console.log(`Amount: ${amount} exceeds balance.`);
			throw "Amount exceeds the balance";
		}
		return Transaction.transactionsWithOutputs(senderWallet, [
				{amount: senderWallet.balance - amount, address: senderWallet.publicKey},
				{amount: amount, address: recipient}]
		);
	}

	static rewardTransaction(minerWallet: any, blockchainWallet: any) {
		return Transaction.transactionsWithOutputs(
			blockchainWallet,
			[{amount: MINING_REWARD, address: minerWallet.publicKey}]
		);
	}

	static signTransaction(transaction: Transaction, senderWallet: any) {
		transaction.input = {
			timestamp: Date.now(),
			amount: senderWallet.balance,
			address: senderWallet.publicKey,
			signature: senderWallet.sign(
				ChainUtil.hash(transaction.outputs)
			)
		}
	}

	static verifyTransaction(transaction: Transaction) {
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
