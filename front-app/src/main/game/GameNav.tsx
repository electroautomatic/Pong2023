import React, {CSSProperties, Dispatch, SetStateAction, useEffect} from "react";
import CustomLoader, {CustomAnimations} from "../../utils/CustomLoader";
import {GameFlowState, GameState, PairedUsers} from "./Game";
import {MainProps} from "../Main";
import {colors} from "../../constants";

interface GameNavProps {
    player: number;
    leftPlayerScore: number;
    rightPlayerScore: number,
    leftPlayerName : string ,
    rightPlayerName : string,
    leftPlayerId : number ,
    rightPlayerId : number,
    gameNavHeight: number
    // game : PairedUsers | undefined,
    props : MainProps,
    visualFieldWidth : number,
    gameState : GameState,
    setGameState : Dispatch<SetStateAction<GameState>>
}
export default function GameNav(props: GameNavProps) {
    let scoreLeft : number = 0
    let scoreRight : number = 0
    let nameLeft
    let nameRight
    const infoContentBoxStyleSpace : CSSProperties = {
        margin: "15px 0px 15px 0px",
        backgroundColor : colors.BG_COLOR_26,
        display: "flex",
        alignItems: "center",
        justifyContent:"space-between",
        width : props.visualFieldWidth,
        height : 70,
        borderRadius : 10
    }
    if(props.leftPlayerName && props.rightPlayerName) {
        if (props.player === 1) {
            nameLeft = props.leftPlayerName
            nameRight = props.rightPlayerName
            scoreLeft = props.leftPlayerScore;
            scoreRight = props.rightPlayerScore
        } else {
            nameRight = props.leftPlayerName
            nameLeft = props.rightPlayerName
            scoreLeft = props.rightPlayerScore
            scoreRight = props.leftPlayerScore
        }
    }
    const msgLogoStyleLeft = {
        // alignSelf: "left",
        margin : "5px",
        marginLeft : 20,
        height: "40px",
        width: "40px",
        backgroundColor: colors.TEXT_COLOR_DEFAULT,
        borderRadius: "50%",
        objectFit:"cover",
        padding: 2
    }
    const msgLogoStyleRight = {
        // alignSelf:"right",
        margin : "5px",
        marginRight : 20,
        height: "40px",
        width: "40px",
        backgroundColor: colors.TEXT_COLOR_DEFAULT,
        borderRadius: "50%",
        objectFit:"cover",
        padding: 2
    }
    const btnStyle = {
        fontWeight:"bolder",
        margin: "0px 10px 0px 10px",
        alignItems: "center",
        justifyContent: "center",
        display: "flex",
        fontSize: 20,
        color: colors.TEXT_COLOR_MINUS_1,
    }
    return (

        <div className="game-nav" style={{
            height: props.gameNavHeight,
            width: "100%",
            position: "relative",
            display: "flex",
            justifyContent:"center",
            alignContent: "center"
        }}>
                <div className="info-content-user-buttons" style={infoContentBoxStyleSpace as CSSProperties}>
                        <div style={{display:"flex",justifyContent:"center",alignItems:"center"}}>
                            {
                                props.leftPlayerId && props.rightPlayerId
                                &&
                                <>
                                    <img
                                        alt="player1-avatar"
                                        src={props.props.mainProps.userAvatarUrl[0]+props.leftPlayerId+props.props.mainProps.userAvatarUrl[1]}
                                        style={msgLogoStyleLeft as CSSProperties}
                                    />
                                    <div style={btnStyle as CSSProperties}>
                                        {nameLeft}
                                    </div>
                                </>
                            }
                        </div>
                        <div style={{display:"flex",justifyContent:"center",alignItems:"center"}}>
                            {
                                props.leftPlayerId && props.rightPlayerId
                                ?
                                    <div style={btnStyle as CSSProperties}>
                                        {scoreLeft === undefined ? 0 : scoreLeft} : {scoreRight === undefined ? 0 : scoreRight}
                                    </div>
                                :
                                    <div style={btnStyle as CSSProperties}>
                                        game finished
                                    </div>
                            }
                        </div>
                        <div style={{display:"flex",justifyContent:"center",alignItems:"center"}}>
                        {
                            props.leftPlayerId && props.rightPlayerId
                            &&
                            <>
                                <div style={btnStyle as CSSProperties}>
                                    {nameRight}
                                </div>
                                <img
                                    alt="player2-avatar"
                                    src={props.props.mainProps.userAvatarUrl[0]+props.rightPlayerId+props.props.mainProps.userAvatarUrl[1]}
                                    style={msgLogoStyleRight as CSSProperties}/>
                            </>
                        }
                        </div>
                </div>
        </div>
    );
}