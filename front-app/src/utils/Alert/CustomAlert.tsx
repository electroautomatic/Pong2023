import React, {CSSProperties, useEffect, useRef, useState} from "react";
import {AppProps} from "../../App";
import {useOutsideAlerterString} from "../OutSideClickAlert";
import "./CustomAlert.css"
import {colors} from "../../constants";


export default function CustomAlert(props : AppProps) {
    const wrapperRef = useRef(null);
    useEffect(() => {
        const timeId = setTimeout(() => {
            props.showAlert("")
        }, props.showAlertValue.length * 60)
        return () => {
            clearTimeout(timeId)
        }
    }, [props]);

    let btnStyleCustomHeightUnselected = {
        padding: "25px 50px 25px 50px",
        backgroundColor: colors.BG_COLOR_24,
        height: 50,
        width: "auto",
        alignItems: "center",
        justifyContent: "center",
        display: "flex",
        fontSize: 15,
        borderRadius:10,
        fontWeight: "bolder",
        color: colors.TEXT_COLOR_DEFAULT
    }
    const alertStyle = {
        width: "auto",
        height: "auto",
        position: "absolute",
        top: "50%",
        left: "50%",
        color : "#ddd",
        transform: "translateX(-50%) translateY(-50%)",
        display:"flex", alignItems:"center", flexDirection:"column",
        background: colors.BG_COLOR_26,
        visibility : "hidden",
        borderRadius : 5,
        border: "2px solid #333",
        animation: "fadeInCustom 2s"
    }
    if(props.showAlertValue !== "") {
        alertStyle.visibility = ""
    }
    return (
        <div className="alert" style={alertStyle as CSSProperties} ref={wrapperRef}>
            <div className="back-btn" style={btnStyleCustomHeightUnselected} onClick={() => {
                props.showAlert("")
            }}>
                {props.showAlertValue}
            </div>
        </div>
    )
}