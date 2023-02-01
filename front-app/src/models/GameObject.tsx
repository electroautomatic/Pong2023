class GameObject{
    // @ts-ignore
    id : number
    // @ts-ignore
    player1id : number
    // @ts-ignore
    player2id : number
    // @ts-ignore
    score1 : number
    // @ts-ignore
    score2 : number
    // @ts-ignore
    finished: boolean
    public constructor(obj: any) {
        Object.assign(this, obj);
    }
}

export default GameObject;