/**
 * @type import('hardhat/config').HardhatUserConfig
 */
require('@nomiclabs/hardhat-waffle')
module.exports = {
  solidity: "0.7.4",
  paths: {
    sources: "./src/contracts/solidity",
    tests: "./hardhat-tests",
    artifacts: "./artifacts"
  }
};
