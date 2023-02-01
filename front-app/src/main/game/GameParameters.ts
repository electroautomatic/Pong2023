export type GameParameters = {
    gameID : number,
    leftPlayer: number,
    rightPlayer: number,
    leftPaddlePosition: number,
    rightPaddlePosition: number,
    stopPaddle: boolean,
    leftPlayerScore : number,
    rightPlayerScore : number,
    coordinates: {
        x: number,
        y: number
    }
    vector: {
        x: number,
        y: number
    }
    speed: number,
    timestamp: number,
    fieldSize: {
        x: number,
        y: number
    },
    paddleSize: {
        x: number,
        y: number
    },
    ballSize: number,
    aborted: boolean
}