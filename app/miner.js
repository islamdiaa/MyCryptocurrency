// 

const Wallet = require('../wallet/wallet');
const Transaction = require('../wallet/transaction');
const TransactionPool = require('../wallet/transaction-pool');
const Blockchain = require('../blockchain');

class Miner {
  blockchain;
  transactionPool;
  wallet;

  constructor(
    blockchain,
    transactionPool,
    wallet,
  ) {
    this.blockchain = blockchain;
    this.transactionPool = transactionPool;
    this.wallet = wallet;
  }

  mine() {
    const validTransactions = this.transactionPool.validTransactions();
    validTransactions.push(
      Transaction.rewardTransaction(this.wallet, Wallet.blockchainWallet())
    );
    // create a block consisting of valid transactions
    const block = this.blockchain.addBlock(validTransactions);

    // sync chains in the p2p server

    // clear the transaction pool
    this.transactionPool.clear();

    // broadcast to clear trnasactions pools


    return block;
  }
}

module.exports = Miner;
