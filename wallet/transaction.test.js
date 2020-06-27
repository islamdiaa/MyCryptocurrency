const Transaction = require('./transaction');
const Wallet = require('./index');
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
    expect(
      transaction.outputs.find(output => output.address === wallet.publicKey).amount
    ).toEqual(wallet.balance - amount);
  });

  it('outputs the mount added to the receipient', () => {
    expect(
      transaction.outputs.find(output => output.address === recipient).amount
    ).toEqual(amount);
  });

  it('inputs the balance of the wallet', () => {
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
    beforeEach(() => {
      amount = 50000;
      transaction = Transaction.newTransaction(wallet, recipient, amount);
    });

    it('does not create a transaction as a result', () => {
      expect(transaction).toEqual(undefined);
    });
  });

  describe('Adding output to an existing transation', () => {
    beforeEach(() => {
      nextAmount = 20;
      nextRecipient = 'next-address';
      transaction = transaction.addOutput(wallet, nextRecipient, nextAmount);
    });

    it('subtracts the next amount from the sender output', () => {
      expect(
        transaction.outputs.find(
          output => output.address === wallet.publicKey
        ).amount
      ).toEqual(wallet.balance - amount - nextAmount);
    });

    it('outputs an amount for the next recipient', () => {
      expect(transaction.outputs.find(
          output => output.address === nextRecipient
        ).amount
      ).toEqual(nextAmount);
    })
  });

  describe('creating a reward transction', () => {
    beforeEach(() => {
      transaction =
        Transaction.rewardTransaction(wallet, Wallet.blockchainWallet());
    });

    it('rewards the miners wallet', () => {
      expect(
        transaction.outputs.find(
          output => output.address === wallet.publicKey
        ).amount
      ).toEqual(MINING_REWARD);
    })
  });
});
