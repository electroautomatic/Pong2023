import { Controller, Get, Post, Body, Param, ParseIntPipe, NotFoundException, Put, Req, UseGuards} from '@nestjs/common';
import { GameService } from './game.service';
import { UsersService } from 'src/users/users.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guards';
import { Game } from '@prisma/client';


@Controller()
export class GameController {
    constructor(private readonly gameService: GameService,
                private readonly userService: UsersService) {}
    

    
    @Get('all/chats')
    async getChats(): Promise<Game[]>{
        return this.gameService.games({});
    }

    @UseGuards(JwtAuthGuard)
    @Get('all/games/user')
    async getUserGames(@Req() req : any): Promise<Game[]>{
      const user = this.userService.findOne(req.user.id);
      console.log((await user).gameId);
      const gameId = (await user).gameId;
      return this.gameService.games({
        where: {
                id: { in: gameId },
            }
          }); 
    }

    @Get('all/games/:id')
    async getGamesByUserId(@Param('id', new ParseIntPipe()) id: number): Promise<Game[]>{
        const user = this.userService.findOne(id);
        console.log((await user).gameId);
        const gameId = (await user).gameId;
        return this.gameService.games({
            where: {
                id: { in: gameId },
            }
        });
    }

    @UseGuards(JwtAuthGuard)
    @Get('all/online/user/games/')
    async getUserGamesOnline(@Req() req : any): Promise<Game[]>{
      const user = this.userService.findOne(req.user.id);
      console.log((await user).gameId);
      const gameId = (await user).gameId;
      return this.gameService.games({
        where: {
                id: { in: gameId },
                finished: false,
            }
          }); 
    }


    @UseGuards(JwtAuthGuard)
    @Get('all/online/games')
    async getAllGamesOnline(@Req() req : any): Promise<Game[]>{
      return this.gameService.games({
        where: {
                finished: false,
            }
          }); 
    }




    // @UseGuards(JwtAuthGuard)
    @Post('game/create')
    async createChat(@Body() userData: { userId1: number; userId2: number}) : Promise<Game>{
      // userData.participants.push(req.user.id);
      // userData.participants.push(5);
  
    //   userData.participants = [ Number(req.user.id)]
      // req.user.id;
      let game : Game = await this.gameService.createGame({
        player1id: userData.userId1,
        player2id: userData.userId2,
          });
        this.userService.updateUser({
          where: {id: Number(userData.userId1)},
          data: {
            gameId: {
              push: Number(game.id)
            }
          },
        })
        this.userService.updateUser({
            where: {id: Number(userData.userId2)},
            data: {
              gameId: {
                push: Number(game.id)
              }
            },
          })
        return this.gameService.findOne(game.id);
      }
}