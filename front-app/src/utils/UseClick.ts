import { useEffect, useState } from 'react'

export default function useClick()
{
    const [didClickButton, setDidClickButton] = useState(false)

    useEffect(() => {
        if (didClickButton) {
            window.addEventListener("click", mouseClickHandler)
            return () => {
                window.removeEventListener("click", mouseClickHandler)
            }
        } else {
            window.removeEventListener("click", mouseClickHandler)
        }
    }, [didClickButton])

    const mouseClickHandler = () => {
        setDidClickButton(false) // If you want to reset the behavior again
    }
    return true
}