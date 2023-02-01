import User from "./User";
import ChatWithMessages from "./ChatWithMessages";

class SearchList{
    users : User[] = []
    chats : ChatWithMessages[] = []
    public constructor(obj: any) {
        Object.assign(this, obj);
    }
    empty() {
        return (
            !this.users.length && !this.chats.length
        )
    }
    length(){
        return (
            this.users.length+this.chats.length
        )
    }
}

export default SearchList;