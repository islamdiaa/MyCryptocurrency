// @flow

const SHA256 = require('crypto-js/sha256');
const {DIFFICULTY, MINE_RATE, GENESIS_DATA} = require('../config');
const ChainUtil = require('../chain-util');
const Transaction = require('../wallet/transaction');

class Block {
	timestamp: number;
	lastHash: string;
	hash: string;
	data: Array<Transaction>;
	nonce: number;
	difficulty: number;

	// Constructor
	constructor(
		buildData: {
			timestamp: number,
			lastHash: string,
			hash: string,
			data: Array<Transaction>,
			nonce: number,
			difficulty: number
	}) {
		const {timestamp, lastHash, hash, data, nonce, difficulty} = buildData;
		this.timestamp = timestamp;
		this.lastHash = lastHash;
		this.hash = hash;
		this.data = data;
		this.nonce = nonce;
		this.difficulty = difficulty || DIFFICULTY;
	}

	toString() {
		return `Block -
			Timestamp : ${this.timestamp}
			Last Hash : ${this.lastHash.substring(0, 10)}
			Hash      : ${this.hash.substring(0, 10)}
			Nonce     : ${this.nonce}
			Difficulty: ${this.difficulty}
			Data      : ${JSON.stringify(this.data)}`;
	}

	static genesis() {
		return new this(GENESIS_DATA);
	}

	static mineBlock(lastBlock: Block, data: Array<Transaction>) {
		let timestamp;
		const lastHash = lastBlock.hash;
		let {difficulty} = lastBlock;
		let nonce = 0;
		let hash;
		do {
			nonce++;
			timestamp = Date.now();
			difficulty = Block.adjustDifficulty(lastBlock, timestamp);
			hash = Block.hash(timestamp, lastHash, data, nonce, difficulty);
		} while(hash.substring(0, difficulty) !== '0'.repeat(difficulty));

		return new this({timestamp, lastHash, hash, data, nonce, difficulty});
	}

	static hash(
		timestamp: number,
		lastHash: string,
		data: Array<Transaction>,
		nonce: number,
		difficulty: number
	): string {
		return ChainUtil.hash(
			`${timestamp}${lastHash}${JSON.stringify(data)}${nonce}${difficulty}`
		).toString();
	}

	static blockHash(block: Block) {
		const {timestamp , lastHash, data, nonce, difficulty} = block;
		return Block.hash(timestamp, lastHash, data, nonce, difficulty);
	}

	static adjustDifficulty(lastBlock: Block, currentTime: number) {
		let {difficulty} = lastBlock;
		difficulty = lastBlock.timestamp + MINE_RATE > currentTime ? difficulty + 1 : difficulty - 1;
		return difficulty || 1;
	}
}

module.exports = Block;
