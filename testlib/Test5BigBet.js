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
      await token.approve(oracle.address, "501", { from: accounts[0] });
    });

    it("Deposit Tokens in Oracle Contract", async () => {
      await oracle.depositTokens("501", { from: accounts[0] });
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
          1500,
          555,
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
    });

    it("fast forward 4 hours", async () => {
      await helper.advanceTimeAndBlock(secondsInHour * 6);
    });

    it("approve and send to betting contract", async () => {
      await oracle.initProcess();
    });

    it("Fund Betting Contract", async () => {
      await betting.fundBook({
        from: accounts[0],
        value: "1000000000000000000",
      });
    });

    it("Fund Betting Contract with 200 finney", async () => {
      await betting.fundBettor({
        from: accounts[2],
        value: "1000000000000000000",
      });
    });

    it("Fund Betting Contract with 200 finney", async () => {
      await betting.fundBettor({
        from: accounts[3],
        value: "1000000000000000000",
      });
    });

    it("Fund Betting Contract with 200 finney", async () => {
      const userBalanceAcct0 = (await betting.lpStruct(accounts[0])).shares;
      const userBalanceAcct2 = await betting.userBalance(accounts[2]);
      const userBalanceAcct3 = await betting.userBalance(accounts[3]);
      console.log(`acct0 ${userBalanceAcct0}`);
      console.log(`acct2 ${userBalanceAcct2}`);
      console.log(`acct3 ${userBalanceAcct3}`);
    });
  });

  describe("Send  Bets", async () => {
    let contractHash0;

    it("bet 10 on 0:0 (match 0: team 0)", async () => {
      const result = await betting.bet(0, 0, "1000", {
        from: accounts[3],
      });
      contractHash0 = result.logs[0].args.contractHash;
    });

    let contractHash1;
    it("bet 10 on 0:1", async () => {
      const result2 = await betting.bet(0, 1, "1000", {
        from: accounts[2],
      });
      contractHash1 = result2.logs[0].args.contractHash;
    });

    let contractHash2;
    it("bet 10 on 2:1 (match 2: team 1)", async () => {
      const result = await betting.bet(2, 1, "1000", {
        from: accounts[2],
      });
      contractHash2 = result.logs[0].args.contractHash;
    });

    let contractHash3;
    let contractHash6;
    it("Offer Big Bets", async () => {
      const result3 = await betting.postBigBet(2, 0, 2001, 2111, {
        from: accounts[2],
      });
      contractHash3 = result3.logs[0].args.contractHash;
      const gasUsed = result3.receipt.gasUsed;
      console.log(`gas on big bet ${gasUsed}`);
      const check0 = await betting.checkRedeem(contractHash3, 1020);
      const check1 = (await betting.subcontracts(contractHash3)).betAmount;
      console.log(`checkOfferFn ${check0}`);
      console.log(`checkOfferGetter ${check1}`);
      const result6 = await betting.postBigBet(3, 0, 2002, 1955, {
        from: accounts[2],
      });
      contractHash6 = result6.logs[0].args.contractHash;

      const check2 = await betting.checkRedeem(contractHash6, 1020);
      const check3 = (await betting.subcontracts(contractHash6)).betAmount;
      console.log(`checkOfferFn2 ${check2}`);
      console.log(`checkOfferGetter3 ${check3}`);
    });

    let contractHash4;
    it("take above Big Bets", async () => {
      const result4 = await betting.takeBigBet(contractHash3, {
        from: accounts[3],
      });
      const result6 = await betting.takeBigBet(contractHash6, {
        from: accounts[3],
      });
      const gasUsed = result4.receipt.gasUsed;
      console.log(`gas on taking big bet ${gasUsed}`);
      contractHash4 = result4.logs[1].args.contractHash;
      const pick2 = result4.logs[0].args.pick;
      console.log(`pick2 ${pick2}`);
      const pick3 = result4.logs[1].args.pick;
      console.log(`pick3 ${pick3}`);
    });

    let contractHash5;
    it("Offer Big Bet for 100 on 3:0", async () => {
      const result = await betting.postBigBet(3, 0, 3000, 2000, {
        from: accounts[2],
      });
      const gasUsed = result.receipt.gasUsed;
      console.log(`gas on second offered big bet ${gasUsed}`);
      contractHash5 = result.logs[0].args.contractHash;
    });

    it("State Variables in Betting Contract before settle", async () => {
      const bookiePool = await betting.margin(0);
      const bettorLocked = await betting.margin(2);
      const bookieLocked = await betting.margin(1);
      const userBalanceAcct2 = await betting.userBalance(accounts[2]);
      const userBalanceAcct3 = await betting.userBalance(accounts[3]);
      console.log(`bettorLocked ${bettorLocked}`);
      console.log(`bookiePool ${bookiePool}`);
      console.log(`bookieLocked ${bookieLocked}`);
      console.log(`acct2 ${userBalanceAcct2}`);
      console.log(`acct3 ${userBalanceAcct3}`);
      assert.equal(bookiePool, "10000", "Must be equal");
      assert.equal(bettorLocked, "11137", "Must be equal");
      assert.equal(bookieLocked, "718", "Must be equal");
      assert.equal(userBalanceAcct2, "3997", "Must be equal");
      assert.equal(userBalanceAcct3, "4866", "Must be equal");

    });

    it("bumpTime", async () => {
      _timestamp = (await web3.eth.getBlock(await web3.eth.getBlockNumber()))
        .timestamp;
      await helper.advanceTimeAndBlock(86400);
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
        0,
        1,
        1,
        1,
        1,
        1,
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
      ]);
    });

    it("fast forward 4 hours", async () => {
      await helper.advanceTimeAndBlock(secondsInHour * 6);
    });

    it("send result data to betting contract", async () => {
      await oracle.settleProcess();
    });
/*
    it("State Variables in Betting Contract after settle", async () => {
      const bookiePool = await betting.margin(0);
      const bettorLocked = await betting.margin(2);
      const bookieLocked = await betting.margin(1);
      const oracleBal = web3.utils.fromWei(
        await web3.eth.getBalance(oracle.address),
        "finney"
      );
      const ethbal = web3.utils.fromWei(
        await web3.eth.getBalance(betting.address),
        "finney"
      );
      const userBalanceAcct2 = await betting.userBalance(accounts[2]);
      const userBalanceAcct3 = await betting.userBalance(accounts[3]);
      console.log(`acct2 ${userBalanceAcct2}`);
      console.log(`acct3 ${userBalanceAcct3}`);
      console.log(`bookiePool ${bookiePool}`);
      console.log(`bettorLocked ${bettorLocked}`);
      console.log(`bookieLocked ${bookieLocked}`);
      console.log(`oracleBal ${oracleBal}`);
      console.log(`ethbal ${ethbal}`);
      assert.equal(userBalanceAcct2, "5000", "Must be equal");
      assert.equal(userBalanceAcct3, "6000", "Must be equal");
      assert.equal(bookiePool, "8970", "Must be equal");
      assert.equal(bookieLocked, "0", "Must be equal");
      assert.equal(bettorLocked, "0", "Must be equal");
    });
*/
    it("redeem  regular bets  ", async () => {
      const result = await betting.redeem(contractHash1, 1001, {
        from: accounts[2],
      });
      const result2 = await betting.redeem(contractHash2, 1021, {
        from: accounts[2],
      });
      /*
      const userBalanceAcct2 = await betting.userBalance(accounts[2]);
      const userBalanceAcct3 = await betting.userBalance(accounts[3]);
      console.log(`acct2 ${userBalanceAcct2}`);
      console.log(`acct3 ${userBalanceAcct3}`);
      const gasUsed = result.receipt.gasUsed;
      console.log(`gas on redeem bet ${gasUsed}`);
      const result2 = await betting.redeem(contractHash2, 1021, {
        from: accounts[2],
      });
      const userBalanceAcct2b = await betting.userBalance(accounts[2]);
      const userBalanceAcct3b = await betting.userBalance(accounts[3]);
      console.log(`acct2b ${userBalanceAcct2b}`);
      console.log(`acct3b ${userBalanceAcct3b}`);
      */
    });

    it("redeem  Bigbets on 1:1 ", async () => {
      const result = await betting.redeem(contractHash4, 1021, {
        from: accounts[3]});
        const result2 = await betting.redeem(contractHash6, 1030, {
          from: accounts[2]});
          const userBalanceAcct2 = await betting.userBalance(accounts[2]);
          const userBalanceAcct3 = await betting.userBalance(accounts[3]);
          /*
          console.log(`acct2c ${userBalanceAcct2}`);
          console.log(`acct3c ${userBalanceAcct3}`);
          */
    });


    it("State Variables in Betting Contract after redemption from bettors", async () => {
      const bookiePool = await betting.margin(0);
      const bettorLocked = await betting.margin(2);
      const bookieLocked = await betting.margin(1);
      const oracleBal = web3.utils.fromWei(
        await web3.eth.getBalance(oracle.address),
        "finney"
      );
      const ethbal = web3.utils.fromWei(
        await web3.eth.getBalance(betting.address),
        "finney"
      );
      const userBalanceAcct2 = await betting.userBalance(accounts[2]);
      const userBalanceAcct3 = await betting.userBalance(accounts[3]);
      console.log(`bookiePool ${bookiePool}`);
      console.log(`bookieLocked ${bookieLocked}`);
      console.log(`bettorLocked ${bettorLocked}`);
      console.log(`acct2 ${userBalanceAcct2}`);
      console.log(`acct3 ${userBalanceAcct3}`);
      assert.equal(bookiePool, "9282", "Must be equal");
      assert.equal(bookieLocked, "0", "Must be equal");
      assert.equal(bettorLocked, "0", "Must be equal");
      assert.equal(userBalanceAcct2, "11445", "Must be equal");
      assert.equal(userBalanceAcct3, "8989", "Must be equal");
    });
  });
});
