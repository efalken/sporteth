import React, { Component } from "react";
import { drizzleConnect } from "@drizzle/react-plugin";
import PropTypes from "prop-types";
import { autoBind } from "react-extras";
import Text from "../basics/Text";
import IndicatorD from "../basics/IndicatorD";
import Betting from "../../contracts/solidityjson/Betting.json";
var moment = require("moment");
var momentTz = require("moment-timezone");

class EventBetRecord extends Component {
  constructor(props, context) {
    super(props);
    autoBind(this);

    this.assets = [
      {
        contract: context.drizzle.contracts.Betting,
        id: 0,
      },
    ];

    this.currentContract = this.props.routeParams.contract;
    this.asset_id = 0;
    this.contracts = context.drizzle.contracts;
    this.drizzle = context.drizzle;
    this.priceHistory = {};
  }

  componentDidMount() {
    document.title = "Bet Event Logs";
    Object.keys(this.assets).forEach(function (asset) {
      this.getbetHistoryArray(asset);
    }, this);
  }

  timeConverter(UNIX_timestamp) {
    var a = new Date(UNIX_timestamp * 1000);
    var year = a.getFullYear();
    var month = a.getMonth();
    var date = a.getDate();
    var hour = a.getHours();
    var min = a.getMinutes();
    var time = date + "/" + month + "/" + year + " " + hour + ":" + min;
    return time;
  }

  getbetHistoryArray() {
    const web3 = this.context.drizzle.web3;
    const contractweb3 = new web3.eth.Contract(Betting.abi, Betting.address);
    var pricedata = [];
    contractweb3
      .getPastEvents("BetRecord", {
        fromBlock: 6000123,
        toBlock: "latest",
      })
      .then(
        function (events) {
          events.forEach(function (element) {
            pricedata.push({
              Epoch: element.returnValues.epoch,
              time: element.returnValues.timestamp,
              BetSize: element.returnValues.betsize / 1e15,
              LongPick: element.returnValues.pick,
              MatchNum: element.returnValues.matchnum,
              Payoff: element.returnValues.payoff / 1e15,
              Hashoutput: element.returnValues.contractHash,
              BettorAddress: element.returnValues.bettor,
            });
          }, this);
          this.priceHistory = pricedata;
        }.bind(this)
      );
  }

  openEtherscan() {
    const url =
      "https://rinkeby.etherscan.io/address/0x131c66DC2C2a7D1b614aF9A778931F701C4945a1";
    window.open(url, "_blank");
  }

  render() {
    if (Object.keys(this.priceHistory).length === 0)
      return (
        <Text size="20px" weight="200">
          Waiting...
        </Text>
      );
    else {
      return (
        <div>
          <IndicatorD
            className="etherscanLink"
            size="15px"
            mr="10px"
            mb="10px"
            ml="5px"
            mt="10px"
            width="360px"
            label="See Contract on"
            onClick={() => this.openEtherscan()}
            value="Etherscan"
          />
          <Text size="12px" weight="200">
            {" "}
            Time, Epoch, MatchNum, LongPick, Betsize, Payoff, BettorAddress,
            betHash
          </Text>{" "}
          <br />
          {this.priceHistory.map((event) => (
            <div>
              <Text size="12px" weight="200">
                {" "}
                {moment.unix(event.time).format("DD-MM-YYTHH:mm")},{" "}
                {event.Epoch}, {event.MatchNum}, {event.LongPick},{" "}
                {event.BetSize.toFixed(3)}, {event.Payoff.toFixed(3)},{" "}
                {event.BettorAddress}, {event.Hashoutput},{" "}
              </Text>
              <br />
            </div>
          ))}
        </div>
      );
    }
  }
}

EventBetRecord.contextTypes = {
  drizzle: PropTypes.object,
};

// May still need this even with data function to refresh component on updates for this contract.
const mapStateToProps = (state) => {
  return {
    accounts: state.accounts,
    contracts: state.contracts,
    drizzleStatus: state.drizzleStatus,
  };
};

export default drizzleConnect(EventBetRecord, mapStateToProps);
