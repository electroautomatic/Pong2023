import React, {CSSProperties} from "react";
import {CommunityProps} from "../Community";
import {colors} from "../../../constants";

export type MessageProps =  {
        parentProps : CommunityProps,
        userName : string;
        userId : number;
        text: string;
        rightChatStyle: {
            width: number;
            display: string;
            flexDirection: string;
            height: any;
            alignSelf: string;
            fontWeight: string;
        };
}


export default function MessageLeft(props: MessageProps) {
    const msgBoxStyle = {
        width: props.rightChatStyle.width,
        color: colors.TEXT_COLOR_DEFAULT,
        display: "flex",
        justifyContent: "left",
        marginTop: "10px",
        height: "auto",
        marginBottom: "10px",
        alignItems: "center",
    }
    const msgLogoStyle = {
        marginLeft: "10px",
        marginRight: "10px",
        height: "50px",
        width: "50px",
        backgroundColor: colors.TEXT_COLOR_DEFAULT,
        borderRadius: "50%",
        objectFit:"cover",
        padding: 2
    }
    const msgLogoStyleFriend = {
        objectFit:"cover",
        marginLeft: "10px",
        marginRight: "10px",
        height: "50px",
        width: "50px",
        backgroundColor: colors.TEXT_COLOR_DEFAULT,
        borderRadius: "50%",
        border: "solid 2px #4a8"
    }
    const msgNameStyle = {
        fontSize: 15,
        color: "#6ac",
        display : "flex",
        justifyContent : "left"
    }
    const msgTextStyle = {
        fontSize: "15px",
        fontWeight : "normal",
        position: "relative",
        justifyContent: "left",
        display: "flex",
        overflow: "hidden"
    }
    const msgShapeStyle : CSSProperties = {
        borderRadius: "15px",
        display: "flex",
        flexDirection : "column",
        backgroundColor: colors.BG_COLOR_26,
        marginTop: "5px",
        marginBottom: "5px",
        padding: "10px",
        justifyContent: "left"
    }
    function handleUserDetails() {
        props.parentProps.setOnChatDetails(props.userId)
        console.log("details " + props.userId)
        console.log("MessageLeft(): press onChatDetails: " + props.parentProps.onChatDetails)
    }
    return (
        <div className="msg" style={msgBoxStyle}>
            <img
                alt="msg"
                src={props.parentProps.mainProps.mainProps.userAvatarUrl[0]+props.userId+props.parentProps.mainProps.mainProps.userAvatarUrl[1]}
                className="msg-shape-logo" style={(props.parentProps.mainProps.mainProps.users.find((user) => user.id === props.userId)?.isFriend)
            ?
            msgLogoStyleFriend as CSSProperties
            :
            msgLogoStyle as CSSProperties} onClick={handleUserDetails}/>
            <div className="msg-box">
                <div className="msg-shape-left" style={msgShapeStyle as CSSProperties}>
                    <div className="msg-user-name" style={msgNameStyle} onClick={handleUserDetails}>
                        {props.userName}
                    </div>
                    <div className="msg-text" style={msgTextStyle as CSSProperties}>
                        {props.text}
                    </div>
                </div>
            </div>
        </div>
    );
}
