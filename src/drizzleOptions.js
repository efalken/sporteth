
import Betting from './contracts/solidityjson/Betting.json'
import Oracle from './contracts/solidityjson/Oracle.json';
import Token from './contracts/solidityjson/Token.json';

const drizzleOptions = {
  web3: {
    block: false,
    fallback: {
      type: 'ws',
      url: 'wss://rinkeby.infura.io/ws/v3/790364983f7a4b8ebb6b0ac344360e57'
      //type: 'https',
      //url: 'https://arbitrum-rinkeby.infura.io/v3/790364983f7a4b8ebb6b0ac344360e57'
    }
  },

  contracts: [Betting],
  polls: {
    accounts: 1500
  }
}

export default drizzleOptions
