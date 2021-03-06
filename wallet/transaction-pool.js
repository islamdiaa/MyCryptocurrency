const Transaction = require('../wallet/transaction');

class TransactionPool {
  transactions;

  constructor() {
    this.transactions = [];
  }

  updateOrAddTransaction(transaction) {
    let transactionWithId = this.transactions.find(
      t => t.id === transaction.id
    );

    if (transactionWithId) {
      this.transactions[this.transactions.indexOf(transactionWithId)] =
        transaction;
    } else {
      this.transactions.push(transaction);
    }
  }

  existingTransaction(address) {
    return this.transactions.find(t => t.input && t.input.address === address);
  }

  validTransactions() {
    return this.transactions.filter(transaction => {
      const totalOutput = transaction.outputs.reduce((total, output) => {
        return total + output.amount;
      }, 0);

      if (transaction.input && transaction.input.amount !== totalOutput) {
        console.log(`Invalid transaction from ${transaction.input.address}.`);
        return null;
      }

      if (!Transaction.verifyTransaction(transaction)) {
        if (transaction.input) {
          console.log(`Invalid transaction from ${transaction.input.address}.`);
        }
        return null;
      }

      return transaction;
    });
  }

  replaceTransactionPool(transactions) {
    this.transactions = transactions;
  }

  clear() {
    this.transactions = [];
  }
}

module.exports = TransactionPool;
