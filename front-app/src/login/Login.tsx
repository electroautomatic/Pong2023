import React, {useEffect, useRef, useState} from "react";
import './Login.css';
import {AppProps, appStates} from "../App";
import CustomLoader, {CustomAnimations} from "../utils/CustomLoader";
import {SERVER_URL} from "../constants";

enum CodeStates {
    disabled,
    codeInput,
    codeIncorrect
}

export default function Login(props: AppProps) {
    const [loader,setLoader] = useState(false)
    const [tfaCodeInoutFocus,setTfaCodeInoutFocus] = useState(false)
    const [codeState,setCodeState] = useState<number>(CodeStates.disabled)
    const codeLine = useRef(null)
    // console.log("onLogin() : loader: "+loader)
    async function getIntraUserCode()  {
        setLoader(true)
        window.location.assign('https://api.intra.42.fr/oauth/authorize?client_id=u-s4t2ud-3886109fb27f0c62d22d00bc88475d573436465c61c3157c08e78abfa6d1e2f4&redirect_uri=http%3A%2F%2Flocalhost%3A3001%2Flogin%2Fauth&response_type=code');
    }
    async function handleTfaVerify(code: string)  {
        setLoader(true)
        fetch(SERVER_URL+"2fa/verifyCheck",{
            credentials: "include",
            method : "POST",
            headers : {
                'Accept'                        : 'application/json',
                'Content-Type'                  : 'application/json',
            },
            body: JSON.stringify({
                code: code,
                userid: props.tfaQuery
            })
        })
            .then((r) => {
            if(r.ok) {
                setLoader(false)
            } else if(r.status === 401) {
                setCodeState(CodeStates.codeIncorrect)
                setLoader(false)
            } else {
                throw new Error('Server unavailable')
            }
        })
            .catch((err) => {
                props.setAppState(appStates.onDisconnect)
                // props.showAlert("Server unavailable:(")
            });
    }
    const passBoxStyleNormal = {
        margin:5,
        display:"flex",
        alignItems:"center",
        border: "solid 1px #333",
        width: "auto",
        height: "auto",
        borderRadius:10,
        justifyContent:"center"
    }
    const passBoxStyleRed = {
        margin:5,
        display:"flex",
        alignItems:"center",
        border: "solid 1px #c53",
        width: "auto",
        height: "auto",
        borderRadius:10,
        justifyContent:"center"
    }
    const passInputStyle = {
        // width: "auto",
        // height: "auto",
        border: "none",
        outline: "none",
        backgroundColor : "#202020",
        borderRadius:10,
        fontSize: "15px",
        color: "#ccc",
        padding: 10,
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
                codeLine.current.placeholder = "code from Google Auth"
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
    return (
            <div className="login">
                {
                    props.appState === appStates.onLogin &&
                    <button className="login-btn" onClick={getIntraUserCode}>
                        {
                          !loader
                              ?
                              "Log in with 42"
                              :
                                <CustomLoader widthBall={20} heightBall={20} left={0} animation={CustomAnimations.rotate_tr} loopTimeInSeconds={1}/>
                        }
                    </button>
                }
                {
                    props.appState === appStates.onLoginTFA &&
                    <div className="login-2fa-box">
                        {
                            !loader
                                &&
                                <div className="pass-box" style={passBoxStyle}>
                                    <input
                                        autoFocus
                                        ref={codeLine}
                                        type="text"
                                        className="input-code"
                                        placeholder="Google Auth code"
                                        style={passInputStyle}
                                        onFocus={()=> {
                                            setTfaCodeInoutFocus(true)
                                        }}
                                        onChange={(e)=> {
                                            setCodeState(CodeStates.codeInput)

                                            if(e.currentTarget.value.length === 6){
                                                handleTfaVerify(e.currentTarget.value)
                                            }
                                        }}
                                    />
                                </div>
                                // :
                                // <CustomLoader widthBall={20} heightBall={20} left={0} animation={CustomAnimations.rotate_tr} loopTimeInSeconds={0.5}/>
                        }
                    </div>
                }
                {props.appState === appStates.onDisconnect &&
                    <div className="login-error-msg">
                        Server unavailable:(
                        Try later or message https://t.me/Artal_a
                    </div>}
            </div>
    );
}






