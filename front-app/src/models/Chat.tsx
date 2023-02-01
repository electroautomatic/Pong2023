class Chat{
    // @ts-ignore
    public requestPass : boolean;
    // @ts-ignore
    public id : number;
    // @ts-ignore
    public chat : boolean;
    // @ts-ignore
    public name : string;
    // @ts-ignore
    public key: number;
    // @ts-ignore
    public owner: number[];
    // @ts-ignore
    public participants : number[]
    // @ts-ignore
    public admins : number[]
    // @ts-ignore
    public muteList : number[]
    // @ts-ignore
    public blackList : number[]
    // @ts-ignore
    public msgLoaded : boolean

    public constructor(obj: any) {
        Object.assign(this, obj);
        this.key = obj.id
    }
}

export default Chat;