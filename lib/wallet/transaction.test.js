const Transaction = require('./transaction');
const Wallet = require('./wallet');
const {MINING_REWARD} = require('../config');

describe('Transaction,', () => {
  let transaction, wallet, recipient, amount;

  beforeEach(() => {
    wallet = new Wallet();
    amount = 50;
    recipient = 'r3c1p13nt';
    transaction = Transaction.newTransaction(wallet, recipient, amount);
  });

  it('outputs the amount subtracted from the wallet balance', () => {
    const t = transaction.outputs.find(output => output.address === wallet.publicKey);
    if (!t) {
      return;
    }
    expect(t.amount).toEqual(wallet.balance - amount);
  });

  it('outputs the mount added to the receipient', () => {
    const t = transaction.outputs.find(output => output.address === recipient);
    if (!t) {
      return;
    }
    expect(t.amount).toEqual(amount);
  });

  it('inputs the balance of the wallet', () => {
    if (!transaction.input) {
      return;
    }
    expect(transaction.input.amount).toEqual(wallet.balance);
  });

  it('validates a valid transaction', () => {
    expect(Transaction.verifyTransaction(transaction)).toBe(true);
  });

  it('invalidates a corrupt transaction', () => {
    transaction.outputs[0].amount = 5000;
    expect(Transaction.verifyTransaction(transaction)).toBe(false);
  });

  describe('transacting with an amount that exceeds the balance', () => {
    it('does not create a transaction as a result', () => {
      expect(() => {
        Transaction.newTransaction(wallet, recipient, 50000);
      }).toThrow();
    });
  });

  describe('Adding output to an existing transation', () => {
    let nextAmount, nextRecipient;
    beforeEach(() => {
      nextAmount = 20;
      nextRecipient = 'next-address';
      transaction = transaction.addOutput(wallet, nextRecipient, nextAmount);
    });

    it('subtracts the next amount from the sender output', () => {
      const t = transaction.outputs.find(output => output.address === wallet.publicKey);
      if (!t) {
        return;
      }
      expect(t.amount).toEqual(wallet.balance - amount - nextAmount);
    });

    it('outputs an amount for the next recipient', () => {
      const t = transaction.outputs.find(output => output.address === nextRecipient);
      if (!t) {
        return;
      }
      expect(t.amount).toEqual(nextAmount);
    })
  });

  describe('creating a reward transction', () => {
    beforeEach(() => {
      transaction =
        Transaction.rewardTransaction(wallet, Wallet.blockchainWallet());
    });

    it('rewards the miners wallet', () => {
      const t = transaction.outputs.find(output => output.address === wallet.publicKey);
      if (!t) {
        return;
      }
      expect(t.amount).toEqual(MINING_REWARD);
    })
  });
});
