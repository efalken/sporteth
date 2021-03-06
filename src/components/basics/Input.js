import { B, Gg } from './Colors'
import { Radius } from './Style'
import { Box, Flex } from '@rebass/grid'
import React from 'react'
import { Choose } from 'react-extras'

// eslint-disable-next-line
export default ({ size, width, weight, label, placeholder, ...props }) => <Choose>
    <Choose.When condition={label !== undefined}>
        <Flex
            {...props}
            style={{
                border: `thin solid ${Gg}`,
                borderRadius: Radius,
                height: 30
            }}>

            {/* This is the label */}
            <Flex
                alignItems="center"
                px="9px"
                style={{
                    fontSize: size ? size : 14
                }}>
                {label}
            </Flex>

            {/* This is the value */}
            <Box
                style={{
                    borderLeft: `thin solid ${Gg}`,
                }}>
                <input style={{
                    border: "none",
                    paddingLeft: 7,
                    paddingRight: 7,
                    outline: "none",
                    backgroundColor: "#404040",
                    color: B,
                    width: width ? width : 50,
                    height: "100%",
                    fontSize: size ? size : 14,
                    fontWeight: weight ? weight : "normal"
                }} />
            </Box>

        </Flex>
    </Choose.When>
    <Choose.Otherwise>
        <Box
            {...props}>
            <input
                placeholder={placeholder}
                style={{
                    border: `thin solid ${Gg}`,
                    width: width ? width : 120,
                    color: B,
                    outline: "none",
                    backgroundColor: "#404040",
                    padding: "5px 7px 5px 7px",
                    fontSize: size ? size : 14,
                    fontWeight: weight ? weight : "normal",
                    borderRadius: Radius
                }} />
        </Box>
    </Choose.Otherwise>
</Choose>
