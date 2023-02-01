import ChatWithMessages from "./ChatWithMessages";
import Chat             from "./Chat";
import Message          from "./Message";
import React            from "react";
import SearchList from "./SearchList";

export class ChatNotFoundException extends Error{
}

class ChatList{
    public chats : ChatWithMessages[]
    // public searchList : ChatWithMessages[]
    protected searchList : SearchList
    public onChatId : number
    public onChatTmp : ChatWithMessages | undefined
    public constructor(l:SearchList) {
        this.chats = []
        this.onChatId = 0
        this.searchList = l
    }
    loadOnChatId(id : number){
        this.onChatId = id
    }
    getSearchList(){
        return this.searchList
    }
    setSearchList(list : SearchList){
        if(this.searchList.chats.find((c)=>c.chat.id===this.onChatId) && this.onChatTmp?.chat.id !== this.onChatId) {
            this.onChatTmp = this.searchList.chats.find((c) => c.chat.id === this.onChatId)
            // console.log("setSearchList","setting chatTmp",this.onChatTmp?.chat.id)
        }
        this.searchList = list
    }
    print(){
        console.log("\\/\\/\\/ChatList - chats\\/\\/\\/")
        console.log(this.chats)
        console.log("\\/\\/\\/ChatList - search list\\/\\/\\/")
        console.log(this.searchList)
        console.log("\\/\\/\\/ChatList - tmp\\/\\/\\/")
        console.log(this.onChatTmp)
    }
    printChat(id : number){
        console.log("\\/\\/\\/ChatList - print Chat\\/\\/\\/")
        if(!id)
            return
        console.log(this.getChat(id))
    }
    printParticipants(){
        console.log("\\/\\/\\/ChatList Participants\\/\\/\\/")
        this.chats.forEach((c) => {
            console.log(c.chat.id,c.chat.name,c.chat.participants,c.chat.chat)
        })
    }
    getList(){
        return this.chats
    }
    getChat(chatId : number) {
        if(!chatId)
            throw new ChatNotFoundException("getChat: empty src"+chatId)
        let found = this.chats.find((c) => c.chat.id === chatId)
        if(!found) {
            found = this.searchList.chats.find((c) => c.chat.id === chatId)
        } else {
            // console.log("getChat","onChatId from chatList",this.onChatId)
        }
        if(!found) {
            if (this.onChatId === this.onChatTmp?.chat.id) {
                // console.log("getChat", "onChatId from TMP", this.onChatId)
                return this.onChatTmp
            }
        } else {
            // console.log("getChat", "onChatId from searchList", this.onChatId)
        }
        if(!found)
            throw new ChatNotFoundException("getChat: "+chatId)
        return found
    }
    getChatName(chatId : number) {
        return this.getChat(chatId).chat.name
    }
    removeChat(chatId : number){
        let chat = this.getChat(chatId)
        let index = this.chats.indexOf(chat)
        console.log("remove",chat,index)
        this.chats.splice(index, 1);
    }
    addMessage(msg : Message) {
        this.getChat(msg.ChatId).messages.push(msg)
    }
    addChatWithMessages(chat : ChatWithMessages){
        if(chat.chat.id ===this.onChatId && this.onChatTmp)
            chat.messages = this.onChatTmp.messages
        this.chats.unshift(chat)
        if(chat.chat.id === this.onChatTmp?.chat.id){
            console.log("addChatWithMessages:","reseting chatTmp")
            this.onChatTmp = undefined
        }
    }
    addChatWithoutMessages(chat : Chat){
        const chatWM = new ChatWithMessages(chat,chat.id,[])
        this.addChatWithMessages(chatWM)
        if(chat.id === this.onChatTmp?.chat.id){
            console.log("addChatWithoutMessages:","reseting chatTmp")
            this.onChatTmp = undefined
        }
    }
    replaceChatWithMessages(chat : ChatWithMessages) {
        if(!chat.chat.id)
            return
        if(this.isInList(chat.chat.id)) {
            this.getChat(chat.chat.id).chat = chat.chat
            console.log("chatList:","replaceChatWithMessages:",chat.chat.id,"replaced in chatList",)
        }
        if(this.onChatTmp &&this.onChatTmp?.chat.id === chat.chat.id){
            console.log("chatList:","replaceChatWithMessages:",chat.chat.id,"updating/setting TMP")
            this.onChatTmp.chat = chat.chat
            console.log("chatList:","replaceChatWithMessages:",chat.chat.id,"replaced in TMP",)
        }
        if(this.searchList.chats.find((c)=>c.chat.id===chat.chat.id)) {
            let index = this.searchList.chats.indexOf(this.getChat(chat.chat.id))
            this.searchList.chats[index].chat = chat.chat
            console.log("chatList:","replaceChatWithMessages:",chat.chat.id,"replaced in searchList",)
        }
    }
    replaceChatWithoutMessages(chat : Chat) {
        if(!chat.id)
            return
        if(this.isInList(chat.id)) {
            this.getChat(chat.id).chat = chat
                console.log("chatList:", "replaceChatWithoutMessages:", chat.id, "replaced in chatList",)
        }
        if(this.searchList.chats.find((c)=>c.chat.id===chat.id)) {
            let index = this.searchList.chats.indexOf(this.getChat(chat.id))
            this.searchList.chats[index].chat = chat
            console.log("chatList:","replaceChatWithoutMessages:",chat.id,"replaced in searchList",)
        }
        if(this.onChatTmp && this.onChatTmp?.chat.id === chat.id){
            this.onChatTmp.chat = chat
            console.log("chatList:","replaceChatWithoutMessages:",chat.id,"replaced in tmpChat",)
        }
    }
    isInList(chatId : number) {
        return !!this.chats.find((c) => c.chat.id === chatId)
    }
    reassign(list: ChatWithMessages[]){
        this.chats = list
    }
    clear(){
        this.chats = []
    }
    length(){
        return this.chats.length
    }
}

export default ChatList;