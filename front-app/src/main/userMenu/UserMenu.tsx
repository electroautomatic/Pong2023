import React, {CSSProperties, Dispatch, SetStateAction, useEffect, useLayoutEffect, useRef, useState} from "react";
import UserMenuName from "./UserMenuName";
import {MainProps} from "../Main";
import UserMenuStats from "./UserMenuStats";
import {AchievementsResource, colors, GET_AVATAR_URL, SERVER_URL} from "../../constants";
import User from "../../models/User";
import MyLabel from "../../utils/Label";
import UserMenuGameHistory from "./UserMenuGameHistory";
import {appStates} from "../../App";
import Achievements from "./Achievements";

export const contactLineStyle = {
    margin: 1,
    width : 250,
    height : 1,
    backgroundColor : colors.BG_COLOR_30,
}

enum CodeStates {
    disabled,
    codeInput,
    codeIncorrect
}

export enum TfaStatus {
    disabled,
    isProgress,
    enabled
}

export default function UserMenu(props: MainProps) {
    const fileUpload = useRef(null);
    const [tfaCodeInoutFocus,setTfaCodeInoutFocus] = useState(false)
    const [winsBtnPressed,setWinsBtnPressed] = useState(false)
    const [achievementsBtnPressed,setAchievementsBtnPressed] = useState(false)
    const [qrCodeURL, setQrCodeURL]= useState<string>("");
    const [tfaStatus, setTfaStatus]= useState(props.mainProps.users.find((us)=>us.id===props.mainProps.userId)?.twoFactorEnabled? TfaStatus.enabled : TfaStatus.disabled);
    // @ts-ignore
    const [selectedImage, setSelectedImage] : [File,Dispatch<SetStateAction<File>>] = useState(null);
    const [codeState,setCodeState] = useState<number>(CodeStates.disabled)
    useLayoutEffect(() => {
        setTfaStatus(props.mainProps.users.find((us)=>us.id===props.mainProps.userId)?.twoFactorEnabled? TfaStatus.enabled : TfaStatus.disabled)
    },[props.mainProps.users])
    useLayoutEffect(()=>{
        if(tfaStatus === TfaStatus.disabled) {
            setQrCodeURL("")
        }
    },[tfaStatus])
    useLayoutEffect(() => {
        if (selectedImage) {
            let formData = new FormData()
            formData.append("file", selectedImage)
            fetch(SERVER_URL+"avatar",{
                method : "POST",
                headers : {
                    ContentType: 'multipart/form-data',
                    Authorization: 'Bearer ' + props.appProps.token
                },
                body: formData
            }).then((r) => {
                if(r.ok) {
                    props.mainProps.setUpdateMain(!props.mainProps.updateMain)
                    props.mainProps.setUserAvatarUrl([GET_AVATAR_URL,"/?hash="+Date.now().toString()])
                    props.mainProps.webSocket?.emit("user:editAvatar",{userId: props.mainProps.userId})
                }
            })
        }
    }, [selectedImage]);
    function handleClick() {
        // @ts-ignore
        fileUpload.current.click();
    }
    const userMenuStyle = {
        padding : 5,
        top : 75, right: 20,
        color : "#ddd",
        position : 'absolute', display:"flex", alignItems:"center", flexDirection:"column",
        width: 260,
        background: colors.BG_COLOR_26,
        visibility : "hidden",
        borderRadius : 10,
    }
    const userMenuRelativeBoxStyle = {
        marginTop: 10,
        position : 'relative',
        display:"flex",alignItems:"center", flexDirection:"column",
    }
    const userMenuAvatarStyle = {
        objectFit:"cover",
        border: "solid 3px #ccc",
        height: 80,
        width: 80,
        backgroundColor: "#eee",
        borderRadius: "50%"
    }
    const userMenuAvatarEditStyle = {
        border: "solid 2px #252525",
        margin: 0,
        height: 20,
        padding: 2,
        width: 20,
        position: "absolute",
        borderRadius: "50%",
        backgroundColor: colors.TEXT_COLOR_MINUS_1,
        bottom:0,
        right:0
    }
    const userMenuAvatarEditImgStyle = {
        height: 20,
        padding: 2,
        width: 20,
        position: "absolute",
        borderRadius: "50%",
        bottom:0,
        right:0
    }
    if(props.mainProps.stateUserMenu) {
        userMenuStyle.visibility = ""
    }
    const infoContentLogoBoxStyle = {
        margin: "5px 0px 5px 0px",
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection:"column",
        width : 250,
        height : "auto",
        borderRadius : 5,
        border: "solid 1px #252525"
    }
    const infoContentLogoBoxStyleBorderTFA = {
        margin: "5px 0px 5px 0px",
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection:"column",
        width : 250,
        backgroundColor : colors.BG_COLOR_26,
        borderRadius : 5,
        border: tfaCodeInoutFocus? "solid 1px #333" : "solid 1px #a53"
    }
    const infoContentLogoBoxStyleBorder = {
        margin: "5px 0px 5px 0px",
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        width: 250,
        backgroundColor: colors.BG_COLOR_26,
        borderRadius:10,
        border: "solid 1px #333"
    }
    let btnStyleCustomHeightSelected = {
        margin : 5,
        flexDirection: "column",
        position: "relative",
        padding: "0px 5px 0px 5px",
        height: 45,
        width: 240,
        alignItems: "center",
        justifyContent: "center",
        display: "flex",
        fontSize: 15,
        borderRadius:10,
        color: colors.BG_COLOR_444,
        fontWeight: "bolder",
        border: "solid 1px #333"
    }
    let btnStyleCustomHeightUnselected = {
        flexDirection: "column",
        position: "relative",
        padding: "0px 5px 0px 5px",
        height: 45,
        width: 240,
        alignItems: "center",
        justifyContent: "center",
        display: "flex",
        fontSize: 15,
        borderRadius:10,
        fontWeight: "bolder",
        color: colors.TEXT_COLOR_DEFAULT
    }
    let btnStyleCustomHeightRed= {
        padding: "0px 5px 0px 5px",
        // backgroundColor: "#222",
        height: 45,
        width: 240,
        alignItems: "center",
        justifyContent: "center",
        display: "flex",
        fontSize: 15,
        borderRadius:10,
        fontWeight: "bolder",
        // border: "solid 1px #292929",
        color: colors.RED
    }
    const handleTFAClick = () => {
        fetch(SERVER_URL+"2fa/turn",{
            method : "PUT",
            headers : {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                Authorization: 'Bearer ' + props.appProps.token
            },
        }).then(r => {
            r.json().then((data : boolean) => {
                if(data === true) {
                    setTfaStatus(TfaStatus.isProgress)
                    fetch(SERVER_URL+"2fa/generate",{
                        method : "GET",
                        headers : {
                            'Accept': 'application/json',
                            'Content-Type': 'application/json',
                            Authorization: 'Bearer ' + props.appProps.token
                        }
                    }).then((r) => {
                        if(r.ok) {
                            r.blob().then((blob)=> {
                                    blob.text().then((string) =>{
                                        setQrCodeURL(string)
                                    })
                                }
                            )
                        } else {
                            setTfaStatus(TfaStatus.disabled)
                        }
                    })
                } else {
                    if(tfaStatus === TfaStatus.disabled)
                        props.showAlert("UserMenu(): tfa disabled, fetch /turn returns \"tfa:disabled\" : cancel process")
                    setTfaStatus(TfaStatus.disabled)
                }
            })
        })
    }
    let tfaButtonText: string = "default"
    switch (tfaStatus) {
        case TfaStatus.disabled:{
            tfaButtonText = "turn on 2FA"
            break
        }
        case TfaStatus.isProgress:{
            tfaButtonText = "cancel 2FA process"
            break
        }
        case TfaStatus.enabled:{
            tfaButtonText = "turn off 2FA"
            break
        }
    }
    const codeLine = useRef(null)
    const handleCodeSend = (code : string   ) => {
        fetch(SERVER_URL+"2fa/verify",{
            method : "POST",
            headers : {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                Authorization: 'Bearer ' + props.appProps.token
            },
            body: JSON.stringify({
                code: code,
                redirect: false
            })
        }).then((r) => {
            if(r.ok) {
                setCodeState(CodeStates.disabled)
                setTfaStatus(TfaStatus.disabled)
                let u = props.mainProps.users
                let me = u.find((user)=>user.id === props.mainProps.userId)
                if(me) {
                    let index = u.indexOf(me)
                    me.twoFactorEnabled = true
                    u[index] = me
                    props.mainProps.setUsers([...u])
                    props.showAlert("2fa enabled")
                }
            } else if(r.status === 401) {
                setCodeState(CodeStates.codeIncorrect)
            }
        })

    }
    const passBoxStyleNormal = {
        // margin: "1px 1px 1px 1px",
        display:"flex",
        alignItems:"center",
        border: "solid 1px #333",
        width: "auto",
        borderRadius:10,
        justifyContent:"center"
    }
    const passBoxStyleRed = {
        // margin: "1px 1px 1px 1px",
        display:"flex",
        alignItems:"center",
        border: "solid 1px #c53",
        width: "auto",
        borderRadius:10,
        justifyContent:"center"
    }
    const passInputStyle = {
        width: 200,
        border: "none",
        outline: "none",
        backgroundColor : colors.BG_COLOR_DEFAULT,
        borderRadius:10,
        fontSize: "16px",
        color: colors.TEXT_COLOR_DEFAULT,
        padding: "5px 5px 5px 5px",
    }
    let passBoxStyle
    switch (codeState) {
        case CodeStates.disabled : {
            break
        }
        case CodeStates.codeInput : {
            passBoxStyle = passBoxStyleNormal
            // @ts-ignore
            if(codeLine.current) {
                // @ts-ignore
                codeLine.current.placeholder = "enter code"
            }
            passBoxStyle = passBoxStyleNormal
            break
        }
        case CodeStates.codeIncorrect : {
            if(codeLine.current) {
                // @ts-ignore
                codeLine.current.value = ""
                // @ts-ignore
                codeLine.current.placeholder = "incorrect code"
            }
            passBoxStyle = passBoxStyleRed
            // @ts-ignore
            break
        }
    }
    const achIds = props.mainProps.users.find((user)=>user.id === props.mainProps.userId)?.achievementsId
    return (
        <div className="user-menu" style={userMenuStyle as CSSProperties}>
            <div className="info-content-logo-box" style={infoContentLogoBoxStyle as CSSProperties}>
                <div className="user-menu-avatar-box" style={userMenuRelativeBoxStyle as CSSProperties}>
                    {props.mainProps.userId > 0 && props.mainProps.userAvatarUrl[0].length && <img className="nav-user-avatar" style={userMenuAvatarStyle as CSSProperties} src={props.mainProps.userAvatarUrl[0]+props.mainProps.userId+props.mainProps.userAvatarUrl[1]} alt="avatar"/>}
                    <div className="user-menu-avatar-edit" style={userMenuAvatarEditStyle as CSSProperties}>
                        <div className="user-menu-avatar-edit-box" style={userMenuAvatarEditImgStyle as CSSProperties} onClick={handleClick}>
                            <input
                                type="file"
                                hidden={true}
                                ref={fileUpload}
                                accept="image/jpeg image/png"
                                onChange={(e) => {
                                    if(e.target.files != null && e.target.files[0] != null)
                                        setSelectedImage(e.target.files[0])
                                }}
                            />
                            <img src="https://img.icons8.com/ios-glyphs/512/compact-camera.png" alt="edit" style={userMenuAvatarEditImgStyle as CSSProperties}/>
                        </div>
                    </div>
                </div>
                <UserMenuName {...props}/>
            </div>
            <div style={achievementsBtnPressed ? infoContentLogoBoxStyleBorder as CSSProperties : infoContentLogoBoxStyle as CSSProperties}>
                <div className="back-btn" style={btnStyleCustomHeightUnselected as CSSProperties} onClick={()=>setAchievementsBtnPressed(achievementsBtnPressed=>achievementsBtnPressed===true?false:true)}>
                    <div style={{display:"flex"}}>
                    {
                        AchievementsResource.map((ach,id)=>(
                                    <div style={{
                                        display:"flex",
                                        justifyContent:"center",
                                        alignItems:"center",
                                        height:20,
                                        width:20,
                                        fontSize: 10,
                                        borderRadius:"50%",
                                        filter:  achIds?.find((achId) => achId === id) ? "saturate(3)" : "grayscale(1)",
                                        backgroundColor: achIds?.find((achId) => achId === id) ? AchievementsResource[id].color : colors.BG_COLOR_28,
                                    }} key={id}>
                                        {AchievementsResource[id].text}
                                    </div>
                        ))
                    }
                    </div>
                </div>
                {
                    achievementsBtnPressed
                    &&
                    <Achievements mainProps={props} userId={props.mainProps.userId}/>
                }
            </div>
            <div style={winsBtnPressed ? infoContentLogoBoxStyleBorder as CSSProperties : infoContentLogoBoxStyle as CSSProperties}>
                <div className="back-btn" style={{width: "100%"}} onClick={()=>{setWinsBtnPressed(winsBtnPressed=>winsBtnPressed===true?false:true)}}>
                    <UserMenuStats {...props}/>
                </div>
                {
                    winsBtnPressed
                        &&
                    <UserMenuGameHistory mainProps={props} userId={props.mainProps.userId} matchHistory={props.mainProps.matchHistory}/>
                }
            </div>
            <div style={tfaStatus === TfaStatus.isProgress ? infoContentLogoBoxStyleBorderTFA as CSSProperties : infoContentLogoBoxStyle as CSSProperties}>
                <div className="back-btn" style={btnStyleCustomHeightUnselected as CSSProperties} onClick={handleTFAClick}>
                    {tfaButtonText}
                </div>
                {qrCodeURL !== ""
                    &&
                <div className="tfa-process" style={{marginBottom:5,width:240,padding:5,borderRadius:10,display:"flex",justifyContent:"center",alignItems:"center",flexDirection:"column"}}>
                    <div style={{marginBottom:10}}>
                        <MyLabel labelText={"scan qr code with\nGoogle Authenticator"} width={140} justifyContent={"center"} margin={"0px 0px 0px 10px"}/>
                    </div>
                    <img
                        src={qrCodeURL}
                        style={{width:120,height:120,marginBottom: 15}}
                        alt=""
                    />
                    <div className="pass-box" style={passBoxStyle}>
                        <input
                            ref={codeLine}
                            type="text"
                            className="input-code"
                            placeholder="enter code"
                            style={passInputStyle}
                            onFocus={()=> {
                                setTfaCodeInoutFocus(true)
                            }}
                            onChange={(e)=> {
                                setCodeState(CodeStates.codeInput)

                                if(e.currentTarget.value.length === 6){
                                    handleCodeSend(e.currentTarget.value)
                                }
                            }}
                        />
                    </div>
                </div>
                }
            </div>
            <div className="back-btn" style={btnStyleCustomHeightRed} onClick={() => props.appProps.setAppState(appStates.onLogout)}>
                logout
            </div>
        </div>
    )
}