const Betting = artifacts.require("Betting");
const Token = artifacts.require("Token");
const Oracle = artifacts.require("Oracle");
const Web3 = require("web3");
const connectionString = "http://localhost:8545";
const web3 = new Web3(connectionString);
const helper = require("../helper");
const secondsInHour = 3600;
_dateo = new Date();
const offset = 0; //_dateo.getTimezoneOffset() * 60  * 1000 - 7200000;
var _timestamp;
var _date;
var _hour;
var tokens0;
var tokens1;
var tokens1;
var tokens2;
var tokens3;
var tokenstot;
var feepool;
var oracleBal;
var betEpoc;
var ethout8;
var ethout;
var tokensout;

require("chai").use(require("chai-as-promised")).should();

contract("Betting", function (accounts) {
  let betting, oracle, token;

  before(async () => {
    betting = await Betting.deployed();
    oracle = await Oracle.deployed();
    token = await Token.deployed();
  });

  describe("initial contract with one token owner", async () => {
    it("Authorize Oracle Token", async () => {
      await token.approve(oracle.address, "250", { from: accounts[0] });
    });

    it("Deposit Tokens in Oracle Contract0", async () => {
      await oracle.depositTokens("250", { from: accounts[0] });
    });
/*
    it("transfer tokens to betting account", async () => {
      await token.transfer(betting.address, "250");
    });*/
  });

  describe("initial contract with one token owner", async () => {
    it("checkHour", async () => {
      _timestamp = (await web3.eth.getBlock(await web3.eth.getBlockNumber()))
        .timestamp;
      _date = new Date(1000 * _timestamp + offset);
      _hour = _date.getHours();
      if (_hour < 10) {
        await helper.advanceTimeAndBlock(secondsInHour * (10 - _hour));
      }
      var nextStart = _timestamp + 7 * 86400;
      await oracle.initPost(
        [
          "NFL:ARI:LAC",
          "NFL:ATL:LAR",
          "NFL:BAL:MIA",
          "NFL:BUF:MIN",
          "NFL:CAR:NE",
          "NFL:CHI:NO",
          "NFL:CIN:NYG",
          "NFL:CLE:NYJ",
          "NFL:DAL:OAK",
          "NFL:DEN:PHI",
          "NFL:DET:PIT",
          "NFL:GB:SEA",
          "NFL:HOU:SF",
          "NFL:IND:TB",
          "NFL:JAX:TEN",
          "NFL:KC:WSH",
          "UFC:Holloway:Kattar",
          "UFC:Ponzinibbio:Li",
          "UFC:Kelleher:Simon",
          "UFC:Hernandez:Vieria",
          "UFC:Akhemedov:Breese",
          "UFC:Memphis:Brooklyn",
          "UFC:Boston:Charlotte",
          "UFC:Milwaukee:Dallas",
          "UFC:miami:LALakers",
          "UFC:Atlanta:SanAntonia",
          "NHL:Colorado:Washington",
          "NHL:Vegas:StLouis",
          "NHL:TampaBay:Dallas",
          "NHL:Boston:Carolina",
          "NHL:Philadelphia:Edmonton",
          "NHL:Pittsburgh:NYIslanders",
        ],
        [
          nextStart,
          nextStart,
          nextStart,
          nextStart,
          nextStart,
          nextStart,
          nextStart,
          nextStart,
          nextStart,
          nextStart,
          nextStart,
          nextStart,
          nextStart,
          nextStart,
          nextStart,
          nextStart,
          nextStart,
          nextStart,
          nextStart,
          nextStart,
          nextStart,
          nextStart,
          nextStart,
          nextStart,
          nextStart,
          nextStart,
          nextStart,
          nextStart,
          nextStart,
          nextStart,
          nextStart,
          nextStart,
        ],
        [
          1000,
          2000,
          500,
          1000,
          909,
          800,
          510,
          1240,
          1470,
          960,
          650,
          1330,
          970,
          730,
          1310,
          1040,
          520,
          1020,
          1470,
          1200,
          1080,
          820,
          770,
          790,
          730,
          690,
          970,
          760,
          1000,
          720,
          1360,
          800,
        ]
      );
      _timestamp = (await web3.eth.getBlock(await web3.eth.getBlockNumber()))
        .timestamp;
      _date = new Date(1000 * _timestamp + offset);
      await helper.advanceTimeAndBlock(secondsInHour * 6);
      _hour = _date.getHours();
      if (_hour < 10) {
        await helper.advanceTimeAndBlock(secondsInHour * (12 - _hour));
      }

      await oracle.initProcess();
    });

    it("Send  Bet #1", async () => {
      await betting.fundBook({
        from: accounts[4],
        value: "5000000000000000000",
      });
      await betting.fundBettor({
        from: accounts[5],
        value: "5000000000000000000",
      });
      const result = await betting.bet(0, 0, "2000", {
        from: accounts[5],
      });
      contractHash1 = result.logs[0].args.contractHash;
      _timestamp = (await web3.eth.getBlock(await web3.eth.getBlockNumber()))
        .timestamp;
      _date = new Date(1000 * _timestamp + offset);
      _hour = _date.getHours();
      if (_hour < 10) {
        await helper.advanceTimeAndBlock(secondsInHour * (10 - _hour));
      }
      await oracle.settlePost([
        0,
        1,
        0,
        2,
        0,
        0,
        1,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
      ]);
      _timestamp = (await web3.eth.getBlock(await web3.eth.getBlockNumber()))
        .timestamp;
      _date = new Date(1000 * _timestamp + offset);
      _hour = _date.getHours();
      await helper.advanceTimeAndBlock(secondsInHour * 6);
      await oracle.settleProcess();
    });

    it("check 1", async () => {
      oracleBal = web3.utils.fromWei(
        await web3.eth.getBalance(oracle.address),
        "finney"
      );
      feePool = await oracle.params(7);
      const totTokens = await oracle.params(4);
      console.log(`eth in Oracle Contract ${oracleBal}`);
      console.log(`feePool Tracker ${feePool}`);
      console.log(`tot tokens ${totTokens}`);
      await betting.redeem(contractHash1, 1000, { from: accounts[5] });
      const tokens5 = await token.balanceOf(accounts[5]);
      console.log(`tot tokens acct5 ${tokens5}`);
    });
  });

  describe("Second epoch with two oracles", async () => {
    it("acct 1 send tokens to oracle", async () => {
      await token.transfer(accounts[1], "150");
      await token.approve(oracle.address, "150", { from: accounts[1] });
      await oracle.depositTokens("150", { from: accounts[1] });
      _timestamp = (await web3.eth.getBlock(await web3.eth.getBlockNumber()))
        .timestamp;
      _date = new Date(1000 * _timestamp + offset);
      _hour = _date.getHours();
      if (_hour < 10) {
        await helper.advanceTimeAndBlock(secondsInHour * (10 - _hour));
      }
      var nextStart = _timestamp + 7 * 86400;
      await oracle.initPost(
        [
          "NFL:ARI:LAC",
          "NFL:ATL:LAR",
          "NFL:BAL:MIA",
          "NFL:BUF:MIN",
          "NFL:CAR:NE",
          "NFL:CHI:NO",
          "NFL:CIN:NYG",
          "NFL:CLE:NYJ",
          "NFL:DAL:OAK",
          "NFL:DEN:PHI",
          "NFL:DET:PIT",
          "NFL:GB:SEA",
          "NFL:HOU:SF",
          "NFL:IND:TB",
          "NFL:JAX:TEN",
          "NFL:KC:WSH",
          "UFC:Holloway:Kattar",
          "UFC:Ponzinibbio:Li",
          "UFC:Kelleher:Simon",
          "UFC:Hernandez:Vieria",
          "UFC:Akhemedov:Breese",
          "UFC:Memphis:Brooklyn",
          "UFC:Boston:Charlotte",
          "UFC:Milwaukee:Dallas",
          "UFC:miami:LALakers",
          "UFC:Atlanta:SanAntonia",
          "NHL:Colorado:Washington",
          "NHL:Vegas:StLouis",
          "NHL:TampaBay:Dallas",
          "NHL:Boston:Carolina",
          "NHL:Philadelphia:Edmonton",
          "NHL:Pittsburgh:NYIslanders",
        ],
        [
          nextStart,
          nextStart,
          nextStart,
          nextStart,
          nextStart,
          nextStart,
          nextStart,
          nextStart,
          nextStart,
          nextStart,
          nextStart,
          nextStart,
          nextStart,
          nextStart,
          nextStart,
          nextStart,
          nextStart,
          nextStart,
          nextStart,
          nextStart,
          nextStart,
          nextStart,
          nextStart,
          nextStart,
          nextStart,
          nextStart,
          nextStart,
          nextStart,
          nextStart,
          nextStart,
          nextStart,
          nextStart,
        ],
        [
          1000,
          2000,
          500,
          1000,
          909,
          800,
          510,
          1240,
          1470,
          960,
          650,
          1330,
          970,
          730,
          1310,
          1040,
          520,
          1020,
          1470,
          1200,
          1080,
          820,
          770,
          790,
          730,
          690,
          970,
          760,
          1000,
          720,
          1360,
          800,
        ]
      );
      _timestamp = (await web3.eth.getBlock(await web3.eth.getBlockNumber()))
        .timestamp;
      _date = new Date(1000 * _timestamp + offset);
      _hour = _date.getHours();
      if (_hour < 10) {
        await helper.advanceTimeAndBlock(secondsInHour * (12 - _hour));
      }
      await helper.advanceTimeAndBlock(secondsInHour * 6);
      await oracle.initProcess();
    });

    it("Send  Bet #2", async () => {
      const result = await betting.bet(0, 0, "2000", {
        from: accounts[5],
      });
      const odds = web3.utils.fromWei(result.logs[0].args.payoff, "finney");
      _timestamp = (await web3.eth.getBlock(await web3.eth.getBlockNumber()))
        .timestamp;
      await helper.advanceTimeAndBlock(86400);
      _timestamp = (await web3.eth.getBlock(await web3.eth.getBlockNumber()))
        .timestamp;
      _date = new Date(1000 * _timestamp + offset);
      _hour = _date.getHours();
      if (_hour < 10) {
        await helper.advanceTimeAndBlock(secondsInHour * (10 - _hour));
      }
      await oracle.settlePost([
        0,
        1,
        0,
        2,
        0,
        0,
        1,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
      ]);
      _timestamp = (await web3.eth.getBlock(await web3.eth.getBlockNumber()))
        .timestamp;
      _date = new Date(1000 * _timestamp + offset);
      _hour = _date.getHours();
      await helper.advanceTimeAndBlock(secondsInHour * 6);
      await oracle.settleProcess();
    });

    it("check 2", async () => {
      oracleBal = web3.utils.fromWei(
        await web3.eth.getBalance(oracle.address),
        "finney"
      );
      feePool = await oracle.params(7);
      console.log(`eth in Oracle Contract ${oracleBal}`);
      console.log(`feePool Tracker ${feePool}`);
    });
  });

  describe("third epoch with three oracles", async () => {
    it("transfer tokens from account 2", async () => {
      const result0 = await token.transfer(accounts[2], "100");
      const result1 = await token.approve(oracle.address, "100", {
        from: accounts[2],
      });
      const result2 = await oracle.depositTokens("100", { from: accounts[2] });
      const gasUsed0 = result0.receipt.gasUsed;
      console.log(`gas on tokenTransfer0 ${gasUsed0}`);
      const gasUsed1 = result1.receipt.gasUsed;
      console.log(`gas on tokenTransfer1 ${gasUsed1}`);
      const gasUsed2 = result2.receipt.gasUsed;
      console.log(`gas on tokenTransfer2 ${gasUsed2}`);
      _timestamp = (await web3.eth.getBlock(await web3.eth.getBlockNumber()))
        .timestamp;
      _date = new Date(1000 * _timestamp + offset);
      _hour = _date.getHours();
      if (_hour < 10) {
        await helper.advanceTimeAndBlock(secondsInHour * (10 - _hour));
      }
            var nextStart = _timestamp + 7 * 86400;
      await oracle.initPost(
        [
          "NFL:ARI:LAC",
          "NFL:ATL:LAR",
          "NFL:BAL:MIA",
          "NFL:BUF:MIN",
          "NFL:CAR:NE",
          "NFL:CHI:NO",
          "NFL:CIN:NYG",
          "NFL:CLE:NYJ",
          "NFL:DAL:OAK",
          "NFL:DEN:PHI",
          "NFL:DET:PIT",
          "NFL:GB:SEA",
          "NFL:HOU:SF",
          "NFL:IND:TB",
          "NFL:JAX:TEN",
          "NFL:KC:WSH",
          "UFC:Holloway:Kattar",
          "UFC:Ponzinibbio:Li",
          "UFC:Kelleher:Simon",
          "UFC:Hernandez:Vieria",
          "UFC:Akhemedov:Breese",
          "UFC:Memphis:Brooklyn",
          "UFC:Boston:Charlotte",
          "UFC:Milwaukee:Dallas",
          "UFC:miami:LALakers",
          "UFC:Atlanta:SanAntonia",
          "NHL:Colorado:Washington",
          "NHL:Vegas:StLouis",
          "NHL:TampaBay:Dallas",
          "NHL:Boston:Carolina",
          "NHL:Philadelphia:Edmonton",
          "NHL:Pittsburgh:NYIslanders",
        ],
        [
          nextStart,
          nextStart,
          nextStart,
          nextStart,
          nextStart,
          nextStart,
          nextStart,
          nextStart,
          nextStart,
          nextStart,
          nextStart,
          nextStart,
          nextStart,
          nextStart,
          nextStart,
          nextStart,
          nextStart,
          nextStart,
          nextStart,
          nextStart,
          nextStart,
          nextStart,
          nextStart,
          nextStart,
          nextStart,
          nextStart,
          nextStart,
          nextStart,
          nextStart,
          nextStart,
          nextStart,
          nextStart,
        ],
        [
          1000,
          2000,
          500,
          1000,
          909,
          800,
          510,
          1240,
          1470,
          960,
          650,
          1330,
          970,
          730,
          1310,
          1040,
          520,
          1020,
          1470,
          1200,
          1080,
          820,
          770,
          790,
          730,
          690,
          970,
          760,
          1000,
          720,
          1360,
          800,
        ]
      );
      _timestamp = (await web3.eth.getBlock(await web3.eth.getBlockNumber()))
        .timestamp;
      _date = new Date(1000 * _timestamp + offset);
      _hour = _date.getHours();
      if (_hour < 10) {
        await helper.advanceTimeAndBlock(secondsInHour * (12 - _hour));
      }
      await helper.advanceTimeAndBlock(secondsInHour * 6);
      await oracle.initProcess();
      const result = await betting.bet(0, 0, "2000", {
        from: accounts[5],
      });
      _timestamp = (await web3.eth.getBlock(await web3.eth.getBlockNumber()))
        .timestamp;
      await helper.advanceTimeAndBlock(3600);
      _timestamp = (await web3.eth.getBlock(await web3.eth.getBlockNumber()))
        .timestamp;
      _date = new Date(1000 * _timestamp + offset);
      _hour = _date.getHours();
      if (_hour < 10) {
        await helper.advanceTimeAndBlock(secondsInHour * (10 - _hour));
      }
      await oracle.settlePost([
        0,
        1,
        0,
        2,
        0,
        0,
        1,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
      ]);
      _timestamp = (await web3.eth.getBlock(await web3.eth.getBlockNumber()))
        .timestamp;
      _date = new Date(1000 * _timestamp + offset);
      _hour = _date.getHours();
      await helper.advanceTimeAndBlock(secondsInHour * 6);
      await oracle.settleProcess();
    });

    it("check 3", async () => {
      oracleBal = web3.utils.fromWei(
        await web3.eth.getBalance(oracle.address),
        "finney"
      );
      feePool = await oracle.params(7);
      console.log(`eth in Oracle Contract ${oracleBal}`);
      console.log(`feePool Tracker ${feePool}`);
    });

    it("newfunds", async () => {
      tokens0 = (await oracle.adminStruct(accounts[0])).tokens;
      console.log(`tokens Tracker ${tokens0}`);
      await token.approve(oracle.address, "50", { from: accounts[0] });
      const tokensa0 = await token.balanceOf(accounts[0]);
      console.log(`acct0 tokens, ${tokensa0}`);
      const result = await oracle.withdrawTokens("50", { from: accounts[0] });
      ethout = web3.utils.fromWei(result.logs[0].args.etherChange, "finney");
      console.log(`ether Out ${ethout}`);
      tokensout = result.logs[0].args.tokensChange;
      oracleBal = web3.utils.fromWei(
        await web3.eth.getBalance(oracle.address),
        "finney"
      );
      assert.equal(ethout, "21.25", "Must be equal");
        });
  });

  describe("fourth epoch with three oracles", async () => {
    it("checkHour", async () => {
      _timestamp = (await web3.eth.getBlock(await web3.eth.getBlockNumber()))
        .timestamp;
      _date = new Date(1000 * _timestamp + offset);
      _hour = _date.getHours();
      if (_hour < 10) {
        await helper.advanceTimeAndBlock(secondsInHour * (10 - _hour));
      }
            var nextStart = _timestamp + 7 * 86400;
      await oracle.initPost(
        [
          "NFL:ARI:LAC",
          "NFL:ATL:LAR",
          "NFL:BAL:MIA",
          "NFL:BUF:MIN",
          "NFL:CAR:NE",
          "NFL:CHI:NO",
          "NFL:CIN:NYG",
          "NFL:CLE:NYJ",
          "NFL:DAL:OAK",
          "NFL:DEN:PHI",
          "NFL:DET:PIT",
          "NFL:GB:SEA",
          "NFL:HOU:SF",
          "NFL:IND:TB",
          "NFL:JAX:TEN",
          "NFL:KC:WSH",
          "UFC:Holloway:Kattar",
          "UFC:Ponzinibbio:Li",
          "UFC:Kelleher:Simon",
          "UFC:Hernandez:Vieria",
          "UFC:Akhemedov:Breese",
          "UFC:Memphis:Brooklyn",
          "UFC:Boston:Charlotte",
          "UFC:Milwaukee:Dallas",
          "UFC:miami:LALakers",
          "UFC:Atlanta:SanAntonia",
          "NHL:Colorado:Washington",
          "NHL:Vegas:StLouis",
          "NHL:TampaBay:Dallas",
          "NHL:Boston:Carolina",
          "NHL:Philadelphia:Edmonton",
          "NHL:Pittsburgh:NYIslanders",
        ],
        [
          nextStart,
          nextStart,
          nextStart,
          nextStart,
          nextStart,
          nextStart,
          nextStart,
          nextStart,
          nextStart,
          nextStart,
          nextStart,
          nextStart,
          nextStart,
          nextStart,
          nextStart,
          nextStart,
          nextStart,
          nextStart,
          nextStart,
          nextStart,
          nextStart,
          nextStart,
          nextStart,
          nextStart,
          nextStart,
          nextStart,
          nextStart,
          nextStart,
          nextStart,
          nextStart,
          nextStart,
          nextStart,
        ],
        [
          1000,
          2000,
          500,
          1000,
          909,
          800,
          510,
          1240,
          1470,
          960,
          650,
          1330,
          970,
          730,
          1310,
          1040,
          520,
          1020,
          1470,
          1200,
          1080,
          820,
          770,
          790,
          730,
          690,
          970,
          760,
          1000,
          720,
          1360,
          800,
        ]
      );
      _timestamp = (await web3.eth.getBlock(await web3.eth.getBlockNumber()))
        .timestamp;
      _date = new Date(1000 * _timestamp + offset);
      _hour = _date.getHours();
      if (_hour < 10) {
        await helper.advanceTimeAndBlock(secondsInHour * (12 - _hour));
      }
      await helper.advanceTimeAndBlock(secondsInHour * 6);
      await oracle.initProcess({ from: accounts[1] });
      const result = await betting.bet(0, 0, "2000", {
        from: accounts[5],
      });
      _timestamp = (await web3.eth.getBlock(await web3.eth.getBlockNumber()))
        .timestamp;
      await helper.advanceTimeAndBlock(86400);
      _timestamp = (await web3.eth.getBlock(await web3.eth.getBlockNumber()))
        .timestamp;
      _date = new Date(1000 * _timestamp + offset);
      _hour = _date.getHours();
      if (_hour < 10) {
        await helper.advanceTimeAndBlock(secondsInHour * (10 - _hour));
      }
      await oracle.settlePost(
        [
          0,
          1,
          0,
          2,
          0,
          0,
          1,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
        ],
        { from: accounts[1] }
      );
      _timestamp = (await web3.eth.getBlock(await web3.eth.getBlockNumber()))
        .timestamp;
      _date = new Date(1000 * _timestamp + offset);
      _hour = _date.getHours();
      await helper.advanceTimeAndBlock(secondsInHour * 6);
      await oracle.settleProcess({ from: accounts[1] });
    });

    it("check 4", async () => {
      oracleBal = web3.utils.fromWei(
        await web3.eth.getBalance(oracle.address),
        "finney"
      );
      feePool = await oracle.params(7);
      console.log(`eth in Oracle Contract ${oracleBal}`);
      console.log(`feePool Tracker ${feePool}`);
      });

      it("withdraw", async () => {
      const result = await oracle.withdrawTokens("150", { from: accounts[1] });
      ethout = web3.utils.fromWei(result.logs[0].args.etherChange, "finney");
      console.log(`ether Out1 ${ethout}`);
      assert.equal(ethout, "10.05", "Must be equal");
      tokensout = result.logs[0].args.tokensChange;
      console.log(`tokens Out1 ${tokensout}`);
    });
  });

  describe("fifth epoch with 2 oracles", async () => {
    it("checkHour", async () => {
      _timestamp = (await web3.eth.getBlock(await web3.eth.getBlockNumber()))
        .timestamp;
      _date = new Date(1000 * _timestamp + offset);
      _hour = _date.getHours();
      if (_hour < 10) {
        await helper.advanceTimeAndBlock(secondsInHour * (10 - _hour));
      }

      var nextStart = _timestamp + 7 * 86400;
      await oracle.initPost(
        [
          "NFL:ARI:LAC",
          "NFL:ATL:LAR",
          "NFL:BAL:MIA",
          "NFL:BUF:MIN",
          "NFL:CAR:NE",
          "NFL:CHI:NO",
          "NFL:CIN:NYG",
          "NFL:CLE:NYJ",
          "NFL:DAL:OAK",
          "NFL:DEN:PHI",
          "NFL:DET:PIT",
          "NFL:GB:SEA",
          "NFL:HOU:SF",
          "NFL:IND:TB",
          "NFL:JAX:TEN",
          "NFL:KC:WSH",
          "UFC:Holloway:Kattar",
          "UFC:Ponzinibbio:Li",
          "UFC:Kelleher:Simon",
          "UFC:Hernandez:Vieria",
          "UFC:Akhemedov:Breese",
          "UFC:Memphis:Brooklyn",
          "UFC:Boston:Charlotte",
          "UFC:Milwaukee:Dallas",
          "UFC:miami:LALakers",
          "UFC:Atlanta:SanAntonia",
          "NHL:Colorado:Washington",
          "NHL:Vegas:StLouis",
          "NHL:TampaBay:Dallas",
          "NHL:Boston:Carolina",
          "NHL:Philadelphia:Edmonton",
          "NHL:Pittsburgh:NYIslanders",
        ],
        [
          nextStart,
          nextStart,
          nextStart,
          nextStart,
          nextStart,
          nextStart,
          nextStart,
          nextStart,
          nextStart,
          nextStart,
          nextStart,
          nextStart,
          nextStart,
          nextStart,
          nextStart,
          nextStart,
          nextStart,
          nextStart,
          nextStart,
          nextStart,
          nextStart,
          nextStart,
          nextStart,
          nextStart,
          nextStart,
          nextStart,
          nextStart,
          nextStart,
          nextStart,
          nextStart,
          nextStart,
          nextStart,
        ],
        [
          1000,
          2000,
          500,
          1000,
          909,
          800,
          510,
          1240,
          1470,
          960,
          650,
          1330,
          970,
          730,
          1310,
          1040,
          520,
          1020,
          1470,
          1200,
          1080,
          820,
          770,
          790,
          730,
          690,
          970,
          760,
          1000,
          720,
          1360,
          800,
        ]
      );
      _timestamp = (await web3.eth.getBlock(await web3.eth.getBlockNumber()))
        .timestamp;
      _date = new Date(1000 * _timestamp + offset);
      _hour = _date.getHours();
      if (_hour < 10) {
        await helper.advanceTimeAndBlock(secondsInHour * (12 - _hour));
      }
      await helper.advanceTimeAndBlock(secondsInHour * 6);
      await oracle.initProcess({ from: accounts[0] });
      const result = await betting.bet(0, 0, "2000", {
        from: accounts[5],
      });
      _timestamp = (await web3.eth.getBlock(await web3.eth.getBlockNumber()))
        .timestamp;
      await helper.advanceTimeAndBlock(1632878094 - _timestamp + 86400);
      _timestamp = (await web3.eth.getBlock(await web3.eth.getBlockNumber()))
        .timestamp;
      _date = new Date(1000 * _timestamp + offset);
      _hour = _date.getHours();
      if (_hour < 10) {
        await helper.advanceTimeAndBlock(secondsInHour * (10 - _hour));
      }
      await oracle.settlePost(
        [
          0,
          1,
          0,
          2,
          0,
          0,
          1,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
        ],
        { from: accounts[0] }
      );
      _timestamp = (await web3.eth.getBlock(await web3.eth.getBlockNumber()))
        .timestamp;
      _date = new Date(1000 * _timestamp + offset);
      _hour = _date.getHours();
      await helper.advanceTimeAndBlock(secondsInHour * 6);
      await oracle.settleProcess({ from: accounts[0] });
    });

    it("check 5", async () => {
      oracleBal = web3.utils.fromWei(
        await web3.eth.getBalance(oracle.address),
        "finney"
      );
      feePool = await oracle.params(7);
      console.log(`eth in Oracle Contract ${oracleBal}`);
      console.log(`feePool Tracker ${feePool}`);
        });

      it("final", async () => {
      const initfee = (await oracle.adminStruct(accounts[0])).initFeePool;
      console.log(`initfee ${initfee}`);

      const result = await oracle.withdrawTokens("200", { from: accounts[0] });
      ethout = web3.utils.fromWei(result.logs[0].args.etherChange, "finney");
      console.log(`ether Out0 ${ethout}`);
      tokensout = result.logs[0].args.tokensChange;
      console.log(`tokens Out0 ${tokensout}`);
      assert.equal(ethout, "11", "Must be equal");
      const result1 = await oracle.withdrawTokens("100", { from: accounts[2] });
      ethout = web3.utils.fromWei(result1.logs[0].args.etherChange, "finney");
      console.log(`ether Out2 ${ethout}`);
      const tokensout1 = result1.logs[0].args.tokensChange;
      console.log(`tokens Out2 ${tokensout1}`);
      assert.equal(ethout, "7.5", "Must be equal");
      oracleBal = web3.utils.fromWei(
        await web3.eth.getBalance(oracle.address),
        "finney"
      );
      console.log(`eth in Oracle Contract at end ${oracleBal}`);
    });
  });
});
