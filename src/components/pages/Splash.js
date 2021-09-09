import React, { Component } from "react";
import { Link } from 'react-router-dom';
import PropTypes from "prop-types";
import Logo from "../basics/Logo";
import { Flex, Box } from "@rebass/grid";
import Text from "../basics/Text";
import VBackground from "../basics/VBackground";
import SplashDrizzleContract from "../blocks/SplashDrizzleContract";
import { autoBind } from "react-extras";
import wppdf from "../whitepaper/SportEth.pdf";
import excelSheet from "../whitepaper/sportEthData.xlsx";
import EthCrypto from 'eth-crypto';

class Splash extends Component {
  constructor(props, context) {
    super(props);
    autoBind(this);

    this.state = {
      contracts: [
        {
          asset: "NFL",
          id: 0,
        },
      ],
      chartSymbols: ["SP:FOOT1", "BTCUSD"],
    };
  }

  openWhitepaper() {
    console.log("Opened whitepaper");
    // TODO
  }

  openCheatSpreadsheet() {
    console.log("Opened cheat spreadsheet");
    // TODO
  }

  openSimulationSheet() {
    console.log("Opened simulation sheet");
    // TODO
  }

  openContract(id) {
    console.log("Opened contract", id);
    // TODO
  }


  render() {
    return (
      <div>
        <VBackground />
        <Flex width={1}>
          {/* pt={30}
        px={30}> */}

          <Flex width={1} flexWrap="wrap">
            <Flex
              width={1}
              backgroundColor="rgba(27, 29, 30, 0.6)"
              padding="10px"
              justifyContent="space-between"
            >
              <Box>
                <Logo />
              </Box>

              <Flex
                width="100%"
                justifyContent="space-around"
                alignItems="center"
                // height="100%"
                className="nav-header-wrap"
              >
                {}
                <Flex
                  flexWrap="wrap"
                  width="100%"
                  justifyContent="space-around"
                  //   onClick={this.openWhitepaper}
                  style={{ cursor: "pointer" }}
                  variant="nav"
                >
                  {}
                  <Flex
                    alignItems="center"
                    height="100%"
                    className="nav-header-wrap"
                    backgroundColor="rgba(27, 29, 30, 0.6)"
                    width="100%"
                    justifyContent="space-around"
                  >
                    <Text size="15px">
                      <a
                        className="nav-header"
                        style={{
                          textDecoration: "none",
                          cursor: "pointer",
                        }}
                        href={wppdf}
                        download=""
                      >
                        Whitepaper
                      </a>
                    </Text>

                    <Text size="15px">
                      <a
                        className="nav-header"
                        style={{
                          textDecoration: "none",
                          cursor: "pointer",
                        }}
                        href="https://rinkeby.etherscan.io/address/0xEA3609F8194B149DeDfbE742A8188A18dBdF0e9e"
                        target="_blank"
                      >
                        EtherScan
                      </a>
                    </Text>

                    <Text size="15px" className="nav-header"
                        style={{
                          textDecoration: "none",
                          cursor: "pointer",
                        }}> 
                      <Link to="/faqs" >
                        FAQ
                      </Link>
                    </Text>

                    <Text size="15px">
                      <a
                        className="nav-header"
                        style={{
                          textDecoration: "none",
                          cursor: "pointer",
                        }}
                        href={excelSheet}
                      >
                        Excel Sheet
                      </a>
                    </Text>

                    <Text size="15px">
                      <a
                        className="nav-header"
                        style={{
                          textDecoration: "none",
                          cursor: "pointer",
                        }}
                        href="http://github.com/efalken/SportEth"
                       >
                        Github Project
                      </a>
                    </Text>
                  </Flex>
                </Flex>
              </Flex>

              {/* </Box> */}
            </Flex>
            <Flex
              width={1}
              justifyContent="center"
              alignItems="center"
              // style={{
              //     height: "calc(100vh - 90px)"
              // }}
            >
              <Box mt="50px">
                <Flex
                  mt="20px"
                  // mr="-20px"
                  flexWrap="wrap"
                  justifyContent="center"
                  flexDirection="column"
                  alignItems="center"
                >
                  {this.state.contracts.map((contract) =>
                    contract.asset == "NFL" ? (
                      <Box mr="20px" mb="20px" key={contract.id}>
                        <SplashDrizzleContract
                          showActions={true}
                          key={contract.asset}
                          contract={contract}
                          width="1400px"
                          id={contract.id}
                        />
                      </Box>
                    ) : null
                  )}
                </Flex>
              </Box>
            </Flex>
          </Flex>
        </Flex>
        <Box>
          <Flex width="100%" alignItems="center" justifyContent="center">
            <Text size="20px">Event Logs</Text>
          </Flex>
        </Box>

        <div className="footer-links-wrapper" style={{ width: "115%" }}>
          <Flex width="100%" alignItems="center" justifyContent="center">
            <Text size="15px" className="nav-header"
                style={{
                  textDecoration: "none",
                  cursor: "pointer",
                  width: "20em",
                  alignItems: "flex-start",
                  display: "flex",
                }}>
              <Link to="/bethistory" >
                Bets
              </Link>
            </Text>
          </Flex>
          <Flex width="100%" alignItems="center" justifyContent="center">
            <Text size="15px" className="nav-header"
                style={{
                  textDecoration: "none",
                  cursor: "pointer",
                  width: "20em",
                  alignItems: "flex-start",
                  display: "flex",
                }}>
              <Link to="/bigbethistory">
                Big Bets
              </Link>
            </Text>
          </Flex>
          <Flex>
            <Text> </Text>
          </Flex>
          <Flex width="100%" alignItems="center" justifyContent="center">
            <Text size="15px" className="nav-header"
                style={{
                  textDecoration: "none",
                  cursor: "pointer",
                  width: "20em",
                  alignItems: "flex-start",
                  display: "flex",
                }}>
              <Link to='/oddshistory'>
                Oddds Posted
              </Link>
            </Text>
          </Flex>

          <Flex>
            <Text> </Text>
          </Flex>
          <Flex width="100%" alignItems="center" justifyContent="center">
            <Text size="15px" className="nav-header"
                style={{
                  textDecoration: "none",
                  cursor: "pointer",
                  width: "20em",
                  alignItems: "flex-start",
                  display: "flex",
                }}>
              <Link to="/resultshistory">
                Game Outcomes
              </Link>
            </Text>
          </Flex>

          <Flex>
            <Text> </Text>
          </Flex>

          <Flex>
            <Text> </Text>
          </Flex>
          <Flex width="100%" alignItems="center" justifyContent="center">
            <Text size="15px"   className="nav-header" style={{
                  textDecoration: "none",
                  cursor: "pointer",
                  width: "20em",
                  alignItems: "flex-start",
                  display: "flex",
                }}>
                <Link to='/schedhistory'>Team Schedules</Link>
            </Text>
          </Flex>
        </div>
      </div>
    );
  }
}

Splash.contextTypes = {
  drizzle: PropTypes.object,
};

export default Splash;
