const Block = require('./block');
const Transaction = require('../wallet/transaction');

class Blockchain {
	chain;

	constructor() {
		this.chain = [Block.genesis()];
	}

	addBlock(data) {
		const lastBlock = this.chain[this.chain.length - 1];
		const block = Block.mineBlock(lastBlock, data);
		this.chain.push(block);

		return block;
	}

	static isValidChain(chain) {
		if(JSON.stringify(chain[0]) !== JSON.stringify(Block.genesis())) {
			return false;
		}

		for (let i = 1; i < chain.length; ++i) {
			const block = chain[i];
			const lastBlock = chain[i - 1];
			if (block.lastHash !== lastBlock.hash ||
				block.hash !== Block.blockHash(block) ||
				Math.abs(lastBlock.difficulty - block.difficulty) > 1) {
				return false;
			}
		}

		return true;
	}

	replaceChain(newChain) {
		if (newChain.length <= this.chain.length) {
			console.log("Received chain is not longer than current!");
			return;
		} else if (!Blockchain.isValidChain(newChain)) {
			console.log("Received chain is not valid!");
			return;
		}
		console.log("Replacing blockchain with the new chain!");
		this.chain = newChain;
	}
}

module.exports = Blockchain;
