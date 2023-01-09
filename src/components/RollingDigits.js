import DigitRoll from 'digit-roll-react'
import React, { Component } from "react";
import './RollingDigits.css';

export default class RollingDigits extends Component {

    render() {
        return (
            <>
                {/* <DigitRoll num={this.state.num} length={9} divider="" delay="1" /> */}
                <DigitRoll num={this.props.fromParent} length={Math.log10(this.props.fromParent)} divider="," delay="1" />
            </>
        );
    }
}