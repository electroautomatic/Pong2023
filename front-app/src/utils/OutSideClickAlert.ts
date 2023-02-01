import React, {useRef, useEffect, Dispatch, SetStateAction} from "react";

/**
 * Hook that alerts clicks outside of the passed ref
 */
export function useOutsideAlerterBool(ref : React.MutableRefObject<null>,stateSetter : Dispatch<SetStateAction<boolean>>,expectingAfterOutsideClick : boolean) {
    useEffect(() => {
        /**
         * Alert if clicked on outside of element
         */
        function handleClickOutside(event : any) {
            // @ts-ignore
            if (ref.current && !ref.current.contains(event.target)) {
                stateSetter(expectingAfterOutsideClick)
            }
        }
        // Bind the event listener
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            // Unbind the event listener on clean up
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);
}

export function useOutsideAlerterString(ref : React.MutableRefObject<null>,stateSetter : Dispatch<SetStateAction<string>>) {
    useEffect(() => {
        /**
         * Alert if clicked on outside of element
         */
        function handleClickOutside(event : any) {
            // @ts-ignore
            if (ref.current && !ref.current.contains(event.target)) {
                // stateSetter("")
            }
        }
        // Bind the event listener
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            // Unbind the event listener on clean up
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);
}