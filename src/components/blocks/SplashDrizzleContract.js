import { drizzleConnect } from '@drizzle/react-plugin'
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Box, Flex } from '@rebass/grid'
import { Radius } from '../basics/Style'
import { B, A, E, K } from '../basics/Colors.js'
import Text from '../basics/Text.js'
import Triangle from '../basics/Triangle.js'
import { If, autoBind } from 'react-extras'
import Button from '../basics/Button'
import { useChainId, switchToAvalanche } from "../pages/switchAvalanche";


class SplashDrizzleContract extends Component {
  constructor(props, context) {
    super(props)
    autoBind(this)
  }

  render() {

    return (
      <Flex
        style={{
          borderRadius: Radius,
          overflow: "hidden",
        }}
      >
        <Box width={1} flexDirection="row" style={{ display: "flex" }}>

          <If
            condition={this.props.showActions}
            render={() => (
              <Box
                style={{
                  backgroundColor: B,
                  cursor: "pointer",
                  display: "flex",
                    borderRadius: "2px",
                  alignItems: "center",
                  width: "15em",
                  justifyContent: "flex-end",
                }}
                display="flex"
                flexDirection="row"
              >
                <ChainSwitch/>
                  <a
                    href={"/betpage"}
                    style={{ textDecoration: "none" }}
                  >
                  </a>
              </Box>
            )}
          />
        </Box>
      </Flex>
    );
  }
}

SplashDrizzleContract.contextTypes = {
  drizzle: PropTypes.object
}


const mapStateToProps = state => {
  return {
    contracts: state.contracts,
    accounts: state.accounts,
    drizzleStatus: state.drizzleStatus
  }
}

const ChainSwitch=()=>{
    const chainid = useChainId()
    if (chainid === 1) {
      return (<Box><button
          style={{
            backgroundColor: "#424242",
            borderRadius: "2px",
            cursor: "pointer",
          }}
          onClick={() => switchToAvalanche()}
         > Enter </button> </Box>)
    } else {
      return (<Box><button
          style={{
            backgroundColor: "#424242",
            borderRadius: "2px",
            cursor: "pointer",
          }}
          onClick={() => switchToAvalanche()}
         > switch to AVAX Network and Enter</button> </Box>)
    }

     }

export default drizzleConnect(SplashDrizzleContract, mapStateToProps);
