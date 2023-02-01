import { Controller, Get, Post, Body, Param, ParseIntPipe, NotFoundException, Put, Req, UseGuards} from '@nestjs/common';
import { UsersService } from './users.service';
import { ChatService } from 'src/chat/chat.service'
//import { User as UserModel } from '@prisma/client';
import {Chat, Message, User} from '@prisma/client';
import { encodePassword } from 'src/utils/bcrypt';
import { use } from 'passport';
import { find } from 'rxjs';
// import { TwoFactorJwtAuthGuard } from 'src/auth/guards/jwt-auth.guards';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guards';
import { LocalAuthGuard } from 'src/auth/auth.guards';
import { Request } from './request.interface';
import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import {isBooleanObject} from "util/types";
import {AchievementsService} from "../achievements/achievements.service";
import * as enums from "../additional_files/enums"
import {UsersOnline} from "../game_objects/game_objects.service";


enum array {
  F = "friends",
  B = "block",
  C = "chat"
}

export const ReqUser = createParamDecorator(
    (data: unknown, ctx: ExecutionContext) => {
        const req = ctx.switchToHttp().getRequest();
        return req.user;
    },
);

@Controller()
export class UsersController {
  constructor(private readonly usersService: UsersService,
              private readonly chatService: ChatService,
              private readonly achievService: AchievementsService,
              private usersOnline: UsersOnline) {}

  // ** Common controllers

  @Get('users')
  async getUsers(): Promise<User[]> {
    let listUsers = await this.usersService.users({});
    for (let item of listUsers){
      item['isOnline'] = this.chatService.isOnline(item.id)
    }
    return listUsers
  }

  @Get(':id')
  async findOne(@Param('id', new ParseIntPipe()) id: number): Promise<User> {
    const user: User = await this.usersService.findOne(id);
    if (!user) throw new NotFoundException();
    return user;
  }

  // Common controllers **

  // ** Friends controllers

  @UseGuards(JwtAuthGuard)
  @Get('user/friend/friendlist')
  async getFriendList(@Req() req : any): Promise<User[]>{
    const user: User = await this.usersService.findOne(req.user.id)

    return this.usersService.findMany(user.friends)
  }

  @UseGuards(JwtAuthGuard)
  @Put('user/friend/add/:fid')
  async addUserFriend(@Req() req : any, @Param('fid', new ParseIntPipe()) fid: number): Promise<User> {
    const user: User = await this.usersService.findOne(req.user.id);
    const index = user.friends.findIndex(x => x==fid);
    if (index == -1) {
      user.friends.push(fid);
    }
    if (!(await this.achievService.achieveObtain(user.achievementsId, enums.titles["Mate"])))
      await this.achievService.fourthAchieve(user.id)
    if (!(await this.achievService.achieveObtain(user.achievementsId, enums.titles["Man of the world"])) &&
      user.friends.length > 2)
      await this.achievService.fifthAchieve(user.id)
    return this.usersService.updateUser({
      where: { id: Number(req.user.id) },
      data: { friends : user.friends},
    });
  }

  @UseGuards(JwtAuthGuard)
  @Put('user/friend/delete/:fid')
  async deleteUserFriend(@Req() req : any, @Param('fid', new ParseIntPipe()) fid: number): Promise<User> {
    const user: User = await this.usersService.findOne(req.user.id);
    const index = user.friends.findIndex(x => x==fid);
    if (index > -1) {
      user.friends.splice(index, 1);
    }
    return this.usersService.updateUser({
      where: { id: Number(req.user.id) },
      data: { friends : user.friends},
    });
  }

  // Friends controller **

  // ** Block controllers

  @UseGuards(JwtAuthGuard)
  @Get('user/block/list')
  async getBlockList(@Req() req : any): Promise<User[]>{
    const user: User = await this.usersService.findOne(req.user.id)

    return this.usersService.findMany(user.blackList)
  }

  @UseGuards(JwtAuthGuard)
  @Put('user/block/:bid')
  async blockUser(@Req() req : any, @Param('bid', new ParseIntPipe()) bid: number): Promise<User> {
    let numbers: Promise<number[] | undefined> = this.usersService.arrayOfValuesUser(req.user.id, enums.service.B)
    let block = await this.usersService.arrayOfValuesUser(req.user.id, enums.service.A);
    console.log(block.length)
    if (numbers && (await numbers).includes(bid)) {
      (await numbers).splice((await numbers).indexOf(bid), 1)
      return this.usersService.updateUser({
        where: {id: Number(req.user.id)},
        data: {blackList: (await numbers)},
      })
    } else {
      if (!(await this.achievService.achieveObtain(block, enums.titles["I hate people"])) &&
          block.length > 2){
          this.achievService.sixthAchieve(req.user.id)  
      }
      return this.usersService.updateUser({
        where: {id: Number(req.user.id)},
        data: {
          blackList: {
            push: Number(bid)
          }
        },
      })
    }
  }

  @UseGuards(JwtAuthGuard)
  @Put('user/changeName')
  async updateUserName(@Req() req : any,
    @Body() userData: { name?: string;}): Promise<User> {
    return this.usersService.updateUser({
      where: { id: Number(req.user.id) },
      data: { name: userData.name },
    });
  }

  @UseGuards(JwtAuthGuard)
  @Put('user/changeCustom')
  async updateCustom(@Req() req : any): Promise<User> {
    const user: User = await this.usersService.findOne(req.user.id);
    let customBool = !user.custom;

    return this.usersService.updateUser({
      where: { id: Number(req.user.id) },
      data: { custom: customBool },
    });
  }



  @Put('user/:id/add/:aid')
  async newContact(@Param('id', new ParseIntPipe()) id: number, @Param('aid', new ParseIntPipe()) aid: number) : Promise<Chat | undefined>{
    let arrayOfChats = await this.chatService.commonUsersChat(id, aid);
    if (arrayOfChats.length === 0){
      return this.chatService.createChat({
        chat: true,
        participants: [Number(id), Number(aid)],
          }
      )
    }
    else{
      return arrayOfChats[0];
    }
  }

  @Put('user/wins/:id')
  async updateUserWins(@Param('id', new ParseIntPipe()) id: number): Promise<User> {
    const user: User = await this.usersService.findOne(id);
    return this.usersService.updateUser({
      where: { id: Number(id) },
      data: { games : user.games + 1 ,
              wines : user.wines + 1 ,
              level : user.level + 20},
    });
  }

  @Put('user/loses/:id')
  async updateUserLoses(@Param('id', new ParseIntPipe()) id: number): Promise<User> {
    const user: User = await this.usersService.findOne(id);
    return this.usersService.updateUser({
      where: { id: Number(id) },
      data: { games : user.games + 1 ,
              loses : user.loses + 1 ,
              level : user.level - 5},
    });
  }

  @Put('all/search/user')
  async findManyBySearch(@Body() userData: { name?: string }) : Promise<User[]>{
    // userData.name = "New"
    return this.usersService.users({where: {
      name: {
        // search: userData.name,
        startsWith: userData.name
      }
    }
  });
  }

}