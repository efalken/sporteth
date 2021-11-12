const Betting = artifacts.require("Betting");
const Token = artifacts.require("Token");
const Oracle = artifacts.require("Oracle");
const Web3 = require("web3");
const connectionString = "http://localhost:8545";
const web3 = new Web3(connectionString);
const helper = require("../helper");
const secondsInHour = 3600;
_dateo = new Date();
const offset = _dateo.getTimezoneOffset() * 60 * 1000 - 7200000;
var _timestamp;
var _date;
var _hour;
var account2eo;


require("chai").use(require("chai-as-promised")).should();

contract("Betting", function (accounts) {
  let betting, oracle, token;

  before(async () => {
    betting = await Betting.deployed();
    oracle = await Oracle.deployed();
    token = await Token.deployed();
  });

  describe("Oracle", async () => {
    it("Authorize Oracle Token", async () => {
      await token.approve(oracle.address, "560", { from: accounts[0] });
    });

    it("Deposit Tokens in Oracle Contract", async () => {
      await oracle.depositTokens("560", { from: accounts[0] });
    });
  });

  describe("set up contract for taking bets", async () => {
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
          827,
          955,
          1000,
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
      await helper.advanceTimeAndBlock(secondsInHour * 6);
    });

    it("approve and send to betting contract", async () => {
      await oracle.initProcess();
    });

    it("Fund Betting Contract", async () => {
      await betting.fundBook({
        from: accounts[0],
        value: "3000000000000000000",
      });
    });

    it("Fund Betting Contract with 200 finney", async () => {
      await betting.fundBettor({
        from: accounts[2],
        value: "200000000000000000",
      });
    });

    it("Fund Betting Contract with 200 finney", async () => {
      await betting.fundBettor({
        from: accounts[3],
        value: "300000000000000000",
      });
    });
  });

  describe("Send  Bets", async () => {
    let contractHash0;
    it("bet 10 on 0:0 (match 0: team 0)", async () => {
      const result = await betting.bet(0, 0, "1000", {
        from: accounts[3],
      });
      contractHash0 = result.logs[0].args.contractHash;
      const gasUsed = result.receipt.gasUsed;
      console.log(`gas on initial bet ${gasUsed}`);
      const result2 = await betting.bet(3, 0, "1000", {
        from: accounts[3],
      });
      const result3 = await betting.bet(3, 1, "1000", {
        from: accounts[3],
      });
    });

    let contractHash1;
    it("bet 10 on 0:1", async () => {
      const result2 = await betting.bet(0, 1, "1000", {
        from: accounts[2],
      });
      contractHash1 = result2.logs[0].args.contractHash;
      const gasUsed4 = result2.receipt.gasUsed;
      console.log(`gas on fourth bet ${gasUsed4}`);
    });

    let contractHash21;
    it("bet 10 on 2:0 (match 2: team 1)", async () => {
      const result = await betting.bet(2, 1, "1000", {
        from: accounts[2],
      });
      contractHash21 = result.logs[0].args.contractHash;
    });

    it("State Variables in Betting Contract before settle", async () => {
      const oracleBal = web3.utils.fromWei(
        await web3.eth.getBalance(oracle.address),
        "finney"
      );
      const bettingKethbal = web3.utils.fromWei(
        await web3.eth.getBalance(betting.address),
        "finney"
      );
      console.log(`oracleBal ${oracleBal}`);
      console.log(`bettingKethbal ${bettingKethbal}`);
      assert.equal(oracleBal, "0", "Must be equal");
      assert.equal(bettingKethbal, "3500", "Must be equal");
    });

    it("bumpTime", async () => {
      _timestamp = (await web3.eth.getBlock(await web3.eth.getBlockNumber()))
        .timestamp;
      await helper.advanceTimeAndBlock(86400);
      _timestamp = (await web3.eth.getBlock(await web3.eth.getBlockNumber()))
        .timestamp;
    });

    it("checkHour", async () => {
      _timestamp = (await web3.eth.getBlock(await web3.eth.getBlockNumber()))
        .timestamp;
      _date = new Date(1000 * _timestamp + offset);
      _hour = _date.getHours();
      if (_hour < 10) {
        await helper.advanceTimeAndBlock(secondsInHour * (10 - _hour));
      }
    });

    it("Send Event Results to oracle", async () => {
      await oracle.settlePost([
        1,
        1,
        1,
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
    });

    it("fast forward 4 hours", async () => {
      _timestamp = (await web3.eth.getBlock(await web3.eth.getBlockNumber()))
        .timestamp;
      _date = new Date(1000 * _timestamp + offset);
      _hour = _date.getHours();
      await helper.advanceTimeAndBlock(secondsInHour * 6);
    });

    it("send result data to betting contract", async () => {
      const result3 = await oracle.settleProcess();
      const gasUsed = result3.receipt.gasUsed;
      console.log(`gas on Settlement ${gasUsed}`);
    });

    it("State Variables in Betting Contract after settle", async () => {
      const oracleBal = web3.utils.fromWei(
        await web3.eth.getBalance(oracle.address),
        "finney"
      );
      const bettingKethbal = web3.utils.fromWei(
        await web3.eth.getBalance(betting.address),
        "finney"
      );
      const userBalanceAcct2 = await betting.userBalance(accounts[2]);
      console.log(`acct2 ${userBalanceAcct2}`);
      console.log(`oracleBal ${oracleBal}`);
      console.log(`bettingKethbal ${bettingKethbal}`);
      assert.equal(oracleBal, "10.15", "Must be equal");
      assert.equal(bettingKethbal, "3489.85", "Must be equal");
      assert.equal(userBalanceAcct2, "0", "Must be equal");
    });

    it("fail: redeem attempt for bet on 0:1 from wrong account", async () => {
      const result = await betting.redeem(contractHash1, 1001, {
        from: accounts[3],
      });
    });

    it("redeem  bet on 0:1 ", async () => {
      const result = await betting.redeem(contractHash1, 1001, {
        from: accounts[2],
      });
      const gasUsed = result.receipt.gasUsed;
      console.log(`gas on redeem ${gasUsed}`);
    });

    it("fail: redeem attempt for losing bet on 0:0", async () => {
      const result = await betting.redeem(contractHash0, 1000, {
        from: accounts[3],
      });
    });

    it("fail: redeem bet on 0:1 second time", async () => {
      const result = await betting.redeem(contractHash1, 1001, {
        from: accounts[2],
      });
    });

    it("redeem  bet on 2:1 ", async () => {
      const result = await betting.redeem(contractHash21, 1021, {
        from: accounts[2],
      });
    });

    it("State Variables in Betting Contract after redemption from bettors", async () => {
      const bettingKethbal = web3.utils.fromWei(
        await web3.eth.getBalance(betting.address),
        "finney"
      );
      const userBalanceAcct2 = await betting.userBalance(accounts[2]);
      account2eo = (await web3.eth.getBalance(accounts[2])) / 1e15;
      console.log(`user2 contract balance ${userBalanceAcct2}`);
      console.log(`bettingKethbal ${bettingKethbal}`);
      console.log(`User2EOaccount ${account2eo}`);
      assert.equal(bettingKethbal, "3489.85", "Must be equal");
      assert.equal(userBalanceAcct2, "3928", "Must be equal");
    });

    it("State Variables in Betting Contract after Acct2 withdrawal", async () => {
      const playerbalance = await betting.userBalance(accounts[2]);
      const result = await betting.withdrawBettor(playerbalance, {
        from: accounts[2],
      });
      const tx = await web3.eth.getTransaction(result.tx);
      const gasPrice = tx.gasPrice / 1e15;
      const gasUsed = result.receipt.gasUsed;
      console.log(`gas Price (should be 200) = ${gasPrice}`);
      console.log(`gas on Withdraw = ${gasUsed}`);
      const oracleBal = web3.utils.fromWei(
        await web3.eth.getBalance(oracle.address),
        "finney"
      );
      const bettingKethbal = web3.utils.fromWei(
        await web3.eth.getBalance(betting.address),
        "finney"
      );
      const userBalanceAcct2 = await betting.userBalance(accounts[2]);
      const Acct2EOaccount = (await web3.eth.getBalance(accounts[2])) / 1e15;
      const Acct2Increase = Acct2EOaccount - account2eo;
      console.log(`acct2 ${userBalanceAcct2}`);
      console.log(`oracleBal ${oracleBal}`);
      console.log(`bettingKethbal ${bettingKethbal}`);
      console.log(`ethbalAcct2 ${Acct2EOaccount}`);
      console.log(`Account2 increase in account value ${Acct2Increase}`);
      assert.equal(oracleBal, "10.15", "Must be equal");
      assert.equal(bettingKethbal, "3097.05", "Must be equal");
      assert.equal(Math.floor(Acct2Increase), "392", "Must be equal");
    });
  });
});
