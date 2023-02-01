class Message{

    // @ts-ignore
        public userName:string;
    // @ts-ignore
    public userId:number;
    // @ts-ignore
    public ChatId:number;
    // @ts-ignore
    public id:number;
    // @ts-ignore
    public text:string;
    // @ts-ignore
    public constructor(obj: any) {
        Object.assign(this, obj);
    }
}

export default Message;