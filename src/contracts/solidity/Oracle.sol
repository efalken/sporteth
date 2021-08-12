// SPDX-License-Identifier: MIT
pragma solidity ^0.7.4;
pragma experimental ABIEncoderV2;

//import "./Token.sol";

import "./Betting.sol";

contract Oracle {
    // after each settlement, a new epoch commences. Bets cannot consummate on games referring to prior epochs
    uint8 public betEpoch;
    // This is true if there is a proposal under consideration, other proposals are not allowed while a current proposal
    // is under review: 0 null, 1 init, 2 odds, 3 settle, 4 params
    uint8 public underReview;
    // result are coded where 2 is a tie/cancellation or postponement, 0 for home team win, 1 for away team win.
    uint8[32] public propResults;
    // this tracking number is for submissions, needed for tracking whether someone already voted on a data proposal
    // incremented at each processing
    uint16 public propNumber;
    // propStartTime in UTC is used to stop active betting. No bets are taken after this time.
    uint256[32] public propStartTime;
    // odds are entered as probabilitie, such that 51000 is a 51.0% chance of winning
    // This translates to decimal odds via 1/p, where p is in units like 0.51.
    // a standard bet that pays out with decimale odds of 1.909 pays the better back his bet amount plus
    // 0.909 times that amount as the bettor's winning.
    // betAmount*(propOdds/1000 * 95/100 +1) is the gross payoff to bettor for a winning bet,
    // betAmount*propOdds/1000 * 95/100 is the net payoff to bettor for a winning bet
    uint256[32] public propOdds;
    // this is the UTC at which LPs can no longer withdraw or deposit until the next settlement
    // it is the time of the earliest game start. It is more efficient to load this in separately rather than
    // take the minimum of the data in the unedited propStartTime array
    uint256 public earliestStart;
    // timer is used so that each proposal has at least a 3 hours for voters to respond
    uint256 public timer;
    // tracks the current local token balance of active oracle contract administrators, as
    // documented by the deposit of their tokens within this contract
    uint256 public totKontractTokens;
    // A proposal goes through via a simple rule of more yes than no votes. Thus, a trivial vote does not need more yes votes
    // if a troll rejects a vote that has few Yes votes, a vote later than evening takes a large bond amount, so
    // and submitters should anticipate such an event
    uint256 public voteYes;
    uint256 public voteNo;
    // uint256 public constant CURE_TIME = 5 hours;
    // uint256 public constant HOUR_START = 10;
    uint256 public constant CURE_TIME = 5 hours;
    uint256 public constant HOUR_START = 10;
    uint256 public constant MIN_BOND = 100 ether;
    uint256 public constant MIN_SUBMIT = 5000 ether;
    /** the schedule is a record of "sport:home:away", such as "NFL:NYG:SF" for us football, New York Giants vs San Francisco */
    string[32] public propSchedule;
    // keeps track of those who supplied data proposals. Proposers have to deposit tokens as a bond, and if their
    // proposal is rejected, they lose that bond.
    address public proposer;
    // this allows the oracle administrators to vote on new betting/oracle contracts without withdrawing their tokens
    Token public token;
    Betting public bettingContract;
    uint256 public feePool;
    mapping(address => AdminisStruct) public adminStruct;

    // tokens these are tokens held in the custody of this contract. Only tokens deposited in this contract can
    // be used for voting or for claiming oracle ether. Note these tokens are owned by the oracle contract while deposited
    // as far as the ERC-20 contract is concerned, but they are credited to the token depositors within this contract
    //voteTrackr keeps track of the proposals in this contract, so that token holders can only vote once for each proposal
    // with the tokens they have in this contract.
    struct AdminisStruct {
        uint256 tokens;
        uint16 voteTracker;
        uint256 initFeePool;
    }

    event ResultsPosted(
        bool indexed posted,
        uint16 propnum,
        uint8[32] winner,
        uint256 timestamp,
        uint8 epoch,
        address proposer
        );

    event DecOddsPosted(
        bool indexed posted,
        uint16 propnum,
        uint256[32] decOdds,
        uint256 timestamp,
        uint8 epoch,
        address proposer
        );

    event ParamsPosted(
        uint256 minBet,
        uint256 concLimit,
        uint256 timestamp,
        uint8 epoch,
        address proposer
    );

    event SchedulePosted(
        bool indexed posted,
        uint16 propnum,
        string[32] sched,
        uint256 timestamp,
        uint8 epoch,
        address proposer
        );

    event StartTimesPosted(
        bool indexed posted,
        uint16 propnum,
        uint256[32] starttimes,
        uint256 timestamp,
        uint8 epoch,
        address proposer
    );

    event Funding(
        uint256 tokensChange,
        uint256 etherChange,
        address transactor
    );

    constructor(address payable bettingk, address _token) {
        bettingContract = Betting(bettingk);
        token = Token(_token);
        timer = 2e9;
        betEpoch = 1;
        propNumber = 1;
        feePool=0;
    }

    function vote(bool sendData) external {
        // voter must have votes to allocate
        require(adminStruct[msg.sender].tokens > 0);
        // can only vote if there is a proposal
        require(underReview != 0);
        // voter must not have voted on this proposal
        require(adminStruct[msg.sender].voteTracker != propNumber);
        // this prevents this account from voting again on this data proposal (see above)
        adminStruct[msg.sender].voteTracker = propNumber;
        // votes are simply one's entire token balance deposited in this oracle contract
        if (sendData) {
            voteYes += adminStruct[msg.sender].tokens;
        } else {
            voteNo += adminStruct[msg.sender].tokens;
        }
        // 5e4 is 1/2 of the minted tokens, so this expedites data submissions
        // if (voteYes > 5e4 ether && underReview != 3) timer = 0;
    }

    receive() external payable {}

    function initPost(
        string[32] memory teamsched,
        uint256[32] memory starts,
        uint256[32] memory decimalOdds,
        uint256 earlyStart
    ) external {
        // this requirement makes sure a post occurs only if there is not a current post under consideration, or
        // it is an amend for an earlier post with these data
        require(underReview == 0, "Already under Review");
        underReview = 1;
        post();
        propSchedule = teamsched;
        propStartTime = starts;
        propOdds = decimalOdds;
        earliestStart = earlyStart;
        // this tells users that an inimtial proposal has been sent, which is useful for oracle administrators who are monitoring this contract
        emit SchedulePosted(false, propNumber, teamsched, block.timestamp, betEpoch, msg.sender);
        emit StartTimesPosted(false, propNumber, starts, block.timestamp, betEpoch, msg.sender);
        emit DecOddsPosted(false, propNumber, decimalOdds, block.timestamp, betEpoch, msg.sender);
    }

    function oddsPost(uint256[32] memory decimalOdds) external {
        require(underReview == 0, "Already under Review");
        underReview = 2;
        post();
        propOdds = decimalOdds;
        emit DecOddsPosted(false, propNumber, propOdds, block.timestamp, betEpoch, msg.sender);
    }

    function settlePost(uint8[32] memory resultVector) external {
        // this prevents a settle post when other posts have been made
        require(underReview == 0, "Already under Review");
        underReview = 3;
        post();
        propResults = resultVector;
        emit ResultsPosted(false, propNumber, propResults, block.timestamp, betEpoch, msg.sender);
    }

    function initProcess() external {
        // this prevents an odds or results proposal from being sent
        require(underReview == 1, "wrong data");
        // needs at least 3 hours or a clear majority decision
        require (block.timestamp > timer, "too soon");
        // only sent if 'null' vote does not win
        if (voteYes > voteNo) {
            // successful submitter gets their bonded tokens back
            adminStruct[proposer].tokens += MIN_BOND;
            // sends to the betting contract
            bettingContract.transmitInit(
                propSchedule,
                propStartTime,
                propOdds,
                earliestStart
            );
            emit SchedulePosted(true, propNumber, propSchedule, block.timestamp, betEpoch,  proposer);
            emit StartTimesPosted(true, propNumber, propStartTime, block.timestamp, betEpoch,  proposer);
            emit DecOddsPosted(true, propNumber, propOdds, block.timestamp, betEpoch,  proposer);
        }
        // resets various data (eg, timer)
        reset();
        // resets data arrays for next submission
        // delete propSchedule;
        // delete propOdds;
        // delete propStartTime;
        // delete earliestStart;
    }

    // these have the same logic as for the initProcess, just for the different datasets
    function oddsProcess() external {
        // this prevents an 'initProcess' set being sent as an odds transmit
        require(underReview == 2, "wrong data");
        // needs at least 3 hours or a clear majority decision
        require (block.timestamp > timer, "too soon");
        if (voteYes > voteNo) {
            // proposer gets back their bonding amount
            adminStruct[proposer].tokens += MIN_BOND;
            bettingContract.transmitOdds(propOdds);
            emit DecOddsPosted(true, propNumber, propOdds, block.timestamp, betEpoch,  proposer);
        }
        // resets various data (eg, timer)
        reset();
        // delete propOdds;
    }

    function settleProcess() external {
        require(underReview == 3, "wrong data");
        // needs at least 3 hours or a clear majority decision
        require (block.timestamp > timer, "too soon");
        uint256 ethDividend;
        if (voteYes > voteNo) {
        // proposer gets back their bonding amount
            adminStruct[proposer].tokens += MIN_BOND;
            (betEpoch, ethDividend) = bettingContract.settle(propResults);
            emit ResultsPosted(true, propNumber, propResults, block.timestamp, betEpoch,  proposer);
            feePool += (ethDividend * 1e18 / totKontractTokens);
        }
        // resets various data (eg, timer)
        reset();
        // delete propResults;
    }

    function paramUpdate(uint256 minbet, uint256 concentrationLim) external {
        // In the first case, an immediate send allows a simple way to protect against stale odds
        // a high minimum bet would prevent new bets while odds are voted upon
        // in the second case, a large token holder can make the contract able to take more more bets
        require((minbet > 1e7 && adminStruct[msg.sender].tokens >= 1000 ether) || adminStruct[msg.sender].tokens >= 5000 ether, "Low Balance");
        bettingContract.adjustParams(minbet, concentrationLim);
        emit ParamsPosted(
            minbet,
            concentrationLim,
            block.timestamp,
            betEpoch,
            msg.sender
        );
    }

    function withdrawTokens(uint amtTokens) external {
        require(amtTokens <= adminStruct[msg.sender].tokens,
            "need tokens"
        );
        // this prevents voting more than once or oracle proposals with token balance.
        require(underReview == 0, "no wd during vote");
        uint ethBalance = address(this).balance;
        uint userTokens = adminStruct[msg.sender].tokens;
        uint ethClaim = (feePool - adminStruct[msg.sender].initFeePool ) * userTokens/ 1e18 ;
        adminStruct[msg.sender].initFeePool = feePool;
        totKontractTokens -= amtTokens;
        adminStruct[msg.sender].tokens -= amtTokens;
        if (ethBalance <= ethClaim) ethClaim = ethBalance;
        payable(msg.sender).transfer(ethClaim);
        token.transfer(msg.sender, amtTokens);
        emit Funding(amtTokens, ethClaim, msg.sender);
    }

    function depositTokens(uint256 amt) external {
        // Must own one thousandth of outstanding tokens (100,000 eth) to administer oracle
        // and receive dividends. Prevents spamming by de minimus token holders
        require(amt >= 100 ether);

        if (adminStruct[msg.sender].tokens > 0) {
            uint userTokens = adminStruct[msg.sender].tokens;
            uint ethClaim = (feePool - adminStruct[msg.sender].initFeePool ) * userTokens/ 1e18 ;
            uint ethBalance = address(this).balance;
            if (ethBalance <= ethClaim) ethClaim = ethBalance;
            payable(msg.sender).transfer(ethClaim);
            }
        token.transferFrom(msg.sender, address(this), amt);
        adminStruct[msg.sender].tokens += amt;
        totKontractTokens += amt;
        adminStruct[msg.sender].initFeePool = feePool;
        emit Funding(amt, 0, msg.sender);
    }

    function post() internal {
        // constraining the hourOfDay to be > 10 gives users a block of time where they can be confident that their
        // inattention to the contract poses no risk of a malicious data submission.
        require(hourOfDay() >= HOUR_START, "hour");
        // this ensures subtraction below is valid
        // also that only significant token holders are making proposals
        require(adminStruct[msg.sender].tokens >= MIN_SUBMIT, "Low Balance");
        timer = block.timestamp + CURE_TIME;
        voteYes = adminStruct[msg.sender].tokens;
        // REMOVE AT USE
        if (adminStruct[msg.sender].tokens > 5e4 ether) timer = 0;
        // this prevents proposer from voting again with his tokens on this submission
        adminStruct[msg.sender].voteTracker = propNumber;
        // check above makes this safemath
        adminStruct[msg.sender].tokens -= MIN_BOND;
        proposer = msg.sender;
    }

    function reset() internal {
        // if the collective has sufficient time, or the majority has a preference registered, one can submit asap
        delete proposer;
        voteYes = 0;
        voteNo = 0;
        underReview = 0;
        propNumber++;
        timer = 0;
    }

    // this is used so users do not have to delegate someone else to monitor the contract 24/7
    // 86400 is seconds in a day, and 3600 is seconds in an hour
    function hourOfDay() public view returns (uint256 hour1) {
        hour1 = (block.timestamp - 7200) % 86400 / 3600;
    }
}
