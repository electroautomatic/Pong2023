import React, {CSSProperties, useEffect, useRef, useState} from "react";
import "./ChatView.css"
import ChatWithMessages from "../../../models/ChatWithMessages";
import "./ChatViewDetails.css"
import GroupDetailsContact from "../contacts/GroupDetailsContact";
import {ChatDetailsProps} from "./ChatViewDetails";
import {colors, SERVER_URL} from "../../../constants";
import User from "../../../models/User";
import MyLabel from "../../../utils/Label";
import {appStates} from "../../../App";
import Chat from "../../../models/Chat";
import {OnNewGroupEnum} from "../Community";
enum ChatAdminSettings {
    users,
    admins,
    muted,
    banned

}

export default function ChatViewDetailsChannel(props: ChatDetailsProps) {
    let chat = props.parentProps.onChatDetails as ChatWithMessages
    const [chatAdminSettingsBtnPressed, setChatAdminSettingsBtnPressed] = useState<number>(ChatAdminSettings.users)
    const [searchLineText, setSearchLineText] = useState("")
    const [changePasswordInputText, setChangePasswordInputText] = useState("")
    const [userChosen, setUserChosen] = useState<User | undefined>()
    if(!props.parentProps.onChatDetails || typeof props.parentProps.onChatDetails === "number")
        return (<></>)
    const handleChangePassword = (chatId : number) => {
        const requestOptions = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                Authorization: 'Bearer ' + props.parentProps.mainProps.appProps.token
            },
            body: JSON.stringify({
                chatId : chatId,
                password : changePasswordInputText
            })
        };
        fetch(SERVER_URL+"chat/changePassword", requestOptions)
            .then((r)=> {
                if(r.ok) {
                    props.showAlert("Successful")
                } else {
                    throw new Error('Server unavailable');
                }
            })
            .catch(() => {
                props.showAlert("Connection lost, try later")
            });
    }
    if(userChosen) {
        switch (chatAdminSettingsBtnPressed) {
            case ChatAdminSettings.admins : {
                fetch(SERVER_URL+"chat/"+chat.chat.id+"/setadmin/"+userChosen.id,{
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                            'Accept': 'application/json',
                            Authorization: 'Bearer ' + props.parentProps.mainProps.appProps.token
                        }
                }).then((r) => {
                    if(r.ok) {
                        props.parentProps.mainProps.mainProps.webSocket?.emit("chat:requestUpdate:adminList", {
                            userId: props.parentProps.mainProps.mainProps.userId,
                            adminUserId: userChosen.id,
                            chatId: chat.chat.id
                        })
                        props.showAlert(
                            "Admin list changed"
                        )
                    } else {
                        throw new Error('Server unavailable')
                    }
                })

            .catch(() => {
                props.showAlert("Server unavailable:( Try later")
            });
                break
            }
            case ChatAdminSettings.muted : {
                fetch(SERVER_URL+"chat/"+chat.chat.id+"/setmute/"+userChosen.id,{
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        Authorization: 'Bearer ' + props.parentProps.mainProps.appProps.token
                        }
                    }).then((r) => {
                        if(r.ok) {
                            props.parentProps.mainProps.mainProps.webSocket?.emit("chat:requestUpdate:muteList", {
                                userId: props.parentProps.mainProps.mainProps.userId,
                                muteUserId: userChosen.id,
                                chatId: chat.chat.id
                            })
                            props.showAlert("Mute list changed")
                        } else {
                            throw new Error('Server unavailable')
                        }
                    })
                    .catch(() => {
                        props.showAlert("Server unavailable:( Try later")
                    });
                break
            }
            case ChatAdminSettings.banned : {
                fetch(SERVER_URL+"chat/"+chat.chat.id+"/ban/"+userChosen.id,{
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        Authorization: 'Bearer ' + props.parentProps.mainProps.appProps.token
                        }
                    }).then((r) => {
                    if(r.ok) {
                        props.parentProps.mainProps.mainProps.webSocket?.emit("chat:requestUpdate:banList", {
                            userId: props.parentProps.mainProps.mainProps.userId,
                            banUserId: userChosen.id,
                            chatId: chat.chat.id
                        })
                        props.showAlert(
                            "Ban list changed"
                        )
                    }else {
                        throw new Error('Server unavailable')
                    }
                })
                    .catch(() => {
                        props.showAlert("Server unavailable:( Try later")
                    });
                break
            }
        }
        setUserChosen(undefined)
    }
    const btnBoxStyle = {
        width: props.rightChatStyleWidth,
        height: "50px",
        alignItems: "center",
        justifyContent: "left",
        display: "flex"
    }
    const chatInfoNameStyle = {
        margin: "10px 30px 10px 30px",
        height: btnBoxStyle.height,
        alignItems: "center",
        justifyContent: "center",
        display: "flex",
        fontSize: 20,
        color: colors.TEXT_COLOR_DEFAULT,
    }
    const chatLogoStyle = {
        objectFit: "cover",
        padding: 4,
        marginTop: 20,
        display: "flex",
        height: "150px",
        width: "150px",
        backgroundColor: colors.TEXT_COLOR_DEFAULT,
        borderRadius: "50%",
    }
    const infoContentStyle = {
        overflowY: "scroll",
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column"
    }
    const infoContentBoxColumnStyle: CSSProperties = {
        margin: "5px 0px 5px 0px",
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexDirection: "column",
        width: 600,
        height: "auto",
        borderRadius: 10
    }
    const infoContentBoxColumnStyleBG: CSSProperties = {
        margin: "0px 0px 10px 0px",
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexDirection: "column",
        width: 600,
        height: "auto",
        backgroundColor: colors.BG_COLOR_24,
        borderRadius: 10
    }
    const infoContentBoxStyle: CSSProperties = {
        margin: "5px 0px 5px 0px",
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-around",
        width: 380,
        height: "auto",
        backgroundColor: colors.BG_COLOR_24,
        borderRadius: 10
    }
    const editBoxStyleColumn : CSSProperties = {
        backgroundColor: colors.BG_COLOR_24,
        paddingBottom: 5,
        marginTop: 0,
        position: 'relative',
        display: "flex",
        justifyContent: "left" ,
        flexDirection: "column",
        alignItems: "center",
        borderRadius: 10,
        width: 600,
        height: "auto"
    }
    const contactsViewStyle = {
        display: "flex",
        flexDirection: "column",
        alignSelf: "start",
        width: 330,
        height: 50,
        position: "relative",
        color: colors.TEXT_COLOR_DEFAULT,
        justifyContent: "center",
        alignItems: "center",
    }
    const passBoxStyleNormal = {
        backgroundColor: colors.BG_COLOR_222,
        width: 350,
        marginTop: 10,
        marginBottom: 10,
        display: "flex",
        alignItems: "center",
        border: "solid 1px #333",
        borderRadius:10,
        // justifyContent: "center"
    }
    let btnStyleCustomHeight = {
        margin: "0px 6px 0px 6px",
        padding: "0px 14px 0px 14px",
        height: 50,
        alignItems: "center",
        justifyContent: "center",
        display: "flex",
        fontSize: 15,
        border: "solid 1px #222222",
        color: colors.TEXT_COLOR_DEFAULT,
    }
    let btnStyleChangePassBtn = {
        marginBottom: 10,
        width: 350,
        height: 50,
        alignItems: "center",
        justifyContent: "center",
        display: "flex",
        fontSize: 15,
        borderRadius: 10,
        border: "solid 1px #333",
        color: colors.TEXT_COLOR_DEFAULT,
    }
    let btnStyleCustomHeightSelected = {
        margin: "0px 6px 0px 6px",
        padding: "0px 14px 0px 14px",
        height: 50,
        alignItems: "center",
        justifyContent: "center",
        display: "flex",
        fontSize: 15,
        color: colors.TEXT_COLOR_DEFAULT,
        border: "solid 1px #333",
        borderRadius:10
    }
    const passInputStyle = {
        width: 220,
        border: "none",
        outline: "none",
        backgroundColor: colors.BG_COLOR_222,
        borderRadius:10,
        fontSize: "16px",
        color: colors.TEXT_COLOR_DEFAULT,
        padding: "15px 5px 15px 5px",
    }
    let btnStyleCustomHeightUsers = btnStyleCustomHeight
    let btnStyleCustomHeightAdmins = btnStyleCustomHeight
    let btnStyleCustomHeightMuted = btnStyleCustomHeight
    let btnStyleCustomHeightBlocked = btnStyleCustomHeight
    let searchArray = chat?.chat.participants
    let excludingSearchArray : number[] | undefined
    let labelMsg = ""
    switch (chatAdminSettingsBtnPressed) {
        case ChatAdminSettings.admins : {
            btnStyleCustomHeightAdmins = btnStyleCustomHeightSelected
            searchArray = chat?.chat.participants
            labelMsg = "click to set / remove admin"
            break;
        }
        case ChatAdminSettings.muted : {
            btnStyleCustomHeightMuted = btnStyleCustomHeightSelected
            searchArray = chat?.chat.participants
            labelMsg = "click user to set / reset mute"
            break;
        }
        case ChatAdminSettings.banned : {
            btnStyleCustomHeightBlocked = btnStyleCustomHeightSelected
            // @ts-ignore
            searchArray  = chat?.chat ? [...new Set([...chat?.chat.blackList, ...chat?.chat.participants])] : new Set();
            labelMsg = "click to set / reset ban"
            break;
        }
        case ChatAdminSettings.users : {
            btnStyleCustomHeightUsers = btnStyleCustomHeightSelected
            searchArray = chat?.chat.participants
            labelMsg = "click to open user profile"
            break;
        }
    }
    let contacts: JSX.Element[] = []
    if (searchArray && props.parentProps.mainProps.mainProps.users !== undefined && props.parentProps.mainProps.mainProps.users.length > 0) {
        searchArray.forEach((part, index) => {
            let user = props.parentProps.mainProps.mainProps.users.find((user) => user.id === part)
            let excluding = (chatAdminSettingsBtnPressed !== ChatAdminSettings.users && excludingSearchArray?.find((id) => id === user?.id))
            if ( !excluding && user && (searchLineText === "" || user.name.startsWith(searchLineText))) {
                const groupContactProps = {
                    parentProps: props.parentProps,
                    contactsViewStyle: contactsViewStyle,
                    user: user,
                    editable: chatAdminSettingsBtnPressed !== ChatAdminSettings.users,
                    type        : chatAdminSettingsBtnPressed,
                    isOwner     : chat?.chat.owner[0] === user.id,
                    isAdmin     : chat?.chat.admins.find((id) => id === user?.id) !== undefined,
                    isBanned    : chat?.chat.blackList.find((id) => id === user?.id) !== undefined,
                    isMuted     : chat?.chat.muteList.find((id) => id === user?.id) !== undefined,
                    setUserChosen : setUserChosen,
                    showAlert : props.showAlert
            }
                contacts.push(<GroupDetailsContact {...groupContactProps} key={index}/>);
            }
        })
    }
    // console.log("ChatViewChatDetailsChannels()",props.parentProps.onChatDetails)
    return (
        <div className="info-content" style={infoContentStyle as CSSProperties}>
            <div className="info-content-logo-box" style={infoContentBoxColumnStyle as CSSProperties}>
                <img
                    alt="user/chat avatar"
                    src={props.parentProps.mainProps.mainProps.userAvatarUrl[0] + "group"}
                    className="contact-logo"
                    style={chatLogoStyle as CSSProperties}
                />
                <div className="new-group-nav-text" style={chatInfoNameStyle}>
                    {props.parentProps.onChatDetails.chat.name}
                </div>
            </div>
            {props.parentProps.onChatDetails.chat.admins.find((adminId) => adminId === props.parentProps.mainProps.mainProps.userId) &&
                <>
                    <MyLabel labelText={"admin panel"} width={600} justifyContent={"left"} margin={"10px 0px 10px 0px"}/>
                <div className="info-content-user-buttons"
                     style={infoContentBoxColumnStyleBG as CSSProperties}>
                    <div className="info-content-button-group"
                         style={infoContentBoxStyle as CSSProperties}>
                        <div className="back-btn" style={btnStyleCustomHeightUsers} onClick={() => {
                            setChatAdminSettingsBtnPressed(ChatAdminSettings.users)
                        }}>
                            user
                        </div>
                        {props.parentProps.onChatDetails.chat.owner.find((ownerId) => ownerId === props.parentProps.mainProps.mainProps.userId) &&
                            <div className="back-btn" style={btnStyleCustomHeightAdmins} onClick={() => {
                            setChatAdminSettingsBtnPressed(ChatAdminSettings.admins)
                        }}>
                            admin
                        </div>
                        }
                        <div className="back-btn" style={btnStyleCustomHeightMuted} onClick={() => {
                            setChatAdminSettingsBtnPressed(ChatAdminSettings.muted)
                        }}>
                            mute
                        </div>
                        <div className="back-btn" style={btnStyleCustomHeightBlocked} onClick={() => {
                            setChatAdminSettingsBtnPressed(ChatAdminSettings.banned)
                        }}>
                            ban
                        </div>
                    </div>
                </div>
                </>
            }
            <MyLabel labelText={labelMsg} width={600} justifyContent={"left"} margin={"10px 0px 10px 0px"}/>
            <div className="edit-box-participants" style={editBoxStyleColumn as CSSProperties}>
                <div style={passBoxStyleNormal}>
                    <input
                        type="text"
                        className="input-search-users"
                        placeholder="search"
                        style={passInputStyle}
                        onChange={(e) => {
                            setSearchLineText(e.currentTarget.value)
                        }}
                    />
                </div>
                <div style={{maxHeight:300,overflowY:"scroll"}}>
                    {contacts}
                </div>
            </div>
            {props.parentProps.onChatDetails.chat.owner.find((ownerId) => ownerId === props.parentProps.mainProps.mainProps.userId) &&
                <>
                    <MyLabel labelText={"password management"} width={600} justifyContent={"left"} margin={"15px 0px 10px 0px"}/>
                    <div className="info-content-user-buttons" style={infoContentBoxColumnStyleBG as CSSProperties}>
                        <div className="info-content-button-group" style={infoContentBoxStyle as CSSProperties}>
                            <div style={passBoxStyleNormal}>
                                <input
                                    type="password"
                                    className="change-password-input"
                                    placeholder="password"
                                    style={passInputStyle}
                                    onChange={(e) => {
                                        setChangePasswordInputText(e.currentTarget.value)
                                    }}
                                />
                            </div>
                        </div>
                        <div className="back-btn" style={btnStyleChangePassBtn} onClick={() => {
                            // @ts-ignore
                            handleChangePassword(props.parentProps.onChatDetails.chat.id)
                        }}>
                            {
                                changePasswordInputText.length > 0
                                &&
                                <>
                                    {
                                        props.parentProps.onChatDetails.chat.requestPass
                                            ?
                                            "change password"
                                            :
                                            "create password"
                                    }
                                </>
                            }
                            {
                                changePasswordInputText.length === 0
                                &&
                                <>
                                    {
                                        props.parentProps.onChatDetails.chat.requestPass
                                            ?
                                            "remove password"
                                            :
                                            "create password"
                                    }
                                </>
                            }
                        </div>
                    </div>
                </>
            }
        </div>
    )
}