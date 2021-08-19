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


      describe("set up contract", async () => {

        it('Get Oracle Contract Address', async () => {
            console.log(`Oracle Address is ${oracle.address}`);
        })

          it('Authorize Oracle Token', async () => {
              await token.approve(oracle.address, "100000000000000000000000");
          })
          it("Deposit Tokens in Oracle Contract2", async () => {
              await oracle.depositTokens("100000000000000000000000", {from: accounts[0]});
          })


       it('send init', async () => {
            var nextStart = firstStart + 7*86400;
            await oracle.initPost(["NFL:ARI:LAC","NFL:ATL:LAR","NFL:BAL:MIA","NFL:BUF:MIN","NFL:CAR:NE","NFL:CHI:NO","NFL:CIN:NYG","NFL:CLE:NYJ","NFL:DAL:OAK","NFL:DEN:PHI","NFL:DET:PIT","NFL:GB:SEA","NFL:HOU:SF","NFL:IND:TB","NFL:JAX:TEN","NFL:KC:WSH","UFC:Holloway:Kattar","UFC:Ponzinibbio:Li","UFC:Kelleher:Simon","UFC:Hernandez:Vieria","UFC:Akhemedov:Breese","UFC:Memphis:Brooklyn","UFC:Boston:Charlotte","UFC:Milwaukee:Dallas","UFC:miami:LALakers","UFC:Atlanta:SanAntonia","NHL:Colorado:Washington","NHL:Vegas:StLouis","NHL:TampaBay:Dallas","NHL:Boston:Carolina","NHL:Philadelphia:Edmonton","NHL:Pittsburgh:NYIslanders"], [nextStart, nextStart, nextStart, nextStart, nextStart, nextStart, nextStart, nextStart, nextStart, nextStart, nextStart, nextStart, nextStart, nextStart, nextStart, nextStart, nextStart, nextStart, nextStart, nextStart, nextStart, nextStart, nextStart, nextStart, nextStart, nextStart, nextStart, nextStart, nextStart, nextStart, nextStart, nextStart], [955, 2000, 500, 1000, 909, 800, 510, 1240, 1470, 960, 650, 1330, 970, 730, 1310, 1040, 520, 1020, 1470, 1200, 1080, 820, 770, 790, 730, 690, 970, 760, 1000, 720, 1360, 800], nextStart);
        })

        it("approve and send to betting contract", async () => {
           await helper.advanceTimeAndBlock(secondsInHour * 6);
            await oracle.initProcess();
        })

        it("Fund Contract", async () => {
            await betting.fundBook({ from: accounts[0], value: '300000000000000000' });
            await betting.fundBettor({ from: accounts[2], value: '200000000000000000' });
            await betting.fundBettor({ from: accounts[3], value: '200000000000000000' });
            const excessCapital = web3.utils.fromWei(await betting.margin(0), "finney");
            console.log(`margin0 is ${excessCapital} finney`);
          })
    });





})
