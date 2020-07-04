const Websocket = require('ws');
const TransactionPool = require('../wallet/transaction-pool');
const Transaction = require('../wallet/transaction');
const Blockchain = require('../blockchain');

const P2P_PORT = process.env.P2P_PORT || 5002;
const peers = process.env.PEERS ? process.env.PEERS.split(',') : [];
const MESSAGE_TYPES = {
	chain: 'CHAIN',
	transaction: 'TRANSACTION',
	clear_transactions: 'CLEAR_TRANSACTIONS'
}

class P2PServer {
	blockchain;
	transactionPool;
	sockets;

	constructor(blockchain, transactionPool) {
		this.blockchain = blockchain;
		this.transactionPool = transactionPool;
		this.sockets = [];
	}

	listen() {
		const server = new Websocket.Server({port: P2P_PORT});
		server.on('connection', socket => this.connectSocket(socket));

		this.connectToPeers();

		console.log(`Listening on peer-to-peer connetion on ${P2P_PORT}`);
	}

	connectToPeers() {
		peers.forEach(peer => {
			const socket = new Websocket(peer);
			socket.on('open', () => this.connectSocket(socket));
		});
	}

	connectSocket(socket) {
		this.sockets.push(socket);
		console.log('Socket connected');

		this.messageHandler(socket);

		this.sendChain(socket);
	}

	messageHandler(socket) {
		socket.on('message', message => {
			const data = JSON.parse(message);
			switch(data.type) {
				case MESSAGE_TYPES.chain:
					this.blockchain.replaceChain(data.chain);
					break;
				case MESSAGE_TYPES.transaction:
					this.transactionPool.updateOrAddTransaction(data.transaction);
					break;
				case MESSAGE_TYPES.clear_transactions:
					this.transactionPool.clear();
					break;
			}
		});
	}

	syncChains() {
		this.sockets.forEach(socket => {
			this.sendChain(socket);
		});
	}

	sendChain(socket) {
		socket.send(JSON.stringify({
			type: MESSAGE_TYPES.chain,
			chain: this.blockchain.chain
		}));
	}

	broadcastTransaction(transaction) {
		this.sockets.forEach(socket => this.sendTransaction(socket, transaction));
	}

	sendTransaction(socket, transaction) {
		socket.send(JSON.stringify({
			type: MESSAGE_TYPES.transaction,
			transaction
		}));
	}

	broadcastClearTransactions() {
		this.sockets.forEach(
			socket => socket.send(
				JSON.stringify({type: MESSAGE_TYPES.clear_transactions})
			)
		);
	}
}

module.exports = P2PServer;
