import React, {CSSProperties} from "react";
import {MessageProps} from "./MessageLeft";
import {colors} from "../../../constants";

export default function MessageRight(props: MessageProps) {
    const msgBoxStyle = {
        width: props.rightChatStyle.width,
        height: "auto",
        color: colors.TEXT_COLOR_DEFAULT,
        display: "flex",
        justifyContent: "right",
        marginTop: "10px",
        marginBottom: "10px",
        alignItems: "center",
    }
    const msgLogoStyle = {
        marginLeft: "15px",
        marginRight: "15px",
        height: "50px",
        width: "50px",
        backgroundColor: colors.TEXT_COLOR_DEFAULT,
        borderRadius: "50%",
        objectFit:"cover",
        padding: 2
    }
    const msgShapeStyle =  {
        borderRadius: "15px",
        display: "flex",
        flexDirection : "column",
        backgroundColor: colors.BG_COLOR_26,
        marginTop: "5px",
        marginBottom: "5px",
        padding: "10px",
        justifyContent: "right"
    }
    const msgNameStyle = {
        fontSize: 15,
        color: "#6aa",
        display : "flex",
        justifyContent : "right"
    }
    const msgTextStyle : CSSProperties = {
        fontSize: "15px",
        fontWeight : "normal",
        position: "relative",
        justifyContent: "right",
        display: "flex",
        overflow: "hidden"
    }
    return (
        <div className="msg" style={msgBoxStyle as CSSProperties}>
            <div className="msg-box" style={{maxWidth: msgBoxStyle.width}}>
                <div className="msg-shape-left" style={msgShapeStyle as CSSProperties}>
                    <div className="msg-user-name" style={msgNameStyle}>
                        {props.userName}
                    </div>
                    <div className="msg-text" style={msgTextStyle as CSSProperties}>
                        {props.text}
                    </div>
                </div>
            </div>
            <img
                alt="msg-right"
                src={props.parentProps.mainProps.mainProps.userAvatarUrl[0]+props.userId+props.parentProps.mainProps.mainProps.userAvatarUrl[1]}
                className="msg-shape-logo" style={msgLogoStyle as CSSProperties}
            />
        </div>
    );
}
