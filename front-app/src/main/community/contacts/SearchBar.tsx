import React, {CSSProperties, Dispatch, SetStateAction, useRef} from "react";
import "./SearchBar.css"
import {ContactsViewProps} from "./ContactsView";
import {colors} from "../../../constants";

export type SearchBarProps = {
    contactsViewProps : ContactsViewProps,
    display: string;
    width: number;
    height: number;
    alignItems: string;
    position: string;
    borderRadius:number
}
export default function SearchBar(props : SearchBarProps) {
    const searchLine = useRef(null)
    if(props.contactsViewProps.onSearch === null && searchLine.current) {
        // @ts-ignore
        searchLine.current.value = ""
    }
    const addGroupBtnStyle = {
        margin: "15px 0px 5px 5px",
        height : props.height,
        borderRadius: 10,
        width : props.height,
        alignItems: "center",
        justifyContent: "center",
        display: "flex",
        fontSize: 20,
        fontWeight : "bolder"
    }
    const closeGroupBtnStyle = {
        margin: "15px 0px 5px 5px",
        height : props.height,
        borderRadius: 10,
        width : props.height,
        alignItems: "center",
        justifyContent: "center",
        display: "flex",
        fontSize: 18,
        // fontWeight : "bolder"
    }
    const inputMsgStyle = {
        outline: "none",
        border: "none",
        alignSelf: "right",
        backgroundColor : colors.BG_COLOR_DEFAULT,
        height : props.height,
        width: props.width - addGroupBtnStyle.width - 30,
        color : colors.TEXT_COLOR_DEFAULT,
        padding: "0px 5px",
        borderRadius: 10
    }
    const searchInputStyle = {
        marginTop:10,
        marginLeft:5,
        alignSelf: "left",
        height : props.height,
        paddingLeft: 5,
        borderRadius: 10
    }
    return (
            <div className="search-bar" style={props as CSSProperties}>
                <div className="search-input" style={searchInputStyle}>
                    <input ref={searchLine} type="text" placeholder="search" className="input-msg" style={inputMsgStyle} onFocus={() => {
                        props.contactsViewProps.setOnSearch("")
                    }} onChange={(e) => {props.contactsViewProps.setOnSearch(e.currentTarget.value)}}/>
                </div>
                {
                    props.contactsViewProps.onSearch === null
                        ?
                        <div className="add-group-btn" style={addGroupBtnStyle} onClickCapture={() => {
                            props.contactsViewProps.setOnNewGroup(1)
                            props.contactsViewProps.setOnChatId(0)
                        }}>
                            +
                        </div>
                        :
                        <div className="add-group-btn" style={closeGroupBtnStyle} onClickCapture={() => {
                                props.contactsViewProps.setOnSearch(null)
                                // @ts-ignore
                            searchLine.current.value = ""
                            }
                        }>
                            x
                        </div>

                }
            </div>
    );
}
