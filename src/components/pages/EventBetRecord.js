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


    this.currentContract = this.props.routeParams.contract;
    this.contracts = context.drizzle.contracts;
    this.drizzle = context.drizzle;
    this.priceHistory = {};
  }

  componentDidMount() {
    document.title = "Bet Event Logs";
      this.getRegBets();
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

  getRegBets() {
    const web3 = this.context.drizzle.web3;
    const contractweb3 = new web3.eth.Contract(Betting.abi, Betting.arbitrumaddress);
    var pricedata = [];
    contractweb3
      .getPastEvents("BetRecord", {
        fromBlock: 2000000,
        toBlock: 2153983,
      })
      .then(
        function (events) {
          events.forEach(function (element) {
            pricedata.push({
              Epoch: element.returnValues.epoch,
              time: element.returnValues.timestamp,
              BetSize: Number(element.returnValues.betsize) / 1e15,
              LongPick: element.returnValues.pick,
              MatchNum: element.returnValues.matchnum,
          //    Payoff: Number(element.returnValues.payoff) / 1e15,
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
      "https://rinkeby-explorer.arbitrum.io/address/0x131c66DC2C2a7D1b614aF9A778931F701C4945a1";
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
                {event.time},{" "}
                {event.Epoch}, {event.MatchNum}, {event.LongPick},{" "}
                {event.BetSize.toFixed(3)}, {" "}
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
