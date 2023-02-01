class User{
    // @ts-ignore
    public gameId:number;
    // @ts-ignore
    public coordinates: {
        x: number,
        y: number
    };
    // @ts-ignore
    public vector: {
        x: number,
        y: number
    };
    // @ts-ignore
    public speed: number;
    // @ts-ignore
    public timestamp: number;

    public constructor(obj: any) {
        Object.assign(this, obj);
    }
}

export default User;