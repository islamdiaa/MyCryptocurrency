const TransactionPool = require('./transaction-pool');
const Transaction = require('./transaction');
const Wallet = require('./index');
const Blockchain = require('../blockchain');

describe('TransactionPool', () => {
  let tp, wallet, transaction;

  beforeEach(() => {
    tp = new TransactionPool();
    wallet = new Wallet();
    bc = new Blockchain();
    transaction = wallet.createTransaction('random', 30, bc, tp);
  });

  it('adds a transaction to pool', () => {
    expect(
      tp.transactions.find(t => t.id === transaction.id)
    ).toEqual(transaction);
  });

  it('updates a transaction in the pool', () => {
    const oldTransaction = JSON.stringify(transaction);
    const newTransaction = transaction.addOutput(wallet, 'foo-address', 40);
    tp.updateOrAddTransaction(newTransaction);
    expect(
      JSON.stringify(tp.transactions.find(t => t.id === newTransaction.id))
    ).not.toEqual(oldTransaction);
    expect(
      tp.transactions.find(t => t.id === newTransaction.id)
    ).toEqual(newTransaction);
  });

  it('it clears transactions', () => {
    tp.clear();
    expect(tp.transactions).toEqual([]);
  });

  describe('mixing valid and corrupt transactions', () => {
    let validTransactions;

    beforeEach(() => {
      validTransactions = [...tp.transactions];
      for (let i = 0; i < 6; i++) {
        wallet = new Wallet();
        transaction = wallet.createTransaction('random2', 30, bc, tp);
        if (i % 2 == 0) {
          transaction.input.amount = 999999;
        } else {
          validTransactions.push(transaction);
        }
      }
    });

    it('shows a difference between valid and corrupt transacrions', () => {
      expect(
        JSON.stringify(tp.transactions)
      ).not.toEqual(JSON.stringify(validTransactions));
    });

    it('gets the proper valid transactions', () => {
      expect(tp.validTransactions()).toEqual(validTransactions);
    });
  });
});
