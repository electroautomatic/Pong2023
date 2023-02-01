import React, {CSSProperties, Dispatch, SetStateAction, useEffect, useState} from "react";
import "./Contact.css"
import {CommunityProps} from "../Community";
import User from "../../../models/User";
import ChatWithMessages from "../../../models/ChatWithMessages";
import {colors} from "../../../constants";

interface GroupContactDetailsProps {
        parentProps : CommunityProps,
        contactsViewStyle: {
            display: string;
            flexDirection: string;
            alignSelf: string;
            width: number;
            height: any;
            position: string;
            color: string;
            justifyContent: string;
            alignItems: string;
        };
        user: User,
        editable: boolean,
        isOwner: boolean,
        isAdmin : boolean,
        isBanned : boolean,
        isMuted: boolean,
        type : number,
        setUserChosen : Dispatch<SetStateAction<User | undefined>>
        showAlert : Dispatch<SetStateAction<string>>
}

export default function GroupDetailsContact(props: GroupContactDetailsProps) {
    const getPrivilege = () =>{
        if(props.isOwner) {
            return "owner"
        }
        if(props.isAdmin) {
            return "admin"
        }
        if(props.isBanned) {
            return "banned"
        }
        if(props.isMuted) {
            return "muted"
        }
        return ""
    }
    const [isHighlighted, setIsHighlighted] = useState<boolean>(false)
    useEffect(()=>{
        return () => {
            if(props.user.id !== props.parentProps.mainProps.mainProps.userId)
                setIsHighlighted(false)
        }
    },[props])
    const contactBoxStyleHighlighted = {
        border: "solid 1px #333",
        backgroundColor: colors.BG_COLOR_222,
        borderRadius:10,
        width: 350,
        position: "relative",
        flexDirection: "column",
        display: "flex",
    }
    const contactBoxStyleNormal : CSSProperties = {
        border: "solid 1px #222222",
        borderRadius:10,
        width: 350,
        position: "relative",
        display: "flex",
    }
    let contactBoxStyle = isHighlighted ? contactBoxStyleHighlighted : contactBoxStyleNormal
    const contactLogoStyleFriend = {
        objectFit:"cover",
        margin: "10px",
        height: "50px",
        width: "50px",
        backgroundColor: colors.TEXT_COLOR_DEFAULT,
        borderRadius: "50%",
        border: "solid 3px #4a8"
    }
    const contactLogoStyle = {
        objectFit:"cover",
        padding: 3,
        margin: "10px",
        height: "50px",
        width: "50px",
        backgroundColor: colors.TEXT_COLOR_DEFAULT,
        borderRadius: "50%",
    }
    const contactNameStyle = {
        paddingLeft : "10px",
        color: colors.TEXT_COLOR_DEFAULT,
        fontSize: "16px",
        marginTop : "25px",
        fontWeight:"bolder"
    }
    const contactNameStyleAbsolute : CSSProperties = {
        position: "absolute",
        right: 15,
        top:10,
        color: "#999",
        fontSize: 13,
        fontWeight: "normal"
    }
    const userMenuRelativeBoxStyle = {
        position : 'relative',
        justifyContent:"center",
        display:"flex",alignItems:"center", flexDirection:"column",
    }
    if(props.parentProps.onChatDetails && typeof  props.parentProps.onChatDetails !== "number") {
        let chat = props.parentProps.chatList.getChat(props.parentProps.onChatDetails.chat.id)
        return (
            <div className="contact-box" style={contactBoxStyle as CSSProperties} onClick={() => {
                if (props.editable) {
                    if (props.user.id === props.parentProps.mainProps.mainProps.userId) {
                        props.showAlert("Noo, its you")
                    } else if (props.isOwner) {
                        props.showAlert("Noo, he is owner")
                    } else if (props.isAdmin && (props.type !== 1 || !chat?.chat.owner.find((owner) => owner === props.parentProps.mainProps.mainProps.userId))) {
                        props.showAlert("Noo, he is admin")
                    } else {
                        props.setUserChosen(props.user)
                    }
                } else {
                    props.parentProps.setOnChatDetails(props.user.id)
                }
            }}>
                <div className="user-menu-avatar-box" style={userMenuRelativeBoxStyle as CSSProperties}>
                    <img
                        src={props.parentProps.mainProps.mainProps.userAvatarUrl[0] + props.user.id + props.parentProps.mainProps.mainProps.userAvatarUrl[1]}
                        className="contact-logo"
                        alt="user avatar"
                        style={((props.parentProps.mainProps.mainProps.users.find((user) => user.id === props.user.id)?.isFriend))
                            ?
                            contactLogoStyleFriend as CSSProperties
                            :
                            contactLogoStyle as CSSProperties
                        }
                    />
                </div>
                <div className="contact-name" style={contactNameStyle}>
                    {props.user.name}
                </div>
                <div className="contact-name" style={contactNameStyleAbsolute}>
                    {getPrivilege()}
                </div>
            </div>
        );
    } else {
        return <></>
    }
}
