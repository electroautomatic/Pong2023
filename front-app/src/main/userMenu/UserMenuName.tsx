import React, {CSSProperties, Dispatch, SetStateAction, useState} from "react";
import "./UserMenuName.css"
import {MainProps} from "../Main";
import {colors} from "../../constants";

export default function UserMenuName(props: MainProps) {
    const userMenuNameBox = {
        position : 'relative',
        display:"flex",
        alignItems:"center",
        marginTop: 5,
        marginBottom: 5,
        border: "1px solid #2b2b2b",
        borderRadius:10
    }
    const textNameStyle = {
        height : 25,
        fontSize : 20,
        color : colors.TEXT_COLOR_DEFAULT,
        padding: "5px 15px 5px 15px",
        display: "flex",
        justifyContent: "center",
        fontWeight: "bolder",
        outline: "none",
        border: "none",
    }
    const handleKeyPress = (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (e.key === "Enter") {
            handleNameEdit(e.currentTarget.innerText)
        }
    };
    function handleNameEdit(newName: string){
        props.mainProps.webSocket?.emit("messages:editName",{userId: props.mainProps.userId,newUserName: newName})
    }
    return (
        <div className="user-menu-name-box" style={userMenuNameBox as CSSProperties}>
             <div className="user-menu-name-editable" onKeyPress={(e) => handleKeyPress(e)} contentEditable="true" suppressContentEditableWarning={true} style={textNameStyle} onBlur={e => handleNameEdit(e.currentTarget.innerText)}>
                 {props.mainProps.userName}
             </div>
        </div>
    )
}