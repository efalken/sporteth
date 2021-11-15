pragma solidity ^0.8.0;

/**
SPDX-License-Identifier: MIT
Copyright © 2021 Eric G. Falkenstone
*/

import "./Token.sol";


contract Betting {
    /** totalShares is used to monitor an LP's share of LP eth in the contract.
        3 betEpoch, 4 totalShares, 5 concentrationLimit, 6 nonce, 7 firstStart
        */
    uint32[8] public margin;
    /// betLong[home/away], betPayout, starttime, odds
    uint256[32] public betData;
    address payable public oracleAdmin;
    /// this struct contains the parameters of a bet
    mapping(bytes32 => Subcontract) public betContracts;
    mapping(bytes32 => Subcontract) public offerContracts;
    /// this maps the set {epoch, match, team} to its event outcome,
    ///where 0 is a loss, 1 is a tie or postponement, 2 a win
    /// The outcome defaults to 0, so that these need not be updated for a loss
    mapping(uint32 => uint8) public outcomeMap;
    /// This keeps track of an LP's ownership in the LP ether capital,
    /// and also when it can first withdraw capital (two settlement periods)
    mapping(address => LPStruct) public lpStruct;
    /// this struct holds a user's ETH balance
    mapping(address => uint32) public userBalance;
    /// Schedule is a string where Sport:FavoriteTeam:UnderdogTeam
    Token public token;
    uint256 public constant UNITS_TRANS14 = 1e14;
    uint32 public constant FUTURE_START = 2e9;
    uint256 public constant ORACLE_5PERC = 5e12;

    struct Subcontract {
        uint8 epoch;
        uint8 matchNum;
        uint8 pick;
        uint32 betAmount;
        uint32 payoff;
        address bettor;
    }

    struct LPStruct {
        uint32 shares;
        uint32 outEpoch;
    }

    event BetRecord(
        address indexed bettor,
        uint8 indexed epoch,
        uint8 matchNum,
        uint8 pick,
        uint32 betAmount,
        uint32 payoff,
        bytes32 contractHash
    );

    event OfferRecord(
        address indexed bettor,
        uint8 indexed epoch,
        uint8 matchNum,
        uint8 pick,
        uint32 betAmount,
        uint32 payoff,
        bytes32 contractHash
    );

    event Funding(
        address bettor,
        uint256 moveAmount,
        uint32 epoch,
        uint32 action
    );

    constructor(address _tokenAddress) {
        margin[5] = 5;
        margin[3] = 1;
        token = Token(_tokenAddress);
    }

    modifier onlyAdmin() {
        require(oracleAdmin == msg.sender);
        _;
    }

    function setOracleAddress(address payable _oracleAddress) external {
        require(oracleAdmin == address(0x0), "Only once");
        oracleAdmin = _oracleAddress;
    }

    receive() external payable {}

/// @param _matchNumber is 0 to 31, representing the matche
/// @param _team0or1 is the initial favorite (0) and underdog (1)
/// @param _betAmt is the amount bet in 10s of finney, 0.0001 ether
    function bet(
        uint8 _matchNumber,
        uint8 _team0or1,
        uint32 _betAmt
    ) external {
        require(_betAmt <= userBalance[msg.sender], "NSF ");
        (uint32[7] memory betDatav) = decodeNumber(betData[_matchNumber]);
        require(betDatav[4] > block.timestamp, "game started or not playing");
        int32 betPayoff = int32(_betAmt) * int32(betDatav[5 + _team0or1]) / 1000;
        int32 netPosTeamBet = int32(betDatav[2 + _team0or1]) - int32(betDatav[1 - _team0or1]);
        require(int32(betPayoff + netPosTeamBet) < int32(margin[0]/margin[5]), "betsize over limit");
        int32 netPosTeamOpp = int32(betDatav[3 - _team0or1]) - int32(betDatav[_team0or1]);
        int32 marginChange = maxZero(int32(betPayoff) + netPosTeamBet, -int32(_betAmt) + netPosTeamOpp) - maxZero(netPosTeamBet, netPosTeamOpp);
        require(marginChange < int32(margin[0] - margin[1]),
            "betsize over unpledged capital"
        );
        userBalance[msg.sender] -= _betAmt;
        bytes32 subkID = keccak256(abi.encodePacked(margin[6], block.timestamp));
        Subcontract memory order;
        order.bettor = msg.sender;
        order.betAmount = _betAmt;
        order.payoff = uint32(betPayoff);
        order.pick = _team0or1;
        order.matchNum = _matchNumber;
        order.epoch = uint8(margin[3]);
        betContracts[subkID] = order;
        margin[2] += _betAmt;
        margin[1] = uint32(addSafe(margin[1], marginChange));
        betDatav[_team0or1] += _betAmt;
        betDatav[2 + _team0or1] += uint32(betPayoff);
        uint256 encoded;
        encoded |= uint256(betDatav[0]) << 224;
        encoded |= uint256(betDatav[1]) << 192;
        encoded |= uint256(betDatav[2]) << 160;
        encoded |= uint256(betDatav[3]) << 128;
        encoded |= uint256(betDatav[4]) << 64;
        encoded |= uint256(betDatav[5]) << 32;
        encoded |= uint256(betDatav[6]);
        betData[_matchNumber] = encoded;
        margin[6]++;
        emit BetRecord(
            msg.sender,
            uint8(margin[3]),
            _matchNumber,
            _team0or1,
            _betAmt,
            uint32(betPayoff),
            subkID
        );
    }

    function postBigBet(
        uint8 _matchNum,
        uint8 _team0or1,
        uint32 _betAmount,
        uint32 _decOddsBB
    ) external {
        require(
            _betAmount >= margin[0]/margin[5], "concLimit");
        require(_betAmount <= userBalance[msg.sender],
            "NSF"
        );
        require(_decOddsBB > 1000 && _decOddsBB < 9999, "invalid odds");
        bytes32 subkID = keccak256(abi.encodePacked(margin[6], block.timestamp));
        Subcontract memory order;
        order.pick = _team0or1;
        order.matchNum = _matchNum;
        order.epoch = uint8(margin[3]);
        order.bettor = msg.sender;
        order.betAmount = _betAmount;
        order.payoff = ((_decOddsBB - 1000) * _betAmount) / 1000;
        offerContracts[subkID] = order;
        margin[6]++;
        emit OfferRecord(
            msg.sender,
            uint8(margin[3]),
            _matchNum,
            _team0or1,
            order.betAmount,
            order.payoff,
            subkID
        );
    }

    function takeBigBet(bytes32 _subkid) external {
        Subcontract memory k = offerContracts[_subkid];
        (uint32[7] memory betDatav) = decodeNumber(betData[k.matchNum]);
        require(betDatav[4] > block.timestamp, "game started");
        require(k.epoch == margin[3], "expired bet"
        );
        require(
            userBalance[k.bettor] >= k.betAmount && userBalance[msg.sender] >= k.payoff, "NSF"
        );
        betDatav[k.pick] += k.betAmount;
        betDatav[2 + k.pick] += k.payoff;
        betDatav[1 - k.pick] += k.payoff;
        betDatav[3 - k.pick] += k.betAmount;
        userBalance[k.bettor] -= k.betAmount;
        betContracts[_subkid] = k;
        emit BetRecord(
            k.bettor,
            uint8(margin[3]),
            k.matchNum,
            k.pick,
            k.betAmount,
            k.payoff,
            _subkid
        );
        bytes32 subkID2 = keccak256(abi.encodePacked(margin[6], block.timestamp));
        k.bettor = msg.sender;
        uint32 temppay = k.payoff;
        k.payoff = k.betAmount;
        k.betAmount = temppay;
        k.pick = 1 - k.pick;
        margin[2] += (k.payoff + k.betAmount);
        userBalance[msg.sender] -= k.betAmount;
        emit BetRecord(
            msg.sender,
            uint8(margin[3]),
            k.matchNum,
            k.pick,
            k.betAmount,
            k.payoff,
            subkID2
        );
        uint256 encoded;
        encoded |= uint256(betDatav[0]) << 224;
        encoded |= uint256(betDatav[1]) << 192;
        encoded |= uint256(betDatav[2]) << 160;
        encoded |= uint256(betDatav[3]) << 128;
        encoded |= uint256(betDatav[4]) << 64;
        encoded |= uint256(betDatav[5]) << 32;
        encoded |= uint256(betDatav[6]);
        betData[k.matchNum] = encoded;
        betContracts[subkID2] = k;
        margin[6]++;
        delete offerContracts[_subkid];
    }

    function cancelBigBet(bytes32 _subkid) external {
        require(offerContracts[_subkid].bettor == msg.sender, "wrong account");
        delete betContracts[_subkid];
    }

    function settle(uint8[32] memory _winner)
        external
        onlyAdmin
        returns (uint32, uint32)
        {
        uint32 redemptionPot;
        uint32 payoffPot;
        uint epochMatchWinner;
            uint winningTeam;
        for (uint i = 0; i < 32; i++) {
            winningTeam = _winner[i];
            (uint32[7] memory betDatav) = decodeNumber(betData[i]);
            epochMatchWinner = i * 10 + margin[3] * 1000;
            if (winningTeam != 2) {
                redemptionPot += betDatav[winningTeam];
                payoffPot += betDatav[winningTeam+2];
                outcomeMap[uint32(epochMatchWinner + winningTeam)] = 2;
            } else {
                redemptionPot += (betDatav[0] + betDatav[1]);
                outcomeMap[uint32(epochMatchWinner)] = 1;
                outcomeMap[uint32(1 + epochMatchWinner)] = 1;
            }
        }
        margin[0] = addSafe(margin[0] + margin[2], -int32(redemptionPot + payoffPot));
        margin[3]++;
        uint256 oracleDiv = ORACLE_5PERC * uint256(payoffPot);
        margin[1] = 0;
        margin[2] = 0;
        delete betData;
        margin[7] = FUTURE_START;
        oracleAdmin.transfer(oracleDiv);
        return (margin[3], uint32(5 * payoffPot));
    }

    function fundBettor() external payable {
        uint32 amt = uint32(msg.value / UNITS_TRANS14);
        userBalance[msg.sender] += amt;
        emit Funding(msg.sender, msg.value, margin[3], 0);
    }

    function fundBook() external payable {
        require(block.timestamp < uint32(margin[7]), "only prior to first event");
        uint32 netinvestment = uint32(msg.value / UNITS_TRANS14);
        uint32 _shares = 0;
        if (margin[0] > 0) {
            _shares = multiply(netinvestment, margin[4]) / margin[0];
        } else {
            _shares = netinvestment;
        }
        margin[0] = addSafe(margin[0], int32(netinvestment));
        lpStruct[msg.sender].outEpoch = margin[3] + 1;
        margin[4] += _shares;
        lpStruct[msg.sender].shares += _shares;
        emit Funding(msg.sender, msg.value, margin[3], 1);
    }

    function redeem(bytes32 _subkId) external {
        require(betContracts[_subkId].bettor == msg.sender, "wrong account");
        uint32 epochMatchWinner = betContracts[_subkId].epoch * 1000 + betContracts[_subkId].matchNum * 10 + betContracts[_subkId].pick;
        require(outcomeMap[epochMatchWinner] != 0, "need win or tie");
        uint32 payoff = betContracts[_subkId].betAmount;
        if (outcomeMap[epochMatchWinner] == 2) {
            payoff += (betContracts[_subkId].payoff * 95) / 100;
        }
        delete betContracts[_subkId];
        userBalance[msg.sender] += payoff;
        if (token.balanceOf(address(this)) > 0) {
            token.transfer(payable(msg.sender), 1);
        }
        emit Funding(msg.sender, payoff, margin[3], 2);
    }

    function withdrawBettor(uint32 _amt) external {
        require(_amt <= userBalance[msg.sender]);
        userBalance[msg.sender] -= _amt;
        uint256 amt256 = uint256(_amt) * UNITS_TRANS14;
        payable(msg.sender).transfer(amt256);
        emit Funding(msg.sender, amt256, margin[3], 3);
    }

    function withdrawBook(uint32 _sharesToSell) external {
        require(block.timestamp < uint32(margin[7]), "only prior to first event");
        require(lpStruct[msg.sender].shares >= _sharesToSell, "NSF");
        require(margin[3] > lpStruct[msg.sender].outEpoch, "too soon");
        uint32 ethWithdraw =
            multiply(_sharesToSell, margin[0]) / margin[4];
        require(
            ethWithdraw <= (margin[0] - margin[1]),
            "insufficient free capital"
        );
        margin[4] -= _sharesToSell;
        lpStruct[msg.sender].shares -= _sharesToSell;
        margin[0] -= ethWithdraw;
        uint256 ethWithdraw256 = uint256(ethWithdraw) * UNITS_TRANS14;
        payable(msg.sender).transfer(ethWithdraw256);
        emit Funding(msg.sender, ethWithdraw256, margin[3], 4);
    }

    function transmitInit(
    uint96[32] memory _oddsAndStart) external onlyAdmin {
        require(margin[2] == 0);
        betData = _oddsAndStart;
        margin[7] = uint32(_oddsAndStart[0] >> 64);
    }

    function transmitUpdate(uint64[32] memory _updateBetData) external onlyAdmin {
        uint256 encoded;
        for (uint i = 0; i < 32; i++) {
            uint256 x = uint256(betData[i] >> 64);
            encoded |= uint256(x) << 64;
            encoded |= uint256(_updateBetData[i]);
            betData[i] = encoded;
            delete encoded;
        }
    }

    function adjustParams(uint32 _maxPos) external onlyAdmin {
        margin[5] = _maxPos;
    }

    function checkRedeem(bytes32 _subkID) external view returns (bool) {
        uint32 epochMatchWinner = betContracts[_subkID].epoch * 1000 +
            betContracts[_subkID].matchNum * 10 + betContracts[_subkID].pick;
        bool redeemable = (outcomeMap[epochMatchWinner] > 0);
        return redeemable;
    }

    function showBetData() external view returns (uint256[32] memory) {
        return betData;
    }

    function decodeNumber(uint256 _encoded) internal pure returns (uint32[7] memory vec1 ) {
        vec1[0] = uint32(_encoded >> 224);
        vec1[1] = uint32(_encoded >> 192);
        vec1[2] = uint32(_encoded >> 160);
        vec1[3] = uint32(_encoded >> 128);
        vec1[4] = uint32(_encoded >> 64);
        vec1[5] = uint32(_encoded >> 32);
        vec1[6] = uint32(_encoded);
    }

    function maxZero(int32 a, int32 b) internal pure returns (int32) {
        int32 c = a >= b ? a : b;
        if (c <= 0) c = 0;
        return c;
    }

    function multiply(uint32 _a, uint32 _b) internal pure returns (uint32) {
        uint32 c = _a * _b;
        require(c / _a == _b, "mult overflow");
        return c;
    }

    function addSafe(uint32 _a, int32 _b) internal pure returns (uint32) {
        uint32 c;
        if (_b < 0) {
            c = _a - uint32(-_b);
            require(c < _a, "overflow");
        } else {
            c = _a + uint32(_b);
            require(c >= _a, "overflow");
        }
        return c;
    }

}
