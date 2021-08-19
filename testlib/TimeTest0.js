const Betting = artifacts.require("Betting");
const Token = artifacts.require("Token");
const Oracle = artifacts.require("Oracle");
const Web3 = require("web3");
const connectionString = "http://localhost:8545";
const web3 = new Web3(connectionString);
const helper = require('../helper');
const secondsInHour = 3600;
_dateo = new Date();
const offset = _dateo.getTimezoneOffset() * 60  * 1000 - 7200000;
var _timestamp;
var _date;
var _hour;
var _hourk;
var _date0;
const firstStart = 1629694800;


require('chai').use(require('chai-as-promised')).should();

contract('Betting', function (accounts) {
    let betting, oracle, token;

    before(async () => {
        betting = await Betting.deployed();
        oracle = await Oracle.deployed();
        token = await Token.deployed();
    })

    describe("set up contract", async () => {



      it('Get Oracle Contract Address', async () => {
          console.log(`Oracle Address is ${oracle.address}`);
      })


        it('Authorize Oracle Token', async () => {
            _timestamp = (await web3.eth.getBlock(await web3.eth.getBlockNumber())).timestamp;
            console.log(`ts0 = ${_timestamp}`);
            var nextStart = firstStart + 7*86400;
            await helper.advanceTimeAndBlock(nextStart - _timestamp);
            _timestamp = (await web3.eth.getBlock(await web3.eth.getBlockNumber())).timestamp;
            console.log(`ts1 = ${_timestamp}`);});
    })

  })
