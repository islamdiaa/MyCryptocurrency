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
	blockchain: Blockchain;
	transactionPool: TransactionPool;
	sockets: Array<Websocket>;

	constructor(blockchain: Blockchain, transactionPool: TransactionPool) {
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

	connectSocket(socket: Websocket) {
		this.sockets.push(socket);
		console.log('Socket connected');

		this.messageHandler(socket);

		this.sendChain(socket);
	}

	messageHandler(socket: Websocket) {
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

	sendChain(socket: Websocket) {
		socket.send(JSON.stringify({
			type: MESSAGE_TYPES.chain,
			chain: this.blockchain.chain
		}));
	}

	broadcastTransaction(transaction: Transaction) {
		this.sockets.forEach(socket => this.sendTransaction(socket, transaction));
	}

	sendTransaction(socket: Websocket, transaction: Transaction) {
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
