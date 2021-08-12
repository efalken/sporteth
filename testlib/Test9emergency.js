const Betting = artifacts.require("Betting");
const Token = artifacts.require("Token");
const Oracle = artifacts.require("Oracle");
const Web3 = require("web3");
const connectionString = "http://localhost:8545";
const web3 = new Web3(connectionString);
const helper = require('../helper');
const secondsInHour = 3600;
var _dateo = new Date();
const offset = _dateo.getTimezoneOffset() * 60  * 1000 - 7200000;
var _timestamp;
var _date;
var _hour;


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
            await token.approve(oracle.address, "50000000000000000000000");
        })
        it("Deposit Tokens in Oracle Contract2", async () => {
            await oracle.depositTokens("50000000000000000000000", {from: accounts[0]});
        })

        it("transfer tokens to acct2", async () => {
            await token.transfer(accounts[2], "1000000000000000000000", {from: accounts[0]});
        })

        it('Acct2 authorize Oracle Token', async () => {
            await token.approve(oracle.address, "1000000000000000000000", {from: accounts[2]});
        })

        it("Acct2 Deposit Tokens in Oracle Contract", async () => {
        await oracle.depositTokens("1000000000000000000000", {from: accounts[2]});
        })

    })

    describe("set up contract for taking bets", async () => {

      it('checkHour', async () => {
        _timestamp = (await web3.eth.getBlock(await web3.eth.getBlockNumber())).timestamp;
        _date = new Date(1000 * _timestamp  + offset);
        _hour = _date.getHours();
           if (_hour < 10) {
           await helper.advanceTimeAndBlock(secondsInHour* (10 - _hour));
       }
       })

        it("send initial data to Oracle", async () => {
            await oracle.initPost(["NFL:ARI:LAC","NFL:ATL:LAR","NFL:BAL:MIA","NFL:BUF:MIN","NFL:CAR:NE","NFL:CHI:NO","NFL:CIN:NYG","NFL:CLE:NYJ","NFL:DAL:OAK","NFL:DEN:PHI","NFL:DET:PIT","NFL:GB:SEA","NFL:HOU:SF","NFL:IND:TB","NFL:JAX:TEN","NFL:KC:WSH","UFC:Holloway:Kattar","UFC:Ponzinibbio:Li","UFC:Kelleher:Simon","UFC:Hernandez:Vieria","UFC:Akhemedov:Breese","UFC:Memphis:Brooklyn","UFC:Boston:Charlotte","UFC:Milwaukee:Dallas","UFC:miami:LALakers","UFC:Atlanta:SanAntonia","NHL:Colorado:Washington","NHL:Vegas:StLouis","NHL:TampaBay:Dallas","NHL:Boston:Carolina","NHL:Philadelphia:Edmonton","NHL:Pittsburgh:NYIslanders"], [1629095839, 1629095839, 1629095839, 1629095839, 1629095839, 1629095839, 1629095839, 1629095839, 1629095839, 1629095839, 1609290000, 1629095839, 1629095839, 1629095839, 1629095839, 1609290000, 1629095839, 1629095839, 1629095839, 1629095839, 1609290000, 1629095839, 1629095839, 1629095839, 1629095839, 1609290000, 1629095839, 1629095839, 1629095839, 1629095839, 1609290000, 1629095839], [955, 2000, 500, 1000, 909, 800, 510, 1240, 1470, 960, 650, 1330, 970, 730, 1310, 1040, 520, 1020, 1470, 1200, 1080, 820, 770, 790, 730, 690, 970, 760, 1000, 720, 1360, 800], 1629095839);
        })

        it("approve and send to betting contract", async () => {
           await helper.advanceTimeAndBlock(secondsInHour * 6);
            await oracle.initProcess();
        })

        it("Fund Contract", async () => {
            await betting.fundBook( { from: accounts[0], value: '300000000000000000' });
            await betting.fundBettor({ from: accounts[3], value: '200000000000000000' });
          })
    });

    describe("Send Bets", async () => {

      it('fail expected: sender too small', async () => {
          await oracle.paramUpdate(1, 1, { from: accounts[2]});
      })

        it("Fail expected: Excess Amount Should Fail because max size is 300/5 finney", async () => {
            await betting.takeRegularBet(0, 0, "75000000000000000", { from: accounts[3]});
        })

        it('adjust parameters to make it easy to bet', async () => {
            await oracle.paramUpdate(1, 1, { from: accounts[0]});
        })

        let contractHash1;
        it("Should succeed because max size is 1 finney", async () => {
              const result2 = await betting.takeRegularBet(0, 0, "75000000000000000", { from: accounts[3]});
              contractHash1 = result2.logs[0].args.contractHash;
        })

        it('Emergency update from smallish token holder', async () => {
            await oracle.paramUpdate(100000000, 100, { from: accounts[2]});
        })

        it("Fail expected: because max size is near zero eth", async () => {
            await betting.takeRegularBet(0, 0, "5000000000000000", { from: accounts[3]});
        })

        it("Fail expected: too soon", async () => {
            await betting.inactiveBook();
        })

        it('fast forward 24 days after earliest start time', async () => {
        await helper.advanceTimeAndBlock(1628547467 - _timestamp);
       await helper.advanceTimeAndBlock(secondsInHour * 576);
       })

       it("show eth in contract before inactivation", async () => {
              const ethbal = web3.utils.fromWei(await web3.eth.getBalance(betting.address), "finney");
              console.log(`ethBalance on betting contract = ${ethbal}`);
               assert.equal(ethbal, 500, "Must be equal");
              })

       it("should reset book so everyone can withdraw ", async () => {
           await betting.inactiveBook();
       })

         it("should pull all ether ", async () => {
        //const bookbal = web3.utils.fromWei(await web3.eth.getBalance(betting.address), "finney");
         await betting.withdrawBook("300000000000000000", {from: accounts[0]});
        await betting.redeem(contractHash1, { from: accounts[3] });
        const bookbal = web3.utils.fromWei(await betting.userBalance(accounts[3]), "finney");
        const userBalanceAcct2 = web3.utils.fromWei(await betting.userBalance(accounts[2]), "finney");
          console.log(`ethBalance on betting contract = ${bookbal}`);
          await betting.withdrawBettor("200000000000000000", {from: accounts[3]});
          })

   it("show eth in contract after withdrawals", async () => {
          const ethbal = web3.utils.fromWei(await web3.eth.getBalance(betting.address), "finney");
          console.log(`ethBalance on betting contract = ${ethbal}`);
           assert.equal(ethbal, 0, "Must be equal");
          })


  })

})
