import React, {CSSProperties, useRef, useState} from "react";
import "./NewGroup.css"
import {CommunityProps, OnNewGroupEnum} from "../Community";
import {colors, SERVER_URL} from "../../../constants";
import Contact from "../contacts/Contact";
import Chat from "../../../models/Chat";
import ChatWithMessages from "../../../models/ChatWithMessages";
enum ChatPrivacy {
    public,
    password,
    private
}

export default function NewGroup(props: CommunityProps) {
    const nameLine = useRef(null)
    const passLine = useRef(null)
    const [chatPrivacy,setChatPrivacy] = useState<number>(ChatPrivacy.public)
    const [nameEmpty,setNameEmpty] = useState<boolean>(false)
    const [passEmpty,setPassEmpty] = useState<boolean>(false)
    let participants = new Set<number>();
    participants.add(props.mainProps.mainProps.userId)
    function handleGroupCreate() {
        let password = ""
        // @ts-ignore
        if(!nameLine.current || nameLine.current.value === "") {
            setNameEmpty(true)
            return
        }
        // @ts-ignore
        if( chatPrivacy=== ChatPrivacy.password && (!passLine || !passLine.current || passLine.current.value === "")) {
            setPassEmpty(true)
            return
        }
        // @ts-ignore
        const chatName = nameLine.current.value
        if(chatPrivacy === ChatPrivacy.password) {
            // @ts-ignore
            password = passLine.current.value
        }
        const array = Array.from(participants);
        console.log("CreateGroup() "+ array)
        const requestOptions = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                Authorization: 'Bearer ' + props.mainProps.appProps.token
            },
            body: JSON.stringify({
                name: chatName,
                chat : false,
                public : (chatPrivacy !== ChatPrivacy.private),
                password : password,
                participants : array
            })
        };
        console.log("fetch POST /chat/create")
        fetch(SERVER_URL+"chat/create", requestOptions)
            .then((r)=> {
                if(r.ok) {
                    r.json().then((chatResponse : Chat) => {
                        props.chatList.addChatWithoutMessages(chatResponse)
                        props.setChatListUpdate(chatListUpdate => chatListUpdate === true ? false : true )
                        props.setOnChatId(chatResponse.id)
                        props.setOnNewGroup(OnNewGroupEnum.groupCreated)
                        if (props.mainProps.mainProps.webSocket)
                            props.mainProps.mainProps.webSocket.emit('chat:requestUpdate:participants', {chatId: chatResponse.id})
                    })
                } else {
                    throw new Error('Server unavailable');
                }
            })
            .catch(() => {
                props.showAlert("Chat create: connection lost, please try later")
                props.setOnNewGroup(OnNewGroupEnum.groupCreated)
                props.setOnChatId(0)
            });
    }
    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        // @ts-ignore
        if (e.key === "Enter") {
            handleGroupCreate()
        }
    };
    let btnStyleCustomHeightSelected = {
        margin : "0px 7px 0px 7px",
        padding: "0px 25px 0px 25px",
        height: 45,
        alignItems: "center",
        justifyContent: "center",
        display: "flex",
        fontSize: 15,
        color: colors.TEXT_COLOR_DEFAULT,
        border: "solid 1px #333",
        borderRadius:10
    }
    let btnStyleCustomHeight = {
        margin : "0px 7px 0px 7px",
        padding: "0px 25px 0px 25px",
        height: 45,
        alignItems: "center",
        justifyContent: "center",
        display: "flex",
        fontSize: 15,
        border: "solid 1px #222222",
        color: colors.TEXT_COLOR_DEFAULT,
    }
    const passBoxStyleNormal = {
        marginTop:10,
        display:"flex",
        alignItems:"center",
        border: "solid 1px #333",
        borderRadius:10,
        justifyContent:"center"
    }
    const passBoxStyleRed = {
        marginTop:10,
        display:"flex",
        alignItems:"center",
        border: "solid 1px #c53",
        borderRadius:10,
        justifyContent:"center"
    }
    const nameInputStyleNormal = {
        width: 250,
        outline: "none",
        border: "solid 1px #333",
        backgroundColor: colors.BG_COLOR_222,
        borderRadius:10,
        fontSize: "16px",
        color: colors.TEXT_COLOR_DEFAULT,
        marginLeft: 10,
        padding: "15px 5px 15px 5px",
    }
    const nameInputStyleRed = {
        width: 250,
        outline: "none",
        border: "solid 1px #c53",
        backgroundColor: colors.BG_COLOR_222,
        borderRadius:10,
        fontSize: "16px",
        color: colors.TEXT_COLOR_DEFAULT,
        marginLeft: 10,
        padding: "15px 5px 15px 5px",
    }
    let passBoxStyle = passBoxStyleNormal
    let nameInputStyle = nameInputStyleNormal
    let btnStyleCustomHeightPublic = btnStyleCustomHeight
    let btnStyleCustomHeightPrivate = btnStyleCustomHeight
    let btnStyleCustomHeightPassword = btnStyleCustomHeight
    switch (chatPrivacy) {
        case ChatPrivacy.public : {
            btnStyleCustomHeightPublic = btnStyleCustomHeightSelected
            break;
        }
        case ChatPrivacy.password : {
            btnStyleCustomHeightPassword = btnStyleCustomHeightSelected
            break;
        }
        case ChatPrivacy.private : {
            btnStyleCustomHeightPrivate = btnStyleCustomHeightSelected
            break;
        }
    }
    if(nameEmpty){
        nameInputStyle = nameInputStyleRed
    }
    if(passEmpty){
        passBoxStyle = passBoxStyleRed
    }
    const userMenuRelativeBoxStyle = {
        paddingRight: 5,
        position : 'relative',
        display:"flex",
        alignItems:"center",
        flexDirection:"column",
    }
    const groupAvatarStyle = {
        border : "solid 3px #ccc",
        objectFit:"cover",
        height: 70,
        width: 70,
        backgroundColor: "#eee",
        borderRadius: "50%"
    }
    const rightChatStyle = {
        marginTop:5,
        backgroundColor: colors.BG_COLOR_222,
        width: window.innerWidth / 4 * 3 - 10,
        display: "flex",
        flexDirection: "column",
        height: props.page.height - 5,
        alignSelf: "top",
        fontWeight: "bolder",
        alignItems:"center",
        borderRadius: 10
    }
    const editBoxStyle = {
        backgroundColor : colors.BG_COLOR_24,
        padding: 10,
        marginTop: 15,
        position : 'relative',
        display:"flex",
        alignItems:"center",
        justifyContent : "center",
        borderRadius: 10,
        width: 600,

    }
    const editBoxStyleColumn = {
        backgroundColor : colors.BG_COLOR_24,
        padding: 10,
        marginTop: 15,
        position : 'relative',
        display:"flex",
        justifyContent: "center",
        flexDirection: "column",
        alignItems:"center",
        borderRadius: 10,
        width: 600,
        height: "auto"
    }
    const btnBoxStyle = {
        borderRadius:10,
        width:"100%",
        // backgroundColor: BG_COLOR_DEFAULT,
        alignItems: "center",
        justifyContent: "space-between",
        display: "flex",
        height: 50,
        position: "relative",
    }
    const btnStyle = {
        padding: "0px 30px 0px 30px",
        height: btnBoxStyle.height,
        alignItems: "center",
        justifyContent: "center",
        display: "flex",
        fontSize: 15,
        color: colors.TEXT_COLOR_DEFAULT,
    }
    const inputBoxStyle = {
        height: "50px",
        alignItems: "center",
        justifyContent: "center",
        display: "flex"
    }
    const passInputStyle = {
        width: 310,
        border: "none",
        outline: "none",
        backgroundColor : colors.BG_COLOR_222,
        borderRadius:10,
        fontSize: "16px",
        color: colors.TEXT_COLOR_DEFAULT,
        padding: "15px 5px 15px 5px",
    }
    const passBtnBoxStyle = {
        alignItems: "center",
        justifyContent: "space-between",
        display: "flex"
    }
    const contactsViewStyle = {
        display: "flex",
        flexDirection: "column",
        alignSelf: "start",
        width: 350,
        height: 50,
        position: "relative",
        color: colors.TEXT_COLOR_DEFAULT,
        justifyContent: "center",
        alignItems: "center",
    }
    let contacts: JSX.Element[] = []
    if (props.mainProps.mainProps.users !== undefined && props.mainProps.mainProps.users.length > 0) {
        props.mainProps.mainProps.users.forEach((user,index) => {
            const chat = new Chat("")
            chat.name  = user.name
            chat.id    = user.id
            const contactProps = {
                parentProps: props,
                contactsViewStyle: contactsViewStyle,
                chat : new ChatWithMessages(chat,index,[]),
                user : user,
                isUserProfile : true,
                participants : participants,
                isHighlighted : user.id === props.mainProps.mainProps.userId,
                isForChannelDetails : true
            }
            contacts.push(<Contact {...contactProps} key={user.id}/>);
        })
    }
    return (
        <div className="new-group-window" style={rightChatStyle as CSSProperties}>
            <div className="button-box" style={btnBoxStyle as CSSProperties}>
                <div className="back-btn" style={btnStyle} onClick={()=> {
                    props.setOnNewGroup(0)
                }}>
                    back
                </div>
                <div className="new-group-nav-text" style={btnStyle}>
                    new group
                </div>
                <div className="create-btn" style={btnStyle} onClick={handleGroupCreate}>
                    create
                </div>
            </div>
            {/*<div className="bottom-line" style={bottomLineStyle}/>*/}
            <div className="edit-box-name" style={editBoxStyle as CSSProperties}>
                <div className="user-menu-avatar-box" style={userMenuRelativeBoxStyle as CSSProperties}>
                    <img src={props.mainProps.mainProps.userAvatarUrl[0] + "group"}
                         alt="group-avatar"
                         style={groupAvatarStyle as CSSProperties}/>
                </div>
                <div className="input-box" style={inputBoxStyle}>
                    <input
                        autoFocus
                        ref={nameLine}
                        type="text"
                        className="input-new-group"
                        placeholder="group name"
                        style={nameInputStyle}
                        onKeyPress={(e) => {
                            handleKeyPress(e)
                        }}
                        onChange={()=>setNameEmpty(false)}
                    />
                </div>
            </div>
            <div className="edit-box-privacy" style={editBoxStyleColumn as CSSProperties}>
                <div style={passBtnBoxStyle as CSSProperties}>
                    <div className="back-btn" style={btnStyleCustomHeightPublic} onClick={()=>{setChatPrivacy(ChatPrivacy.public)}}>
                        public
                    </div>
                    <div className="back-btn" style={btnStyleCustomHeightPrivate} onClick={()=>{setChatPrivacy(ChatPrivacy.private)}}>
                        private
                    </div>
                    <div className="back-btn" style={btnStyleCustomHeightPassword} onClick={()=>{setChatPrivacy(ChatPrivacy.password)}}>
                        password
                    </div>
                </div>
                {
                    chatPrivacy === ChatPrivacy.password &&
                    <div style={passBoxStyle}>
                        <form>
                            <input
                                autoComplete="new-password"
                                ref={passLine}
                                type="password"
                                className="input-new-group"
                                placeholder="password"
                                style={passInputStyle}
                                onChange={()=>setPassEmpty(false)}
                                onKeyPress={(e) => {
                                    handleKeyPress(e)
                                }}
                            />
                        </form>
                        <div style={{margin:"5px 10px 5px 0px"}} onClick={()=>{
                            // @ts-ignore
                            passLine.current.type === "text" ? passLine.current.type = "password" : passLine.current.type = "text"}
                        }>👀</div>
                    </div>
                }
            </div>
            <div className="edit-box-participants" style={editBoxStyleColumn as CSSProperties}>
                {contacts}
            </div>
        </div>
    );
}