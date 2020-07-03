// @flow

const redis = require('redis');
const Blockchain = require('../blockchain');
const Transaction = require('../wallet/transaction');
const TransactionPool = require('../wallet/transaction-pool');

const CHANNELS = {
  TEST: 'TEST',
  BLOCKCHAIN: 'BLOCKCHAIN',
  TRANSACTION: 'TRANSACTION',
}

class PubSub {
  blockchain: Blockchain;
  transactionPool: TransactionPool;
  publisher: any;
  subscriber: any;

  constructor(blockchain: Blockchain, transactionPool: TransactionPool) {
    this.blockchain = blockchain;
    this.transactionPool = transactionPool;
    this.publisher = redis.createClient();
    this.subscriber = redis.createClient();

    this.subscribeToChannels();
    this.subscriber.on(
      'message',
      (channel, message) => this.handleMessage(channel, message)
    );
  }

  handleMessage(channel: any, message: any) {
    console.log(`Message received. Channel: ${channel}. Message ${message}`);
    const parsedMessage = JSON.parse(message);

    switch(channel) {
      case CHANNELS.BLOCKCHAIN:
        this.blockchain.replaceChain(parsedMessage);
        break;
      case CHANNELS.TRANSACTION:
        this.transactionPool.updateOrAddTransaction(parsedMessage);
        break;
      default:
        return;
    }
  }

  subscribeToChannels() {
    Object.values(CHANNELS).forEach(channel => {
      this.subscriber.subscribe(channel);
    });
  }

  publish(channel: any, message: string) {
    this.subscriber.unsubscribe(channel, () => {
      this.publisher.publish(channel, message, () => {
        this.subscriber.subscribe(channel);
      });
    });
  };

  broadcastChain() {
    this.publish(CHANNELS.BLOCKCHAIN, JSON.stringify(this.blockchain.chain));
  }

  broadcastTransaction(transaction: Transaction) {
    this.publish(CHANNELS.TRANSACTION, JSON.stringify(transaction));
  }
}


module.exports = PubSub;
