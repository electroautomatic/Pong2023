import "./Nav.css"
import React, {CSSProperties, useEffect} from "react";
import {MainProps} from "./Main";
import {appStates} from "../App";
import {colors} from "../constants";


export default function Nav(props: MainProps) {
    useEffect(()=>{},[props.mainProps.navBadgeCommunity,props.mainProps.navBadgePlay,props.mainProps.matchHistory])
    const badgeStyleRedPlay : CSSProperties = {
        backgroundColor: colors.RED,
        height: 10,width:10,
        borderRadius:"50%",
        position: "absolute",
        top: 15,
        right: 42
    }
    const badgeStyleRedComm : CSSProperties = {
        backgroundColor: colors.RED,
        height: 10,width:10,
        borderRadius:"50%",
        position: "absolute",
        top: 15,
        right: 15
    }
    return (
        <>
            <nav className="nav" onClick={()=>{
                if(props.mainProps.stateUserMenu) {
                    props.mainProps.onStateUserMenuChange(false)
                }
            }}>
                <div className="nav-logo-box">
                    <div className="nav-logo">
                    </div>
                    <h2 className="nav-logo-text"> Pong </h2>
                </div>
                <div className="nav-btn" onClick={() => {
                    props.mainProps.onStateUserMenuChange(false)
                }}>
                        <button className="nav-btn-play" onClick={() => {
                            props.appProps.setAppState(appStates.onGame)
                            props.mainProps.setNavBadgePlay(false)
                            console.log("push history play")
                            window.history.pushState({
                                appState : appStates.onGame
                            }, "",);
                        }}>
                            {props.mainProps.navBadgePlay &&  <div className="badge" style={badgeStyleRedPlay}/>}
                            play
                        </button>
                        <button className="nav-btn-comm" onClick={() => {
                            props.appProps.setAppState(appStates.onCommunity)
                            props.mainProps.setNavBadgeCommunity(false)
                        }}>
                            {props.mainProps.navBadgeCommunity &&  <div className="badge" style={badgeStyleRedComm}/>}
                            community
                        </button>
                </div>
                <div className="nav-user-box" onClick={()=>{
                    props.mainProps.stateUserMenu ? props.mainProps.onStateUserMenuChange(false) : props.mainProps.onStateUserMenuChange(true)
                }}>
                    <h2 className="nav-user-name"> {props.mainProps.userName} </h2>
                    {props.mainProps.userId > 0 && props.mainProps.userAvatarUrl[0].length && <img className="nav-user-avatar" src={props.mainProps.userAvatarUrl[0]+props.mainProps.userId+props.mainProps.userAvatarUrl[1]} alt="avatar"/>}
                </div>
            </nav>
        </>
    );
}
