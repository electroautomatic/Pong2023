import {appStates} from "../App";
import {OnNewGroupEnum} from "../main/community/Community";
import ChatWithMessages from "./ChatWithMessages";

class HistoryState{
    // @ts-ignore
    public appState: appStates;
    // @ts-ignore
    public onNewGroup : OnNewGroupEnum;
    // @ts-ignore
    public onChatDetails : ChatWithMessages | number | undefined;
    // @ts-ignore
    public onChatDetailsId : number | null;
    // @ts-ignore
    public onChatId : number
    // @ts-ignore
    public onChat : ChatWithMessages | null
        // @ts-ignore
    public constructor(obj: any) {
        Object.assign(this, obj);
    }
}

export default HistoryState;