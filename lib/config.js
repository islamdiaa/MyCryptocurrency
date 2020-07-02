const DIFFICULTY = 7;
const MINE_RATE = 3000;
const INITIAL_BALANCE = 500;
const MINING_REWARD = 50;
const GENESIS_DATA = {
  timestamp: 1,
  lastHash: '---',
  hash: 'hash-one',
  data: [],
  nonce: 0,
  difficulty: DIFFICULTY
};

module.exports = {
  DIFFICULTY,
  MINE_RATE,
  INITIAL_BALANCE,
  GENESIS_DATA,
  MINING_REWARD};
