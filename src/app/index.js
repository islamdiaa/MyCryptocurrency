// @flow

const express = require('express');
const bodyParser = require('body-parser');
const Blockchain = require('../blockchain');
const Wallet = require('../wallet/wallet');
const TransactionPool = require('../wallet/transaction-pool');
const Miner = require('./miner');
const PubSub = require('./pubsub');
const request = require('request');


const DEFAULT_PORT = 3001;
let PEER_PORT;

const ROOT_NODE_ADDRESS = `http://localhost:${DEFAULT_PORT}`;

if (process.env.GENERATE_PEER_PORT === 'true') {
	PEER_PORT = DEFAULT_PORT + Math.ceil(Math.random() * 1000);
}

const app = express();
const bc = new Blockchain();
const tp = new TransactionPool();
const wallet = new Wallet();
const miner = new Miner(bc, tp, wallet);
const pubsub = new PubSub(bc, tp);

app.use(bodyParser.json());

app.get('/blocks', (req, res) => {
	res.json(bc.chain);
});

app.get('/transactions', (req, res) => {
	res.json(tp.transactions);
});

app.post('/mine', (req, res) => {
	const block = bc.addBlock(req.body.data);
	console.log(`New block added: ${block.toString()}`);

	pubsub.broadcastChain();

	res.redirect('/blocks');
});

app.get('/mine-transactions', (req, res) => {
	const block = miner.mine();
	console.log(`New block added: ${block.toString()}`);
	res.redirect('/blocks');
});

app.post('/transact', (req, res) => {
	const { recipient, amount } = req.body;
	const transaction = wallet.createTransaction(recipient, amount, bc, tp);
	pubsub.broadcastTransaction(transaction);
	res.redirect('/transactions');
});

app.get('/balance', (req, res) => {
  res.json({ balance: wallet.calculateBalance(bc) });
});

app.get('/public-key', (req, res) => {
  res.json({ publicKey: wallet.publicKey });
});

const syncWithRootState = () => {
	if (!PEER_PORT) {
		return;
	}
	request({url: `${ROOT_NODE_ADDRESS}/blocks`}, (error, response, body) => {
		if (!error && response.statusCode === 200) {
			const rootChain = JSON.parse(body);
			bc.replaceChain(rootChain);
			console.log('Replace chain on sync with', rootChain);
		} else {
			console.log('Error with http request: ', error);
		}
	});

	request({url: `${ROOT_NODE_ADDRESS}/transactions`}, (error, response, body) => {
		if (!error && response.statusCode === 200) {
			const rootTp = JSON.parse(body);
			tp.replaceTransactionPool(rootTp);
			console.log('Replace transaction pool on sync with', rootTp);
		} else {
			console.log('Error with http request: ', error);
		}
	});
}

app.listen(
	PEER_PORT || DEFAULT_PORT,
	() => {
		console.log(`Listen on port ${PEER_PORT || DEFAULT_PORT}`);
		syncWithRootState();
	}
);
