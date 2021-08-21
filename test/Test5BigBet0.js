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
const firstStart = 1629332808;



require('chai').use(require('chai-as-promised')).should();

contract('Betting', function (accounts) {
    let betting, oracle, token;

    before(async () => {
        betting = await Betting.deployed();
        oracle = await Oracle.deployed();
        token = await Token.deployed();
    })

    describe('Oracle', async () => {

        it('Authorize Oracle Token', async () => {
            await token.approve(oracle.address, "10000000000000000000000", {from: accounts[0]});
        })

        it("Deposit Tokens in Oracle Contract", async () => {
            await oracle.depositTokens("10000000000000000000000", {from: accounts[0]});
        })
    });


    describe("set up contract for taking bets", async () => {

      it('checkHour', async () => {
        _timestamp = (await web3.eth.getBlock(await web3.eth.getBlockNumber())).timestamp;
        _date = new Date(1000 * _timestamp  + offset);
        _hour = _date.getHours();
           if (_hour < 10) {
           await helper.advanceTimeAndBlock(secondsInHour* (10 - _hour));
       }
       })

        it("send initial data", async () => {
            var nextStart = firstStart + 7*86400;
await oracle.initPost(["NFL:ARI:LAC","NFL:ATL:LAR","NFL:BAL:MIA","NFL:BUF:MIN","NFL:CAR:NE","NFL:CHI:NO","NFL:CIN:NYG","NFL:CLE:NYJ","NFL:DAL:OAK","NFL:DEN:PHI","NFL:DET:PIT","NFL:GB:SEA","NFL:HOU:SF","NFL:IND:TB","NFL:JAX:TEN","NFL:KC:WSH","UFC:Holloway:Kattar","UFC:Ponzinibbio:Li","UFC:Kelleher:Simon","UFC:Hernandez:Vieria","UFC:Akhemedov:Breese","UFC:Memphis:Brooklyn","UFC:Boston:Charlotte","UFC:Milwaukee:Dallas","UFC:miami:LALakers","UFC:Atlanta:SanAntonia","NHL:Colorado:Washington","NHL:Vegas:StLouis","NHL:TampaBay:Dallas","NHL:Boston:Carolina","NHL:Philadelphia:Edmonton","NHL:Pittsburgh:NYIslanders"], [nextStart, nextStart, nextStart, nextStart, nextStart, nextStart, nextStart, nextStart, nextStart, nextStart, nextStart, nextStart, nextStart, nextStart, nextStart, nextStart, nextStart, nextStart, nextStart, nextStart, nextStart, nextStart, nextStart, nextStart, nextStart, nextStart, nextStart, nextStart, nextStart, nextStart, nextStart, nextStart], [827, 955, 1000, 1000, 909, 800, 510, 1240, 1470, 960, 650, 1330, 970, 730, 1310, 1040, 520, 1020, 1470, 1200, 1080, 820, 770, 790, 730, 690, 970, 760, 1000, 720, 1360, 800], nextStart);
        })

        it('fast forward 4 hours', async () => {
       await helper.advanceTimeAndBlock(secondsInHour * 6);
       })

        it("approve and send to betting contract", async () => {
            await oracle.initProcess();
        })

        it("Fund Betting Contract", async () => {
            await betting.fundBook({ from: accounts[0], value: '100000000000000000' });
        })

        it("Fund Betting Contract with 200 finney", async () => {
            await betting.fundBettor({ from: accounts[2], value: '2000000000000000000' });
        })

        it("Fund Betting Contract with 200 finney", async () => {
            await betting.fundBettor({ from: accounts[3], value: '2000000000000000000' });
        })

    });

    describe("Send  Bets", async () => {

        let contractHash0;
        it("bet 10 on 0:0 (match 0: team 0)", async () => {
            const result = await betting.takeRegularBet(0, 0, "10000000000000000",{ from: accounts[3]});
            contractHash0 = result.logs[0].args.contractHash;
        })

        let contractHash1;
        it("bet 10 on 0:1", async () => {
            const result2 = await betting.takeRegularBet(0, 1, "10000000000000000",  { from: accounts[2]});
            contractHash1 = result2.logs[0].args.contractHash;
            const result = await betting.takeRegularBet(2, 1, "10000000000000000", { from: accounts[2]});
            contractHash2 = result.logs[0].args.contractHash;
            const result3 = await betting.postBigBet(1, 0, "100000000000000000", 1909, { from: accounts[2] });
            contractHash3 = result3.logs[0].args.contractHash;
            /*
            var checkO = await betting.checkOffer(contractHash3);
            const check1 = await betting.offercontracts(contractHash3).betAmount;
            const check2 = web3.utils.fromWei((await betting.offercontracts(contractHash3).betAmount), "finney");
            */
            var check = web3.utils.fromWei((await betting.offercontracts(contractHash3).betAmount), "finney");
            console.log(`checkOfferFn ${check}`);
          //  console.log(`checkOfferGetter ${check1}`);

        })


        })


  })
