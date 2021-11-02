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
var nextStart;
var nextStart5;

require("chai").use(require("chai-as-promised")).should();

contract("Betting", function (accounts) {
  let betting, oracle, token;

  before(async () => {
    betting = await Betting.deployed();
    oracle = await Oracle.deployed();
    token = await Token.deployed();
  });

  describe("set up contract", async () => {
    it("Get Oracle Contract Address", async () => {
      console.log(`Oracle Address is ${oracle.address}`);
    });

    it("Authorize Oracle Token", async () => {
      await token.approve(oracle.address, "560");
    });
    it("Deposit Tokens in Oracle Contract2", async () => {
      await oracle.depositTokens("560", { from: accounts[0] });
    });
  });

  describe("set up contract for taking bets", async () => {
    it("send init", async () => {
      _timestamp = (await web3.eth.getBlock(await web3.eth.getBlockNumber()))
        .timestamp;
      _date = new Date(1000 * _timestamp + offset);
      console.log(`time is ${_timestamp}`);
      _hour = _date.getHours();
      if (_hour < 10) {
        await helper.advanceTimeAndBlock(secondsInHour * (10 - _hour));
      }
      nextStart = _timestamp + 7 * 86400;
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
          1000,
          1000,
          1000,
          1000,
          1000,
          1000,
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

    it("approve and send to betting contract", async () => {
      //await helper.advanceTimeAndBlock(secondsInHour * 6);
      await oracle.initProcess();

      const bookpool = await betting.margin(0);
      console.log(`startTime is ${bookpool}`);
    });

    it("Fund Contract", async () => {
      //  console.log(`startTime is ${nextStart}`);
      _timestamp = (await web3.eth.getBlock(await web3.eth.getBlockNumber()))
        .timestamp;
      //const checkO = await betting.matches[0](contractHash3);
      console.log(`currTime is ${_timestamp}`);
      //const startNow = await betting.startTime(0);
      //console.log(`startTime is ${startNow}`);
      await betting.fundBook({
        from: accounts[0],
        value: "1000000000000000000",
      });

      await betting.fundBettor({
        from: accounts[1],
        value: "1000000000000000000",
      });
      const excessCapital = await betting.margin(0);
      console.log(`margin0 is ${excessCapital} szabo`);
    });

    it("Send Initial Event Results", async () => {
      await oracle.settlePost([
        1,
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
    });

    it("settle", async () => {
      _timestamp = (await web3.eth.getBlock(await web3.eth.getBlockNumber()))
        .timestamp;
      _date = new Date(1000 * _timestamp + offset);
      _hour = _date.getHours();
      await helper.advanceTimeAndBlock(secondsInHour * 6);
      const result2 = await oracle.settleProcess();
      });

      it("send new data", async () => {
        _timestamp = (await web3.eth.getBlock(await web3.eth.getBlockNumber()))
          .timestamp;
        _date = new Date(1000 * _timestamp + offset);
        console.log(`time is ${_timestamp}`);
        _hour = _date.getHours();
        if (_hour < 10) {
          await helper.advanceTimeAndBlock(secondsInHour * (10 - _hour));
        }
        nextStart = _timestamp + 7 * 86400;
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
            "NHL:Pittsburgh:NYIslanders"
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
            nextStart
          ],
          [
            1000,
            1000,
            1000,
            1000,
            1000,
            1000,
            1000,
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
            800
          ]
        );
      });

      it("approve and send to betting contract", async () => {
        //await helper.advanceTimeAndBlock(secondsInHour * 6);
        await oracle.initProcess();
        const bookpool = await betting.margin(0);
        console.log(`startTime is ${bookpool}`);
      });

      it("Send Initial Event Results", async () => {
        await oracle.settlePost([
          1,
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
          0
        ]);
      });

      it("settle", async () => {
        _timestamp = (await web3.eth.getBlock(await web3.eth.getBlockNumber()))
          .timestamp;
        _date = new Date(1000 * _timestamp + offset);
        _hour = _date.getHours();
        await helper.advanceTimeAndBlock(secondsInHour * 6);
        const result2 = await oracle.settleProcess();
        const gasUsed = result2.receipt.gasUsed;
        console.log(`gas on first settlement ${gasUsed}`);
      });
      });

      describe("send new data", async () => {
        it("checkHour", async () => {
          _timestamp = (await web3.eth.getBlock(await web3.eth.getBlockNumber()))
            .timestamp;
          _date = new Date(_timestamp + offset);
          console.log(`time is ${_timestamp}`);
          _hour = _date.getHours();
          if (_hour < 10) {
            await helper.advanceTimeAndBlock(secondsInHour * (10 - _hour));
          }
             nextStart = _timestamp + 7 * 86400;
            nextStart0 = _timestamp + 86400;
          console.log(`Most startTimes are ${nextStart}`);
          console.log(`Match 5 startTime is ${nextStart0}`);
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
              "NHL:Pittsburgh:NYIslanders"
            ],
            [
              nextStart0,
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
              nextStart
            ],
            [
              1000,
              1000,
              1000,
              1000,
              1000,
              1000,
              1000,
              1000,
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
              800
            ]
          );
        });

        it("approve and send to betting contract", async () => {
          await oracle.initProcess();
          const bookpool = await betting.margin(0);
          console.log(`startTime is ${bookpool}`);
        });

    it("bets", async () => {
      var result = await betting.takeRegularBet(1, 0, "1000", {
        from: accounts[1],
      });
      var result = await betting.takeRegularBet(2, 0, "1000", {
        from: accounts[1],
      });
      var result = await betting.takeRegularBet(3, 0, "1000", {
        from: accounts[1],
      });
      var result = await betting.takeRegularBet(4, 0, "1000", {
        from: accounts[1],
      });
    });

    it("Fail: Excess Amount Should Fail because max size is 2000 (10000/5), and the bet size is ", async () => {
      const result = await betting.takeRegularBet(5, 0, "2001", {
        from: accounts[1],
      });
    });

    it("Test 1", async () => {
      const bookiePool = await betting.margin(0);
      const bettorLocked = await betting.margin(2);
      const bookieLocked = await betting.margin(1);

      console.log(`bookiePool ${bookiePool}`);
      console.log(`bettorLocked ${bettorLocked}`);
      console.log(`bookieLocked ${bookieLocked}`);
/*
      assert.equal(bookiePool, "30000", "mustBe equal");
      assert.equal(bettorLocked, "15000", "Must be equal");
      assert.equal(bookieLocked, "4614", "Must be equal");
      assert.equal(oracleBal, "0", "Must be equal");
      assert.equal(ethbal, "5000", "Must be equal");*/
    });

      it("fail: attempt to withdraw 6001 too much", async () => {
        const ethout0 = await betting.withdrawBook("6001", {
          from: accounts[0],
        });
        const bookiePool = await betting.margin(0);
        const bookieLocked = await betting.margin(1);
        console.log(`bookiePool ${bookiePool}`);
        console.log(`bookieLocked ${bookieLocked}`);
      });

      it("withdrawal of 5000 should succeed", async () => {
        const ethout0 = await betting.withdrawBook("5000", {
          from: accounts[0],
        });

      });

      it("putting that 5000 back, should succeed", async () => {
        await betting.fundBook({
          from: accounts[3],
          value: "500000000000000000",
        });
      });

    it("Fail: funding after earliest start prohibited", async () => {
      await helper.advanceTimeAndBlock(2*86400);
      _timestamp = (await web3.eth.getBlock(await web3.eth.getBlockNumber()))
        .timestamp;
      console.log(`currTime is ${_timestamp}`);
        await betting.fundBook({
          from: accounts[0],
          value: "3000000000000000000",
        });
    });

    it("Fail: withdraw after earliest start prohibited", async () => {
        await betting.fundBook({
          from: accounts[0],
          value: "3000000000000000000",
    });
    });

    it("Fail:betting after match 0 that has started", async () => {
      await betting.takeRegularBet(0, 1, "1000", { from: accounts[1] });
    });

    it("succeed: funding on match 5 which has not started", async () => {
      await betting.takeRegularBet(5, 0, "1000", {
        from: accounts[1],
      });
    });

      });


});
