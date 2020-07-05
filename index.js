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

const isDevelopment = process.env.ENV === 'development';

const REDIS_URL =
	isDevelopment ?
	'redis://127.0.0.1:6379' :
	'redis://h:pacf25dbb64acdf5bd2a39b31ca4b1a42b1c8102d1dcc35280afdeb3d79ad7992@ec2-34-197-70-65.compute-1.amazonaws.com:19539';

const ROOT_NODE_ADDRESS = `http://localhost:${DEFAULT_PORT}`;

if (process.env.GENERATE_PEER_PORT === 'true') {
	PEER_PORT = DEFAULT_PORT + Math.ceil(Math.random() * 1000);
}

const app = express();
const bc = new Blockchain();
const tp = new TransactionPool();
const wallet = new Wallet();
const pubsub = new PubSub(bc, tp, REDIS_URL);
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
	res.redirect('/api/blocks');
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
  res.json( {...wallet.getInfo(bc)} );
});

app.get('/api/public-key', (req, res) => {
  res.json({ publicKey: wallet.publicKey });
});

app.get('*', (req, res) => {
	res.sendFile(path.join(__dirname, './client/dist/index.html'));
});

const syncWithRootState = () => {
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

const PORT = process.env.PORT || PEER_PORT || DEFAULT_PORT;

app.listen(
	PORT,
	() => {
		console.log(
			`Listen on port ${PORT}`
		);
		if (PORT !== DEFAULT_PORT) {
	    syncWithRootState();
	  }
	}
);
