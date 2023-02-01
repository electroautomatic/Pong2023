import { Injectable } from '@nestjs/common';
import {Prisma, Game, User} from "@prisma/client";
import { PrismaService } from 'src/prisma.service';
import {GameObjectsModule} from "../game_objects/game_objects_module";
import {CurrentGame, GameInvite, GameParameters, GameQueue, UsersOnline} from "../game_objects/game_objects.service";

@Injectable()
export class GameService {
    constructor (private prisma: PrismaService,
                 private gameQueue: GameQueue,
                 private usersOnline: UsersOnline,
                 private currentGame: CurrentGame,
                 private gameInvite:GameInvite) {}

    async game(
        gameWhereUniqueInput: Prisma.GameWhereUniqueInput,
    ) : Promise<Game | null>{
        return this.prisma.game.findUnique({
            where : gameWhereUniqueInput,
        });
    }

    async games(params: {
        skip?: number;
        take?: number;
        cursor?: Prisma.GameWhereUniqueInput;
        where?: Prisma.GameWhereInput;
      }): Promise<Game[]> {
        const { skip, take, cursor, where } = params;
        return this.prisma.game.findMany({
          skip,
          take,
          cursor,
          where,
        });
      }
    
    async createGame(data: Prisma.GameCreateInput): Promise<Game> {
        let game : Game = await this.prisma.game.create({
          data,
        });
        return game;
      }
    
    async findOne(id: number): Promise<Game | undefined> {
        // console.log(id);
        return this.game({ id: Number(id) });
        //return this.users.find(user => user.username === username);
      }      

    async createMessage(data: {
        gameId: number,
        userId: number,
        paddlePosition: number}
    )
    {
        return data;
    }

    async answerStartGame(data: {
        userId: number,
        gameFieldSize: {
            width: number,
            height: number
        },
        paddleSize: {
            width: number,
            height: number

        },
        ballSize: number
    })
    {
        this.gameQueue.addInQueue(data.userId)
        let users = await this.gameQueue.getPair(data.userId);
        if (users.id != null) {
            let params = {
                leftPlayer: users.player1id,
                rightPlayer: users.player2id,
                leftPaddlePosition: (data.gameFieldSize.height + data.ballSize) / 2 - data.paddleSize.height / 2,
                rightPaddlePosition: (data.gameFieldSize.height + data.ballSize) / 2 - data.paddleSize.height / 2,
                stopPaddle: false,
                leftPlayerScore: 0,
                rightPlayerScore: 0,
                coordinates: {
                    x: 0,
                    y: 0
                },
                vector: {x: 0, y: 1},
                speed: 0,
                timestamp: 0,
                fieldSize: {
                    x: data.gameFieldSize.width,
                    y: data.gameFieldSize.height
                },
                paddleSize: {
                    x: data.paddleSize.width,
                    y: data.paddleSize.height
                },
                ballSize: data.ballSize,
                aborted: false,
                minSpeed: 0,
                maxSpeed: 0
            }
            this.currentGame.addGame(users.id, params)
            this.currentGame.resetGameParameters(users.id)
        }

        return users
    }

    normaliseVector(x: number, y: number){
        let length = Math.sqrt(x * x + y * y)
        return{
            x: x / length,
            y: y / length
        }
    }

    dist(x0, y0, x1, y1){
        return Math.sqrt((x0 - x1) * (x0 - x1) + (y0 - y1) * (y0 - y1))
    }

    async timeout(delay: number) {
        return new Promise( res => setTimeout(res, delay) );
    }

    getCrossing(param: GameParameters){
        let pointX
        let pointY
        if (param.vector.x > 0){
            pointX = param.fieldSize.x
            pointY = (pointX - param.coordinates.x) / param.vector.x * param.vector.y + param.coordinates.y
            if (pointY > 0 && pointY < param.fieldSize.y)
                return {
                    coordinates: {x: pointX, y: pointY},
                    vector: {x: -param.vector.x, y: param.vector.y}
                }
            else if (pointY == 0 || pointY == param.fieldSize.y)
                return {
                    coordinates: {x: pointX, y: pointY},
                    vector: {x: -param.vector.x, y: -param.vector.y}
                }
        }
        if (param.vector.x < 0){
            pointX = 0
            pointY = (pointX - param.coordinates.x) / param.vector.x * param.vector.y + param.coordinates.y
            if (pointY > 0 && pointY < param.fieldSize.y)
                return {
                    coordinates: {x: pointX, y: pointY},
                    vector: {x: -param.vector.x, y: param.vector.y}
                }
            else if (pointY == 0 || pointY == param.fieldSize.y)
                return {
                    coordinates: {x: pointX, y: pointY},
                    vector: {x: -param.vector.x, y: -param.vector.y}
                }
        }
        if (param.vector.y > 0){
            pointY = param.fieldSize.y
            pointX = (pointY - param.coordinates.y) / param.vector.y * param.vector.x + param.coordinates.x
            if (pointX > 0 && pointX < param.fieldSize.x)
                return {
                    coordinates: {x: pointX, y: pointY},
                    vector: {x: param.vector.x, y: -param.vector.y}
                }
            else if (pointX == 0 || pointX == param.fieldSize.x)
                return {
                    coordinates: {x: pointX, y: pointY},
                    vector: {x: -param.vector.x, y: -param.vector.y}
                }
        }
        if (param.vector.y < 0){
            pointY = 0
            pointX = (pointY - param.coordinates.y) / param.vector.y * param.vector.x + param.coordinates.x
            if (pointX > 0 && pointX < param.fieldSize.x)
                return {
                    coordinates: {x: pointX, y: pointY},
                    vector: {x: param.vector.x, y: -param.vector.y}
                }
            else if (pointX == 0 || pointX == param.fieldSize.x)
                return {
                    coordinates: {x: pointX, y: pointY},
                    vector: {x: -param.vector.x, y: -param.vector.y}
                }
        }
    }

    getCrossingFinal(param: GameParameters){
        let pointX
        let pointY


        let upperPaddleLine
        let downPaddleLine
        let leftSide = 0 - param.paddleSize.x - param.ballSize / 2
        let rightSide = param.fieldSize.x + param.paddleSize.x + param.ballSize / 2
        if (param.coordinates.x <= 0) {
            upperPaddleLine = param.leftPaddlePosition - param.ballSize
            downPaddleLine = param.leftPaddlePosition + param.paddleSize.y
        }
        else {
            upperPaddleLine = param.rightPaddlePosition - param.ballSize
            downPaddleLine = param.rightPaddlePosition + param.paddleSize.y
        }

        if (param.coordinates.y <= upperPaddleLine){

            if (param.vector.x > 0){
                pointX = rightSide
                pointY = (pointX - param.coordinates.x) / param.vector.x * param.vector.y + param.coordinates.y
                if (pointY > 0 && pointY < upperPaddleLine)
                    return {
                        coordinates: {x: pointX, y: pointY},
                        vector: {x: -param.vector.x, y: param.vector.y}
                    }
                else if (pointY == 0 || pointY == upperPaddleLine)
                    return {
                        coordinates: {x: pointX, y: pointY},
                        vector: {x: -param.vector.x, y: -param.vector.y}
                    }
            }
            if (param.vector.x < 0){
                pointX = leftSide
                pointY = (pointX - param.coordinates.x) / param.vector.x * param.vector.y + param.coordinates.y
                if (pointY > 0 && pointY < upperPaddleLine)
                    return {
                        coordinates: {x: pointX, y: pointY},
                        vector: {x: -param.vector.x, y: param.vector.y}
                    }
                else if (pointY == 0 || pointY == upperPaddleLine)
                    return {
                        coordinates: {x: pointX, y: pointY},
                        vector: {x: -param.vector.x, y: -param.vector.y}
                    }
            }
            if (param.vector.y > 0){
                pointY = upperPaddleLine
                pointX = (pointY - param.coordinates.y) / param.vector.y * param.vector.x + param.coordinates.x
                if (pointX > leftSide && pointX < rightSide)
                    return {
                        coordinates: {x: pointX, y: pointY},
                        vector: {x: param.vector.x, y: -param.vector.y}
                    }
                else if (pointX == leftSide || pointX == rightSide)
                    return {
                        coordinates: {x: pointX, y: pointY},
                        vector: {x: -param.vector.x, y: -param.vector.y}
                    }
            }
            if (param.vector.y < 0){
                pointY = 0
                pointX = (pointY - param.coordinates.y) / param.vector.y * param.vector.x + param.coordinates.x
                if (pointX > leftSide && pointX < rightSide)
                    return {
                        coordinates: {x: pointX, y: pointY},
                        vector: {x: param.vector.x, y: -param.vector.y}
                    }
                else if (pointX == leftSide || pointX == rightSide)
                    return {
                        coordinates: {x: pointX, y: pointY},
                        vector: {x: -param.vector.x, y: -param.vector.y}
                    }
            }

        }
        else if (param.coordinates.y >= downPaddleLine){

            if (param.vector.x > 0){
                pointX = rightSide
                pointY = (pointX - param.coordinates.x) / param.vector.x * param.vector.y + param.coordinates.y
                if (pointY > downPaddleLine && pointY < param.fieldSize.y)
                    return {
                        coordinates: {x: pointX, y: pointY},
                        vector: {x: -param.vector.x, y: param.vector.y}
                    }
                else if (pointY == downPaddleLine || pointY == param.fieldSize.y)
                    return {
                        coordinates: {x: pointX, y: pointY},
                        vector: {x: -param.vector.x, y: -param.vector.y}
                    }
            }
            if (param.vector.x < 0){
                pointX = leftSide
                pointY = (pointX - param.coordinates.x) / param.vector.x * param.vector.y + param.coordinates.y
                if (pointY > downPaddleLine && pointY < param.fieldSize.y)
                    return {
                        coordinates: {x: pointX, y: pointY},
                        vector: {x: -param.vector.x, y: param.vector.y}
                    }
                else if (pointY == downPaddleLine || pointY == param.fieldSize.y)
                    return {
                        coordinates: {x: pointX, y: pointY},
                        vector: {x: -param.vector.x, y: -param.vector.y}
                    }
            }
            if (param.vector.y > 0){
                pointY = param.fieldSize.y
                pointX = (pointY - param.coordinates.y) / param.vector.y * param.vector.x + param.coordinates.x
                if (pointX > leftSide && pointX < rightSide)
                    return {
                        coordinates: {x: pointX, y: pointY},
                        vector: {x: param.vector.x, y: -param.vector.y}
                    }
                else if (pointX == leftSide || pointX == rightSide)
                    return {
                        coordinates: {x: pointX, y: pointY},
                        vector: {x: -param.vector.x, y: -param.vector.y}
                    }
            }
            if (param.vector.y < 0){
                pointY = downPaddleLine
                pointX = (pointY - param.coordinates.y) / param.vector.y * param.vector.x + param.coordinates.x
                if (pointX > leftSide && pointX < rightSide)
                    return {
                        coordinates: {x: pointX, y: pointY},
                        vector: {x: param.vector.x, y: -param.vector.y}
                    }
                else if (pointX == leftSide || pointX == rightSide)
                    return {
                        coordinates: {x: pointX, y: pointY},
                        vector: {x: -param.vector.x, y: -param.vector.y}
                    }
            }

        }


    }

    getNextEvent(param: GameParameters){
        let cross = this.getCrossing(param)
        let distanse = this.dist(cross.coordinates.x, cross.coordinates.y, param.coordinates.x, param.coordinates.y)
        let delay = distanse / param.speed * 1000
        return {
            coordinates: cross.coordinates,
            vector: cross.vector,
            delay: delay
        }
    }

    getNextEventFinal(param: GameParameters){
        let cross = this.getCrossingFinal(param)
        let distanse = this.dist(cross.coordinates.x, cross.coordinates.y, param.coordinates.x, param.coordinates.y)
        let delay = distanse / param.speed * 1000
        return {
            coordinates: cross.coordinates,
            vector: cross.vector,
            delay: delay
        }
    }

    checkFinish(gameID: number): boolean{
        let param = this.currentGame.getGame(gameID)

        let leftSide = 0 - param.paddleSize.x - param.ballSize / 2
        let rightSide = param.fieldSize.x + param.paddleSize.x + param.ballSize / 2

        return param.coordinates.x <= leftSide || param.coordinates.x >= rightSide
    }



    updateTimeStamp(gameID: number){
        this.currentGame.updateTimeStamp(gameID)
    }

    getBallDirection(gameID: number){
        let param = this.currentGame.getGame(gameID)
        return{
            gameId: gameID,
            coordinates: param.coordinates,
            vector: param.vector,
            speed: param.speed,
            timestamp: param.timestamp
        }
    }

    getGameParameters(gameID: number){
        return this.currentGame.getGame(gameID)
    }

    getGameWatch(gameID: number){
        let param = this.currentGame.getGame(gameID)

        return {
            gameID: gameID,
            leftPlayer: param.leftPlayer,
            rightPlayer: param.rightPlayer,
            leftPaddlePosition: param.leftPaddlePosition,
            rightPaddlePosition: param.rightPaddlePosition,
            stopPaddle: param.stopPaddle,
            leftPlayerScore: param.leftPlayerScore,
            rightPlayerScore: param.rightPlayerScore,
            coordinates: param.coordinates,
            vector: param.vector,
            speed: param.speed,
            timestamp: param.timestamp,
            fieldSize: param.fieldSize,
            paddleSize: param.paddleSize,
            ballSize: param.ballSize,
            aborted: param.aborted
        }
    }

    updateGameParameters(gameID: number, param: GameParameters){
        this.currentGame.updateGameParameters(gameID, param)
    }

    updateCoordinates(gameId: number, coordinates: {x: number, y: number}){
        this.currentGame.updateCoordinates(gameId, coordinates)
    }

    updateVector(gameId: number, vector: {x: number, y: number}){
        this.currentGame.updateVector(gameId, vector)
    }

    changePaddlePosition(gameId: number, UserId: number, position: number){
        this.currentGame.changePaddlePosition(gameId, UserId, position)
    }

    async updateGame(params: {
        where: Prisma.GameWhereUniqueInput;
        data: Prisma.GameUpdateInput;
    }): Promise<Game> {
        const {where, data} = params;
        return this.prisma.game.update({
            data,
            where,
        });
    }

    checkPaddle(gameId: number, cross){
        let param = this.currentGame.getGame(gameId)
        console.log(param)
        if (param.coordinates.x == 0){
            let upSidePaddle = param.leftPaddlePosition
            let downSidePaddle = param.leftPaddlePosition + param.paddleSize.y
            let upSideBall = param.coordinates.y
            let downSideBall = param.coordinates.y + param.ballSize

            if (downSideBall >= upSidePaddle && upSideBall <= downSidePaddle){
                let y = 10 / param.paddleSize.y * (upSideBall + param.ballSize / 2 - upSidePaddle) - 5
                cross.vector = this.normaliseVector(5, y)
                console.log("y =", y)
                param.speed *= 1.1 + 0.3 / 2.5 * (Math.abs(y) - 2.5)
                if (param.speed > param.maxSpeed)
                    param.speed = param.maxSpeed
                else if (param.speed < param.minSpeed)
                    param.speed = param.minSpeed
                return true
            }
            else
                return false
        }
        if (param.coordinates.x == param.fieldSize.x){
            let upSidePaddle = param.rightPaddlePosition
            let downSidePaddle = param.rightPaddlePosition + param.paddleSize.y
            let upSideBall = param.coordinates.y
            let downSideBall = param.coordinates.y + param.ballSize

            if (downSideBall >= upSidePaddle && upSideBall <= downSidePaddle){
                let y = 10 / param.paddleSize.y * (upSideBall + param.ballSize / 2 - upSidePaddle) - 5
                cross.vector = this.normaliseVector(-5, y)
                console.log("y =", y)
                param.speed *= 1.1 + 0.3 / 2.5 * (Math.abs(y) - 2.5)
                return true
            }
            else
                return false
        }
        return true
    }

    resetGameParameters(gameId: number){
        this.currentGame.resetGameParameters(gameId)

    }

    updateScore(gameId: number, isGoal: boolean) {
        this.currentGame.updateScore(gameId, isGoal)
    }

    lockPaddle(gameId: number){
        this.currentGame.lockPaddle(gameId)
    }

    unlockPaddle(gameId: number) {
        this.currentGame.unlockPaddle(gameId)
    }

    isLockPaddle(gameId: number): boolean{
        return this.currentGame.isLockPaddle(gameId)
    }

    getGamesList() {
        return this.currentGame.getGamesList()
    }

    isGameAborted(gameId: number): boolean{
        return this.currentGame.isAborted(gameId)
    }

    deleteGame(gameId: number){
        this.currentGame.deleteGame(gameId)
    }

    isGameExist(gameId: number): boolean{
        return this.currentGame.getGame(gameId) != undefined;
    }

    addGameInvite(user1: number, user2: number){
        let inviteId = this.gameInvite.addInvite(user1, user2)
        if (inviteId == undefined){
            return undefined
        }
        return {
            inviteId: inviteId,
            user1: user1,
            user2: user2
        }
    }

    deleteGameInvite(inviteId: number){
        this.gameInvite.deleteInvite(inviteId)
        return {
            inviteId: inviteId,
        }
    }

    async acceptGameInvite(payload){

        let users = await this.gameInvite.acceptInvite(payload.inviteId)

        let params = {
            leftPlayer: users.player1id,
            rightPlayer: users.player2id,
            leftPaddlePosition: (payload.gameFieldSize.height + payload.ballSize) / 2 - payload.paddleSize.height / 2,
            rightPaddlePosition: (payload.gameFieldSize.height + payload.ballSize) / 2 - payload.paddleSize.height / 2,
            stopPaddle: false,
            leftPlayerScore: 0,
            rightPlayerScore: 0,
            coordinates: {
                x: 0,
                y: 0
            },
            vector: {x: 0, y: 1},
            speed: 0,
            timestamp: 0,
            fieldSize: {
                x: payload.gameFieldSize.width,
                y: payload.gameFieldSize.height
            },
            paddleSize: {
                x: payload.paddleSize.width,
                y: payload.paddleSize.height
            },
            ballSize: payload.ballSize,
            aborted: false,
            maxSpeed: 0,
            minSpeed: 0
        }
        this.currentGame.addGame(users.id, params)
        this.currentGame.resetGameParameters(users.id)

        return users
    }
}
