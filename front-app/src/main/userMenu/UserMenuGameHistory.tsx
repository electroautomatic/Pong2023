import React, {CSSProperties, useEffect, useState} from "react";
import {MainProps} from "../Main";
import GameObject from "../../models/GameObject";
import {colors} from "../../constants";

export interface MatchHistoryProps {
    mainProps : MainProps
    userId : number
    matchHistory : Map<number,GameObject>
}

export default function UserMenuGameHistory(props: MatchHistoryProps) {
    const [history,setHistory] = useState<GameObject[]>([])
    useEffect(()=>{
        console.log("UserMenuGameHistory()")
        let arr = Array.from(props.matchHistory,([key,value])=>(value))
        arr.forEach((game)=>{
            let player1id = game.player1id
            let player2id = game.player2id
            let score1= game.score1
            let score2 = game.score2
            if(player1id !== props.userId) {
                game.player1id = player2id
                game.player2id = player1id
                game.score1 = score2
                game.score2 = score1
            }
        })
        arr.sort((a,b)=> {
            return a.id<b.id?1:-1
        })
        setHistory(arr)
    },[props.matchHistory.size, props.mainProps.mainProps.updateMain, props.userId])
    const editBoxStyleColumn : CSSProperties = {
        // backgroundColor: BG_COLOR_24,
        position: 'relative',
        display: "flex",
        flexDirection: "column",
        borderRadius:10,
        height: 200,
        overflowY: "scroll",
    }
    const msgLogoStyle = {
        margin: 5,
        marginLeft: 20,
        height: 30,
        width: 30,
        backgroundColor: colors.TEXT_COLOR_DEFAULT,
        borderRadius: "50%",
        objectFit:"cover",
        padding: 2
    }
    const btnStyle : CSSProperties = {
        display: "flex",
        fontSize: 14,
        color: colors.TEXT_COLOR_DEFAULT,
        position: "relative",
        margin: "2px 0px 2px 0px",
        width: 240,
        height: 50,
        borderRadius:10
    }
    const btnStyleGrey : CSSProperties = {
        padding: "0px 30px 0px 30px",
        height: 50,
        alignItems: "center",
        justifyContent: "space-around",
        display: "flex",
        fontSize: 15,
        color: colors.BG_COLOR_444,
    }
    return (
        props.matchHistory.size
        ?
            <div className="match-history-box" style={editBoxStyleColumn}>
                {
                    history.map((game,index) => (
                        <div style={btnStyle as CSSProperties} key={index}>
                            <div className="left" style={{width:"100%",display:"flex",alignItems:"center",justifyContent: "left",fontWeight:"bolder"}}>
                                    <img
                                        alt="player-avatar"
                                        src={props.mainProps.mainProps.userAvatarUrl[0] + game.player2id + props.mainProps.mainProps.userAvatarUrl[1]}
                                        style={msgLogoStyle as CSSProperties}
                                    />
                                    {
                                        <div style={{overflowX:"hidden",marginLeft:5,width:88}}>
                                            {props.mainProps.mainProps.users.find((user) => user.id === game.player2id)?.name}
                                        </div>
                                    }
                                    {
                                        <div style={{overflowX:"hidden",width:10,display:"flex",justifyContent:"center", color : game.score2 > game.score1 ? colors.RED : colors.GREEN}}>
                                            {game.score1}
                                        </div>
                                    }
                                    {
                                        <div style={{
                                            overflowX:"hidden",
                                            width:10,
                                            display:"flex",
                                            justifyContent:"center",
                                            color : game.score2 > game.score1 ? colors.RED : colors.GREEN
                                        }}>
                                            :
                                        </div>
                                    }
                                    {
                                        <div style={{overflowX:"hidden",width:10,display:"flex",justifyContent:"center", color : game.score2 > game.score1 ? colors.RED : colors.GREEN}}>
                                            {game.score2}
                                        </div>
                                    }
                            </div>
                        </div>
                    ))
                }
            </div>
        :
            <>
                <div style={btnStyleGrey as CSSProperties}>
                    <div style={{overflowX:"hidden",display:"flex",justifyContent:"center",alignItems:"center"}}>
                        no matches yet
                    </div>
                </div>
            </>
    )
}