import React, {CSSProperties, useEffect} from 'react'
import {colors} from "../../constants";

interface RightPaddleProps {
    custom: boolean,
    positionX: number;
    positionY: number;
    width: number;
    height: number
};

export default function RightPaddle(props: RightPaddleProps) {
    const style = {
        position: "absolute",
        top: props.positionY,
        left : props.positionX + props.width,
        width: props.width,
        height: props.height,
        backgroundColor: props.custom ? colors.GREEN : colors.TEXT_COLOR_MINUS_1,
        borderRadius: 10,
        // border: "2px solid #333",
        display: "flex"
    }
    return (
        <div className="right-paddle" style={style as CSSProperties}>
        </div>
    );
}