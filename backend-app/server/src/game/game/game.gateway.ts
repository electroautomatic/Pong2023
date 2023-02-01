import {MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer} from '@nestjs/websockets';
import {Prisma, User} from "@prisma/client";
import {GameService} from "../game.service";
import {AuthService} from "src/auth/auth.service";
import {UsersService} from "../../users/users.service";
import {Subscriber} from "rxjs";
import {CurrentGame, GameQueue} from "../../game_objects/game_objects.service";
import { AchievementsService } from 'src/achievements/achievements.service';
import * as enums from "../../additional_files/enums"
// import {Cron, Interval} from '@nestjs/schedule';


@WebSocketGateway()
export class GameGateway {

    constructor(private readonly gameService: GameService,
                private readonly authService: AuthService, 
                private readonly userService: UsersService,
                private readonly gameQueue : GameQueue,
                private readonly currentGame : CurrentGame,
                private readonly achievService: AchievementsService) {

    }

    @WebSocketServer()
    server;

    @SubscribeMessage('game:paddlePosition')
    async handleMessagePost(
        @MessageBody()
            payload:
            {
                gameId: number,
                userId: number,
                paddlePosition: number
            }
    ): Promise<void> {
        if (payload.gameId != -1) {
            // console.log(payload)
            if (this.gameService.isLockPaddle(payload.gameId)){
                return
            }
            const createdMessage = await this.gameService.createMessage(payload);
            this.gameService.changePaddlePosition(payload.gameId, payload.userId, payload.paddlePosition)
            this.server.emit('game:paddlePosition', createdMessage);
        }
    }

    // @SubscribeMessage('games:online:get')
    // async handleGamesOnlineGet(): Promise<void> {
    //   const games = await this.gameService.games({where: { finished : false }});
    //   this.server.emit('games:player:get', games);
    // }
    @SubscribeMessage('games:online:get')
    async handleGamesOnlineGet(): Promise<void> {
        // const games = await this.gameService.games({where: { finished : false }});
        const games = this.gameService.getGamesList()
        this.server.emit('games:player:get', games);
    }

    @SubscribeMessage('games:get')
    async handleGamesGet(payload:{ userId: number}): Promise<void> {
        const games = await this.gameService.games({where: {id : payload.userId}});
        this.server.emit('games:player', games);
    }
    @SubscribeMessage('game:pressKey')
    async handlePressKey(
        @MessageBody()
            payload:
            {
                gameId: number,
            }
    ): Promise<void> {

        if (!this.gameService.isGameExist(payload.gameId))
            return

        let gamePlay = true

        this.gameService.resetGameParameters(payload.gameId)
        this.gameService.updateTimeStamp(payload.gameId)
        this.server.emit('game:ball', this.gameService.getBallDirection(payload.gameId));

        let gameParameters
        while (gamePlay && !this.gameService.isGameAborted(payload.gameId)){
            gameParameters = this.gameService.getGameParameters(payload.gameId);
            let cross = this.gameService.getNextEvent(gameParameters)
            await this.gameService.timeout(cross.delay)

            this.gameService.updateCoordinates(payload.gameId, cross.coordinates)

            if (this.gameService.checkPaddle(payload.gameId, cross)) {
                this.gameService.updateTimeStamp(payload.gameId)
                this.gameService.updateVector(payload.gameId, cross.vector)
                this.server.emit('game:ball', this.gameService.getBallDirection(payload.gameId))}
            else{
                this.gameService.lockPaddle(payload.gameId)
                while (gamePlay) {
                    gameParameters = this.gameService.getGameParameters(payload.gameId);
                    let cross = this.gameService.getNextEventFinal(gameParameters)
                    await this.gameService.timeout(cross.delay)
                    this.gameService.updateCoordinates(payload.gameId, cross.coordinates)
                    if (this.gameService.checkFinish(payload.gameId)) {
                        gamePlay = false
                    }
                    else {
                        this.gameService.updateTimeStamp(payload.gameId)
                        this.gameService.updateVector(payload.gameId, cross.vector)
                        this.server.emit('game:ball', this.gameService.getBallDirection(payload.gameId))
                    }
                }
                this.gameService.updateScore(payload.gameId, cross.coordinates.x <= 0)
                this.gameService.unlockPaddle(payload.gameId)
            }
        }
        if (!this.gameService.isGameAborted(payload.gameId)) {
            if (gameParameters.rightPlayerScore == 3 || gameParameters.leftPlayerScore == 3) {
                this.server.emit('game:finish', {gameId: payload.gameId, leftUserId: gameParameters.leftPlayer, rightUserId: gameParameters.rightPlayer, leftPlayerScore: gameParameters.leftPlayerScore,
                    rightPlayerScore: gameParameters.rightPlayerScore , error : false});

                await this.gameService.updateGame({
                    where: {id: Number(payload.gameId)},
                    data: {
                        score1 : gameParameters.leftPlayerScore,
                        score2 : gameParameters.rightPlayerScore,
                        winner : (gameParameters.leftPlayerScore > gameParameters.rightPlayerScore) ? gameParameters.leftPlayer: gameParameters.rightPlayer,
                        finished: true},
                })
                
                

                const user1: User = await this.userService.findOne(gameParameters.leftPlayer);
                await this.userService.updateUser({
                    where: { id: Number(gameParameters.leftPlayer) },
                    data: {
                        games: user1.games + 1,
                        wines: (gameParameters.leftPlayerScore > gameParameters.rightPlayerScore) ? user1.wines + 1 : user1.wines,
                        loses: (gameParameters.leftPlayerScore < gameParameters.rightPlayerScore) ? user1.loses + 1 : user1.loses,
                        level: (gameParameters.leftPlayerScore > gameParameters.rightPlayerScore) ? user1.level + 20 : user1.level - 5,
                        gameId: {
                            push: Number(payload.gameId)
                          }, 
                    }
                });

                const user2: User = await this.userService.findOne(gameParameters.rightPlayer);
                await this.userService.updateUser({
                    where: { id: Number(gameParameters.rightPlayer) },
                    data: { games : user2.games + 1 ,
                        wines : (gameParameters.rightPlayerScore > gameParameters.leftPlayerScore) ? user2.wines + 1: user2.wines ,
                        loses : (gameParameters.rightPlayerScore < gameParameters.leftPlayerScore) ? user2.loses + 1 : user2.loses,
                        level: (gameParameters.rightPlayerScore > gameParameters.leftPlayerScore) ? user2.level + 20 : user2.level - 5,
                        gameId: {
                            push: Number(payload.gameId)
                          }
                    },
                });
                let achiev = 0
                gameParameters.leftPlayerScore > gameParameters.rightPlayerScore? achiev = 1 : achiev = 2;
                if (achiev === 1){
                    if (!(await this.achievService.achieveObtain(user1.achievementsId, enums.titles['You did it!'])))
                        this.achievService.secondAchieve(user1.id)
                    if (!(await this.achievService.achieveObtain(user1.achievementsId, enums.titles['Grandmaster!'])) && user1.wines > 8)
                        this.achievService.thirdAchieve(user1.id)
                }
                else{
                    if (!(await this.achievService.achieveObtain(user2.achievementsId, enums.titles['You did it!'])))
                        this.achievService.secondAchieve(user2.id)
                    if (!(await this.achievService.achieveObtain(user2.achievementsId, enums.titles['Grandmaster!'])) && user2.wines > 8)
                        this.achievService.thirdAchieve(user2.id)
                }
                console.log("status game" + this.gameService.findOne(Number(payload.gameId)));
                this.gameService.deleteGame(payload.gameId)
                // this.server.emit('game:finish', {gameId: payload.gameId, leftPlayerScore: gameParameters.leftPlayerScore,
                //     rightPlayerScore: gameParameters.rightPlayerScore});
            }
            else {
                this.server.emit('game:round', {
                    gameId: payload.gameId,
                    leftPlayerScore: gameParameters.leftPlayerScore,
                    rightPlayerScore: gameParameters.rightPlayerScore
                });
            }
        }
        else {
            this.gameService.deleteGame(payload.gameId)
        }
    }
    @SubscribeMessage('game:startGame')
    async handleStartGame(
        @MessageBody()
            payload:
            {
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
            }
    ): Promise<void> {
        const createdMessage = await this.gameService.answerStartGame(payload);
        this.server.emit('game:startGame', createdMessage);
    }

    @SubscribeMessage('game:watch')
    async gatPossition(
        @MessageBody()
            payload:
            {
                gameId: number,
            }
    ): Promise<void> {
        this.server.emit('game:watch', this.gameService.getGameWatch(payload.gameId))}
    
    @SubscribeMessage('game:queue:user:leave')
    async userLeftQueue(
        @MessageBody()
            payload:
            {
                userId: number,
            }
    ): Promise<void> {
        this.gameQueue.deleteFromQueue(payload.userId);
    }

    @SubscribeMessage('game:game:user:leave')
    async userLeftGame(
        @MessageBody()
            payload:
            {
                userId : number,
            }
    ): Promise<void> {
        let gameId = this.currentGame.getGameIdByPlayerID(payload.userId);
        this.gameService.deleteGame(gameId);
        this.server.emit('game:finish', {gameId: gameId, leftUserId: 0, rightUserId: 0, leftPlayerScore: 0,
            rightPlayerScore: 0, error: true});
    }

    @SubscribeMessage('game:invite:create')
    async handleGameInviteCreate(
        @MessageBody()
            payload:
            {
                user1: number,
                user2: number
            }
    ): Promise<void> {
        let inviteMessage = this.gameService.addGameInvite(payload.user1, payload.user2)
        if (inviteMessage != undefined)
            this.server.emit('game:invite:create', inviteMessage);
    }

    @SubscribeMessage('game:invite:cancel')
    async handleGameInviteCancel(
        @MessageBody()
            payload:
            {
                inviteId: number
            }
    ): Promise<void> {
        this.server.emit('game:invite:cancel', this.gameService.deleteGameInvite(payload.inviteId));
    }

    @SubscribeMessage('game:invite:accept')
    async handleGameInviteAccept(
        @MessageBody()
            payload:
            {
                inviteId: number,
                gameFieldSize: {
                    width: number,
                    height: number
                },
                paddleSize: {
                    width: number,
                    height: number

                },
                ballSize: number
            }
    ): Promise<void> {

        this.server.emit('game:startGame', await this.gameService.acceptGameInvite(payload));
        this.server.emit('game:invite:cancel', this.gameService.deleteGameInvite(payload.inviteId));

    }



}

