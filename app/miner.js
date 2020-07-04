//

const Wallet = require('../wallet/wallet');
const Transaction = require('../wallet/transaction');
const TransactionPool = require('../wallet/transaction-pool');
const Blockchain = require('../blockchain');

class Miner {

  constructor(
    blockchain,
    transactionPool,
    wallet,
    pubsub
  ) {
    this.blockchain = blockchain;
    this.transactionPool = transactionPool;
    this.wallet = wallet;
    this.pubsub = pubsub;
  }

  mine() {
    const validTransactions = this.transactionPool.validTransactions();
    validTransactions.push(
      Transaction.rewardTransaction(this.wallet, Wallet.blockchainWallet())
    );
    // create a block consisting of valid transactions
    const block = this.blockchain.addBlock(validTransactions);

    this.pubsub.broadcastChain();

    this.transactionPool.clear();


    return block;
  }
}

module.exports = Miner;
