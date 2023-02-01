import React, {CSSProperties, useEffect, useState} from "react";
import {UseFrameTime} from "../../utils/UseFrameTime";
import {BallPropsNew, GameFlowState} from "./Game";
import {colors} from "../../constants";

interface BallProps {
    x: number;
    y: number;
}
let ballPositionX : number
let ballPositionY : number


function getBallContainerStyle(x: number, y: number){
    return({
        left: x,
        top: y,
        position: "absolute",
        display: "flex",
        justifyContent:"center",
        alignItems: "center"
    })
}

export default function Ball(props: BallPropsNew) {
    const [update,setUpdate] = useState(false)
    const up = () => {
        setUpdate(update => update === true ? false : true)
    }
    const style = {
        height: props.ballSize,
        width: props.ballSize,
        borderRadius: "50%",
        background: "#ddd",
        backgroundColor: props.custom ? colors.GREEN : colors.TEXT_COLOR_MINUS_1,
        position:"relative",
        display: "flex",
        justifyContent:"center",
        alignItems: "center",
    }
    useEffect(()=>{
        up()
    },[props.gameFlowState])
    UseFrameTime(up,20)
    function getBallPosition(){
        if(props.gameFlowState !== GameFlowState.isStarted || (!props.startBallPositionY && !props.startBallPositionX) || !props.timestamp) {
            ballPositionX = (props.visualFieldSize.width)/2 - props.ballSize/2
            if (props.player === 2)
                ballPositionX = props.visualFieldSize.width - ballPositionX - props.ballSize
            ballPositionY = (props.visualFieldSize.height)/2 - props.ballSize/2
        } else {
            ballPositionX = props.startBallPositionX + ((props.ballSpeed) * props.ballDirectionX * (Date.now() - props.timestamp)  / 1000)
            ballPositionY = props.startBallPositionY + ((props.ballSpeed) * props.ballDirectionY * (Date.now() - props.timestamp) / 1000)
        }
        let res : BallProps = {
            x: ballPositionX,
            y: ballPositionY,
        }
        return res
    }
    let res : BallProps = getBallPosition()
    // console.log("Ball(): ",props.ballDirectionX)
    return (
        <div className="game-ball" style={getBallContainerStyle(res.x,res.y) as CSSProperties}>
            <div style={style as CSSProperties}>
                {/*<div style={{border:"1px solid #000",position:"absolute",width:"100%",height:"0%"}}/>*/}
                {/*<div style={{border:"1px solid #000",position:"absolute",width:"0%",height:"100%"}}/>*/}
            </div>
        </div>
    );
}