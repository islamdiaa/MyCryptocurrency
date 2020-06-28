const Wallet = require('./wallet');
const TransactionPool = require('./transaction-pool');
const Blockchain = require('../blockchain');
const {INITIAL_BALANCE} = require('../config.js');

describe('Wallet', () => {
  let wallet, tp, bc;

  beforeEach(() => {
    wallet = new Wallet();
    tp = new TransactionPool();
    bc = new Blockchain();
  });

  describe('creating a transaction', () => {
    let transaction, sendAmount, recipient;

    beforeEach(() => {
      sendAmount = 50;
      recipient = 'random-address';
      transaction = wallet.createTransaction(recipient, sendAmount, bc, tp);
    });

    describe('and doing the same transaction', () => {
      beforeEach(() => {
        wallet.createTransaction(recipient, sendAmount, bc, tp);
        wallet.createTransaction(recipient, sendAmount, bc, tp);
      });

      it('triples the sendAmount subtracted from the wallet balance', () => {
        const t =
          transaction.outputs.find(
            output => output.address === wallet.publicKey
          );
        if (!t) {
          return;
        }
        expect(t.amount).toEqual(wallet.balance - sendAmount * 3);
      });

      it('clones the sendAmount output for the recipient', () => {
        expect(
          transaction.outputs.filter(
            output => output.address === recipient
          ).map(output => output.amount)
        ).toEqual([sendAmount, sendAmount, sendAmount]);
      });
    });
  });

  describe('calculating a balance', () => {
    let addBalance, repeatAdd, senderWallet;

    beforeEach(() => {
      senderWallet = new Wallet();
      addBalance = 100;
      repeatAdd = 3;
      for (let i = 0; i < repeatAdd; i++) {
        senderWallet.createTransaction(wallet.publicKey, addBalance, bc, tp);
      }

      const block = bc.addBlock(tp.transactions);
    });

    it('calculates the balance for the recipient', () => {
      expect(
        wallet.calculateBalance(bc)
      ).toEqual(INITIAL_BALANCE + addBalance * repeatAdd);
    });

    it('calculates the balance for the sender', () => {
      expect(
        senderWallet.calculateBalance(bc)
      ).toEqual(INITIAL_BALANCE - addBalance * repeatAdd);
    });

    describe('recipient conducts a transaction', () => {
      let subtractBalance, recipientBalance;

      beforeEach(() => {
        tp.clear();
        subtractBalance = 60;
        recipientBalance = wallet.calculateBalance(bc);
        wallet.createTransaction(
          senderWallet.publicKey, subtractBalance, bc, tp
        );
        bc.addBlock(tp.transactions);
      });

      describe('and sender sends another transaction to the recipient', () => {
        beforeEach(() => {
          tp.clear();
          senderWallet.createTransaction(wallet.publicKey, addBalance, bc, tp);
          bc.addBlock(tp.transactions);
        });

        it('calculates the recipient balance only using the transaction since its most recent transaction',
          () => {
            expect(
              wallet.calculateBalance(bc)
            ).toEqual(recipientBalance + addBalance - subtractBalance);
        });

        it('calculates the sender balance',
          () => {
            const expectedSenderWalletBalance =
              INITIAL_BALANCE - addBalance * (repeatAdd + 1) + subtractBalance;
            expect(
              senderWallet.calculateBalance(bc)
            ).toEqual(expectedSenderWalletBalance);
        });
      });
    });
  });
});
