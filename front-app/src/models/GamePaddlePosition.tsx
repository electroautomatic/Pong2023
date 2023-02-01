class User{
    // @ts-ignore
    public gameId:number;
    // @ts-ignore
    public userId:number;
    // @ts-ignore
    public paddlePosition:number;
    public constructor(obj: any) {
        Object.assign(this, obj);
    }
}

export default User;