import React, {Dispatch, SetStateAction, useEffect, useLayoutEffect, useState} from 'react'
import "./App.css"
import Login from "./login/Login";
import Main from "./main/Main";
import JSCookies from 'js-cookie'
import {SERVER_URL} from "./constants";
import CustomAlert from "./utils/Alert/CustomAlert";

export enum appStates {
    onTokenCheck,
    onLogin,
    onLoginTFA,
    onMain,
    onGame,
    onCommunity,
    onLogout,
    onDisconnect
}

export type AppProps =  {
        setAppState: Dispatch<SetStateAction<appStates>>;
        appState: appStates;
        setToken: Dispatch<SetStateAction<string>>;
        token: string;
        showAlertValue : string;
        showAlert : Dispatch<SetStateAction<string>>
        tfaQuery : string | null
}

const App : React.FC = () => {
    const [appState,setAppState] = useState(appStates.onTokenCheck)
    const [token, setToken] = useState<string>('');
    const [showAlertValue,showAlert] = useState("")
    // const [logoutValue, logout] = useState(false)
    const cookieToken = JSCookies.get('accessToken')
    const queryParams = new URLSearchParams(window.location.search)
    const tfaQuery = queryParams.get("2fa")
    // console.log("App():",appState)
    useLayoutEffect(()=>{
        if(tfaQuery && tfaQuery.length) {
            console.log("App():","setting onLoginTFA")
            setAppState(appStates.onLoginTFA)
        }
    },[tfaQuery])
    useLayoutEffect(() => {
        if(cookieToken !== undefined) {
            console.log("App : set token")
            setToken(cookieToken)
            setAppState(appStates.onTokenCheck)
        }
    },[cookieToken]) // setting token

    let props = {
        setAppState: setAppState,
        appState: appState,
        setToken : setToken,
        token : token,
        showAlertValue : showAlertValue,
        showAlert : showAlert,
        tfaQuery : tfaQuery
    }
    if(appState === appStates.onTokenCheck){
        if( !token || token===""){
            setAppState(appStates.onLogin)
        } else {
            // console.log("fetchLoginProfile")
            fetch(SERVER_URL + "login/me/profile", {
                // credentials: "omit",
                method: "GET",
                headers: {
                    Authorization: 'Bearer ' + cookieToken
                }
            })
                .then((response) => {
                    if (response.status === 401) {
                        setAppState(appStates.onLogin)
                        // console.log("fetchLoginProfile" + token)
                        props.showAlert("Login failed")
                        return
                    } else if (response.ok) {
                        setAppState(appStates.onMain)
                    } else {
                        throw new Error('Server unavailable')
                    }
                })
                .catch(() => {
                    props.showAlert("Login: connection lost, try later")
                    setAppState(appStates.onDisconnect)
                });
        }
    }
    switch (appState){
        case appStates.onMain:
        case appStates.onGame:
        case appStates.onCommunity: {
            return (
                <>
                    <div className={showAlertValue === "" ? "not-blur" : "blur"}>
                        <Main {...props}/>
                    </div>
                    <CustomAlert {...props}/>
                </>
            )
        }
        case appStates.onLogout: {
            console.log("Logout")
            JSCookies.remove('accessToken')
            setToken('')
            setAppState(appStates.onLogin)
        }
        case appStates.onLoginTFA:
        case appStates.onLogin:
        case appStates.onDisconnect: {
            return(
                <>
                    <div className={showAlertValue === "" ? "not-blur" : "blur"}>
                        <Login {...props}/>
                    </div>
                    <CustomAlert {...props}/>
                </>
            )
        }
        default:
            return (
                <>
                    <div className={showAlertValue === "" ? "not-blur" : "blur"}>
                        bla
                    </div>
                    <CustomAlert {...props}/>
                </>
            )
    }
}

export default App;