/**
 * @type import('hardhat/config').HardhatUserConfig
 */
require('@nomiclabs/hardhat-waffle')
module.exports = {
  //solidity: "0.8.0",
  paths: {
    sources: "./src/contracts/solidity",
    tests: "./hardhat-testlib",
    artifacts: "./artifacts"
  },
  solidity: {
    version: "0.8.0",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
};
