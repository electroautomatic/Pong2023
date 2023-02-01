import React, {CSSProperties, useEffect, useState} from "react";
import {MainProps} from "../Main";
import GameObject from "../../models/GameObject";
import {AchievementsResource, colors} from "../../constants";

export interface AchProps {
    mainProps : MainProps,
    userId : number
}

export default function Achievements(props : AchProps) {
    const [achIds,setAch] = useState<number[]>([])
    useEffect(()=>{
        let user = props.mainProps.mainProps.users.find((user)=>user.id === props.userId)
        if(user){
            setAch(user.achievementsId)
        }
    },[props.mainProps.mainProps.users])
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
            <div className="ach-box" style={editBoxStyleColumn}>
                {
                    AchievementsResource.map((ach,id)=>(
                        <div style={btnStyle as CSSProperties} key={id}>
                            <div className="ach" style={{flexDirection:"column",width:"100%",display:"flex",alignItems:"center",justifyContent: "center",fontWeight:"bolder", borderRadius:10,backgroundColor:colors.BG_COLOR_28}}>
                                <div style={{
                                    display:"flex",
                                    justifyContent:"center",
                                    alignItems:"center",
                                    height:40,
                                    width:40,
                                    margin:2,
                                    borderRadius:"50%",
                                    filter:  achIds.find((achId) => achId === id) ? "saturate(3)" : "grayscale(1)",
                                    backgroundColor: achIds?.find((achId) => achId === id) ? AchievementsResource[id].color : colors.BG_COLOR_333,
                                }}>
                                    {AchievementsResource[id].text}
                                </div>
                                <div style={{
                                    color:   achIds.find((achId) => achId === id) ? colors.TEXT_COLOR_DEFAULT : colors.BG_COLOR_444,
                                    margin:2
                                }}>
                                    {AchievementsResource[id].name}
                                </div>
                                <div style={{
                                    color:   achIds.find((achId) => achId === id) ? colors.TEXT_COLOR_DEFAULT : colors.BG_COLOR_444,
                                    fontWeight: "normal",
                                    fontSize: 13,
                                    margin:2,
                                    alignItems:"center",
                                    display:"flex",
                                    justifyContent:"center"
                                }}>
                                    {AchievementsResource[id].desc}
                                </div>
                            </div>
                        </div>
                    ))
                }
            </div>
    )
}