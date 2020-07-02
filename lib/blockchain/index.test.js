const Blockchain = require('./index');
const Block = require('./block');
const Wallet = require('../wallet/wallet');
const Transaction = require('../wallet/transaction');

describe('Blockchain', () => {
	let bc, bc2, testTransactionData, testTransaction2;
	beforeEach(() => {
		const wallet = new Wallet();
		testTransactionData = [Transaction.newTransaction(wallet, "address", 40)];
		testTransaction2 = Transaction.newTransaction(wallet, "address2", 44);

		bc = new Blockchain();
		bc2 = new Blockchain();
	});

	it('starts with genesis block', () => {
		expect(bc.chain[0]).toEqual(Block.genesis());
	});

	it('adds new block', () => {
		bc.addBlock(testTransactionData);
		expect(bc.chain[bc.chain.length-1].data).toEqual(testTransactionData);
	});

	it('validates a valid chain', () => {
		bc2.addBlock(testTransactionData);
		expect(Blockchain.isValidChain(bc2.chain)).toBe(true);
	});

	it('invalidates a chain with a corrupt genesis block', () => {
		bc2.chain[0].data = [testTransaction2];

		expect(Blockchain.isValidChain(bc2.chain)).toBe(false);
	});

	it('invalidates a chain with a corrupt mid block', () => {
		bc2.addBlock(testTransactionData);
		bc2.addBlock(testTransactionData);
		bc2.addBlock(testTransactionData);
		bc2.chain[1].data = [testTransaction2];

		expect(Blockchain.isValidChain(bc2.chain)).toBe(false);
	});

	it('replaces a chain with new one if valid', () => {
		bc2.addBlock(testTransactionData);
		bc.replaceChain(bc2.chain);
		expect(bc.chain).toEqual(bc2.chain);
	});

	it('does not replace chain with length less or equal', () => {
		bc.addBlock(testTransactionData);
		bc.replaceChain(bc2.chain);

		expect(bc.chain).not.toEqual(bc2.chain);
	});

	describe('and the chain contains a block with jumped difficulty', () => {
		it('returns false when difficulty jumps lower', () => {
			const lastBlock = bc.chain[bc.chain.length - 1];
			const lastHash = lastBlock.hash;
			const timestamp = Date.now();
			const nonce = 0;
			const data = [];
			const difficulty = lastBlock.difficulty - 3;
			const hash = Block.hash(timestamp, lastHash, data, nonce, difficulty);
			const badBlock = new Block(
				{timestamp, lastHash, hash, nonce, difficulty, data}
			);
			bc.chain.push(badBlock);
			expect(Blockchain.isValidChain(bc.chain)).toBe(false);
		});
	});

	it('returns false when difficulty jumps higher', () => {
		const lastBlock = bc.chain[bc.chain.length - 1];
		const lastHash = lastBlock.hash;
		const timestamp = Date.now();
		const nonce = 0;
		const data = [];
		const difficulty = lastBlock.difficulty + 3;
		const hash = Block.hash(timestamp, lastHash, data, nonce, difficulty);
		const badBlock = new Block(
			{timestamp, lastHash, hash, nonce, difficulty, data}
		);
		bc.chain.push(badBlock);
		expect(Blockchain.isValidChain(bc.chain)).toBe(false);
	});
});
