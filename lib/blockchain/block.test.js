const Block = require('./block');
const Transaction = require('../wallet/transaction');
const Wallet = require('../wallet/wallet');
const {GENESIS_DATA} = require('../config');

describe('Block', () => {
	let data, lastBlock, block;
	beforeEach(() => {
		const wallet = new Wallet();
		data = [Transaction.newTransaction(wallet, "address", 40)];
		lastBlock = Block.genesis();
		block = Block.mineBlock(lastBlock, data);
	});

	describe('genesis()', () => {
		const genesisBlock = Block.genesis();

		it ('returns a Block instance', () => {
			expect(genesisBlock instanceof Block).toBe(true);
		});

		it ('returns the genesis data', () => {
			expect(genesisBlock).toEqual(GENESIS_DATA);
		});
	});

	it(
		'sets the data to match the given input',
		() => {
			expect(block.data).toEqual(data);
		}
	);

	it(
		'set the lastHash to match the hash of last block',
		() => {
			expect(block.lastHash).toEqual(lastBlock.hash);
		}
	);

	it(
		'generates a hash that matches the difficulty',
		() => {
			expect(block.hash.substring(0, block.difficulty)).toEqual('0'.repeat(block.difficulty));
	});

	it('lowers the difficulty for slowly mined blocks',
		() => {
			expect(Block.adjustDifficulty(block, block.timestamp+360000)).toEqual(block.difficulty - 1);
	});

	it('raises the difficulty for quickly mined blocks',
		() => {
			expect(Block.adjustDifficulty(block, block.timestamp+1)).toEqual(block.difficulty + 1);
	});
});
