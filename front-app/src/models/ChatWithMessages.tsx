import Message from "./Message";
import Chat from "./Chat";

class ChatWithMessages{
    // @ts-ignore
    public chat : Chat
    // @ts-ignore
    public unreadMessagesCount : number
    // @ts-ignore
    public key : number
    // @ts-ignore
    public messages : Message[];
    // @ts-ignore
    public constructor(chat : Chat,key : number,messages : Message[]) {
        this.chat = chat
        this.key = key
        this.messages = messages
        this.unreadMessagesCount = 0
    }
}

export default ChatWithMessages;