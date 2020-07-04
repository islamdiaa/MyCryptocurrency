// @flow

const express = require('express');
const bodyParser = require('body-parser');
const Blockchain = require('./blockchain');
const Wallet = require('./wallet/wallet');
const TransactionPool = require('./wallet/transaction-pool');
const Miner = require('./app/miner');
const PubSub = require('./app/pubsub');
const request = require('request');
const path = require('path');


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
const pubsub = new PubSub(bc, tp);
const miner = new Miner(bc, tp, wallet, pubsub);

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, './client/dist')));

app.get('/api/blocks', (req, res) => {
	res.json(bc.chain);
});

app.get('/api/transactions', (req, res) => {
	res.json(tp.transactions);
});

app.post('/api/mine', (req, res) => {
	const block = bc.addBlock(req.body.data);
	console.log(`New block added: ${block.toString()}`);

	pubsub.broadcastChain();

	res.redirect('/blocks');
});

app.get('/api/mine-transactions', (req, res) => {
	const block = miner.mine();
	console.log(`New block added: ${block.toString()}`);
	res.redirect('/blocks');
});

app.post('/api/transact', (req, res) => {
	const { recipient, amount } = req.body;
	const transaction = wallet.createTransaction(recipient, amount, bc, tp);
	pubsub.broadcastTransaction(transaction);
	res.json({ type: 'success', transaction });
});

app.get('/api/balance', (req, res) => {
  res.json({ balance: wallet.calculateBalance(bc) });
});

app.get('/api/wallet-info', (req, res) => {
  res.json( {...wallet.getInfo()} );
});

app.get('/api/public-key', (req, res) => {
  res.json({ publicKey: wallet.publicKey });
});

app.get('*', (req, res) => {
	res.sendFile(path.join(__dirname, './client/dist/index.html'));
});

const syncWithRootState = () => {
	if (!PEER_PORT) {
		return;
	}
	request({url: `${ROOT_NODE_ADDRESS}/api/blocks`}, (error, response, body) => {
		if (!error && response.statusCode === 200) {
			const rootChain = JSON.parse(body);
			bc.replaceChain(rootChain);
			console.log('Replace chain on sync with', rootChain);
		} else {
			console.log('Error with http request: ', error);
		}
	});

	request({url: `${ROOT_NODE_ADDRESS}/api/transactions`}, (error, response, body) => {
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
