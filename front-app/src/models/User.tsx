import GameObject from "./GameObject";

class User{
    // @ts-ignore
    public friends:number[];
    // @ts-ignore
    public blackList:number[];
    // @ts-ignore
    public ecole42:number;
    public id:number;
    // @ts-ignore
    public isBlocked:boolean;
    // @ts-ignore
    public isFriend:boolean;
    // @ts-ignore
    public email:string;
    // @ts-ignore
    public name:string;
    // @ts-ignore
    public wines:number;
    // @ts-ignore
    public loses:number;
    // @ts-ignore
    public isOnline:boolean;
    // @ts-ignore
    public twoFactorEnabled:boolean;
    // @ts-ignore
    public gameIds: number[]
    // @ts-ignore
    public custom : boolean
    // @ts-ignore
    public achievementsId : number[]
    // @ts-ignore
    public games: Map<number,GameObject>
    public constructor(id: number,name: string) {
        this.id = id
        this.name = name
        this.ecole42 = id
    }
}

export default User;