import {Injectable} from '@nestjs/common';
import {GameService} from "../game/game.service";
import {Game, Prisma} from "@prisma/client";
import {PrismaService} from "../prisma.service";

@Injectable()
export class GameQueue {

    private gameQueue: Set<number>

    constructor(private prisma: PrismaService) {
        this.gameQueue = new Set<number>()
    }

    async createGame(data: Prisma.GameCreateInput): Promise<Game> {
        let game: Game = await this.prisma.game.create({
            data,
        });
        return game;
    }

    getPair(userID: number) {
        if (this.gameQueue.size >= 2) {
            for (let user of this.gameQueue) {
                if (Number(user) != userID) {
                    this.deleteFromQueue(userID)
                    this.deleteFromQueue(user)
                    return (this.createGame({
                        "player1id": userID,
                        "player2id": Number(user)
                    }))
                }
            }
        }
        return ({
            "id": null,
            "player1id": userID,
            "player2id": null,
            "winner": null,
            "score1": 0,
            "score2": 0,
            "finished": false
        })
    }

    deleteFromQueue(userID) {
        this.gameQueue.delete(userID)
    }

    addInQueue(userID) {
        this.gameQueue.add(userID)
    }
}

@Injectable()
export class UsersOnline {

    private usersOnline: Map<string, number>

    constructor() {
        this.usersOnline = new Map <string, number>()
    }

    getUsersOnline(){
        return this.usersOnline.values()
    }

    deleteUserByUserID(userID: number) {
        if (this.isUserOnline(userID)) {
            let socketID: string
            for (let item of this.usersOnline.keys()) {
                if (this.usersOnline[item] === userID) {
                    socketID = item
                    break
                }
            }
            this.deleteUserBySocketID(socketID)
        }
    }

    deleteUserBySocketID(socketID: string) {
        this.usersOnline.delete(socketID)
    }

    addUser(socketID: string, userID: number) {
        this.usersOnline.set(socketID, userID)
    }

    isUserOnline(userID: number): boolean {
        for (let item of this.usersOnline.values()) {
            if (item == userID){
                return true
            }
        }
        return false
    }

    updateUserID(socketID: string, userID: number) {
        this.usersOnline.set(socketID, userID)
    }

    getUserID(socketID: string): number {
        return this.usersOnline.get(socketID)
    }
}

export type GameParameters = {
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
    aborted: boolean,
    minSpeed: number,
    maxSpeed: number
}

@Injectable()
export class CurrentGame {

    private game: Map<number, GameParameters>

    constructor() {
        this.game = new Map <number, GameParameters>
    }

    addGame(gameId: number, parameters: GameParameters){
        this.game.set(gameId, parameters)
    }

    normaliseVector(x: number, y: number){
        let length = Math.sqrt(x * x + y * y)
        return{
            x: x / length,
            y: y / length
        }
    }

    randomVector(){
        let x = Math.random() * 2 - 1
        let y = (Math.random() * 2 - 1) / 2
        while (Math.abs(y) < 0.1)
            y = (Math.random() * 2 - 1) / 2
        while (Math.abs(x) - Math.abs(y) < 0.3){
            x = Math.random() * 2 - 1
        }
        return {x: x, y: y}
    }

    resetGameParameters(gameId: number){
        let params = this.getGame(gameId)
        params.coordinates = {
            x: (params.fieldSize.x) / 2,
            y: (params.fieldSize.y) / 2
        }
        let vector = this.randomVector()
        params.vector = this.normaliseVector(vector.x, vector.y)
        params.speed = 200
        params.minSpeed = 150
        params.maxSpeed = 500
        params.aborted = false
        this.game.set(gameId, params)
    }

    deleteGame(gameId: number){
        this.game.delete(gameId)
    }

    getGame(gameId: number): GameParameters{
        return this.game.get(gameId)
    }

    changePaddlePosition(gameId: number, playerId: number, position: number){
        let params = this.getGame(gameId)
        if (params.leftPlayer == playerId){
            params.leftPaddlePosition = position
        }
        if (params.rightPlayer == playerId){
            params.rightPaddlePosition = position
        }
        this.game.set(gameId, params)
    }

    updateTimeStamp(gameId: number){
        let params = this.getGame(gameId)
        params.timestamp = Date.now()
        this.game.set(gameId, params)
    }

    updateGameParameters(gameId: number, param: GameParameters){
        this.game.set(gameId, param)
    }

    updateCoordinates(gameId: number, coordinates: {x: number, y: number}){
        let params = this.getGame(gameId)
        params.coordinates = coordinates
        this.game.set(gameId, params)
    }

    updateVector(gameId: number, vector: {x: number, y: number}){
        let params = this.getGame(gameId)
        params.vector = vector
        this.game.set(gameId, params)
    }

    updateScore(gameId: number, isGoal: boolean) {
        let params = this.getGame(gameId)
        isGoal == false ? params.leftPlayerScore++ : params.rightPlayerScore++
        this.game.set(gameId, params)
    }

    lockPaddle(gameId: number){
        let params = this.getGame(gameId)
        params.stopPaddle = true
        this.game.set(gameId, params)
    }

    unlockPaddle(gameId: number){
        let params = this.getGame(gameId)
        params.stopPaddle = false
        this.game.set(gameId, params)
    }

    isLockPaddle(gameId: number): boolean{
        let gameParam = this.getGame(gameId)
        if (gameParam == undefined)
            return true
        return gameParam.stopPaddle
    }

    getGamesList(){
        let gameList = []
        for (let item of this.game.keys()){
            gameList.push({
                id : item,
                player1id : this.getGame(item).leftPlayer,
                player2id : this.getGame(item).rightPlayer,
                winner : null,
                leftPlayerScore : null,
                rightPlayerScore : null,
                finished : false
                }
            )
        }
        return gameList
    }

    getGameIdByPlayerID(gameId: number): number{
        for (let item of this.game.keys()){
            if (this.getGame(item).leftPlayer == gameId || this.getGame(item).rightPlayer == gameId){
                return item
            }
        }
        return -1
    }

    setAborted(gameId: number){
        let params = this.getGame(gameId)
        params.aborted = true
        this.game.set(gameId, params)
    }

    isAborted(gameId: number):boolean{
        return this.getGame(gameId).aborted
    }
}

export type GameInviteParameters = {
    firstPlayer: number,
    secondPlayer: number
}

@Injectable()
export class GameInvite {
    private invite: Map<number, GameInviteParameters>
    private inviteId:number
    constructor(private prisma: PrismaService) {
        this.invite = new Map <number, GameInviteParameters>()
        this.inviteId = 0
    }

    addInvite(firstPlayer: number, secondPlayer: number): number {
        for (let item of this.invite.keys()){
            let pairPlayers = this.invite.get(item)
            if (firstPlayer in [pairPlayers.firstPlayer, pairPlayers.secondPlayer] ||
                secondPlayer in [pairPlayers.firstPlayer, pairPlayers.secondPlayer]){
                return undefined
            }
        }
        this.inviteId++
        this.invite.set(this.inviteId, {firstPlayer: firstPlayer, secondPlayer: secondPlayer})
        return this.inviteId
    }

    deleteInvite(inviteId: number){
        this.invite.delete(inviteId)
    }

    async createGame(data: Prisma.GameCreateInput): Promise<Game> {
        let game: Game = await this.prisma.game.create({
            data,
        });
        return game;
    }

    async acceptInvite(inviteId: number){
        let players = this.invite.get(inviteId)
        return (this.createGame({
            "player1id": players.firstPlayer,
            "player2id": players.secondPlayer
        }))
    }

    deleteInvitesByUserId(userId: number){
        let nums = []
        for (let item of this.invite.keys()){
            let curr_item = this.invite.get(item)
            if (userId == curr_item.firstPlayer || userId == curr_item.secondPlayer)
                nums.push(item)
        }
        console.log('deleteInvitesByUserId','list invites:', nums)
        for (let item of nums){
            this.invite.delete(item)
        }
    }

}
