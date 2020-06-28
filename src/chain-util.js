// @flow

const EC = require('elliptic').ec;
const uuidV1 = require('uuid').v1;
const ec = new EC('secp256k1');
const SHA256 = require('crypto-js/sha256');

class ChainUtil {
	static genKeyPair() {
		return ec.genKeyPair();
	}

	static id() {
		return uuidV1();
	}

	static hash(data: any): string {
		return SHA256(JSON.stringify(data)).toString();
	}

	static verifySignature(publicKey: string, signature: string, dataHash: string) {
		return ec.keyFromPublic(publicKey, 'hex').verify(dataHash, signature);
	}
}

module.exports = ChainUtil;
