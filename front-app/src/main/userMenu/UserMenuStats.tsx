import React, {CSSProperties, useEffect, useState} from "react";
import {MainProps} from "../Main";
import UserMenuGameHistory from "./UserMenuGameHistory";
import {colors} from "../../constants";

export default function UserMenuStats(props: MainProps) {
    const [winsLoses,setWinsLoses]  = useState([0,0])
    useEffect(()=>{
        console.log("UserMenuStats()")
        let me = props.mainProps.users.find((user)=>user.id === props.mainProps.userId)
        if(me) {
            winsLoses[0] = me.wines
            winsLoses[1] = me.loses
            setWinsLoses([...winsLoses])
        }
    },[props.mainProps.users, props.mainProps.updateMain,props.mainProps.matchHistory.size])
    const userMenuStatsWinsLosesStyle = {
        width: "100%",
        // backgroundColor: "#292929",
        display:"flex", alignItems:"center", justifyContent:"center",
        padding: "5px 0px 5px 0px",
        borderRadius:10
    }
    const winsLosesBox = {
        padding: "0px 30px 0px 30px",
        display:"flex", alignItems:"center", justifyContent:"center",flexDirection: "column",
        fontWeight:"bolder",
    }
    const winsLosesDescription = {
        color:colors.TEXT_COLOR_MINUS_1
    }
    return (
        <>
            <div className="user-menu-stats-wins-loses" style={userMenuStatsWinsLosesStyle as CSSProperties}>
                <div className="wins-box" style={winsLosesBox as CSSProperties}>
                    <div className="wins-box-description" style={winsLosesDescription}>
                        wins
                    </div>
                    <div className="wins-box-value" style={{color:colors.GREEN, fontWeight:"bold"}}>
                        {winsLoses[0]}
                    </div>
                </div>
                <div className="loses-box" style={winsLosesBox as CSSProperties}>
                    <div className="loses-box-description" style={winsLosesDescription}>
                        loses
                    </div>
                    <div className="loses-box-value" style={{color:colors.RED,fontWeight:"bold"}}>
                        {winsLoses[1]}
                    </div>
                </div>
            </div>
        </>
    )
}


