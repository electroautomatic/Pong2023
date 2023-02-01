import { Injectable } from '@nestjs/common';
import { User, Prisma, Chat } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';

import internal from "stream";
import {ChatService} from "../chat/chat.service";
import {AchievementsService} from "../achievements/achievements.service";
import * as enums from "../additional_files/enums"
//import { User } from '@prisma/client';

// This should be a real class/interface representing a user entity
//export type User = any;


@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService,
              private readonly chatService: ChatService,
              private readonly achievService: AchievementsService,
  ){
  }

  // private readonly users = [
  //   {
  //     userId: 1,
  //     username: 'john',
  //     password: 'changeme',
  //   },
  //   {
  //     userId: 2,
  //     username: 'maria',
  //     password: 'guess',
  //   },
  // ];

  async user(
      userWhereUniqueInput: Prisma.UserWhereUniqueInput,
  ): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: userWhereUniqueInput,
    });
  }

  async users(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.UserWhereUniqueInput;
    where?: Prisma.UserWhereInput;
  }): Promise<User[]> {
    const {skip, take, cursor, where} = params;
    return this.prisma.user.findMany({
      skip,
      take,
      cursor,
      where,
    });
  }

  // ** Support service functions
  async friendsList(id: number): Promise<number[] | undefined> {
    let user: User = await this.findOne(id)
    return user.friends;
  }

  async blackList(id: number): Promise<number[] | undefined> {
    let user: User = await this.findOne(id)
    return user.blackList;
  }

  async chatList(id: number): Promise<number[] | undefined> {
    let user: User = await this.findOne(id)
    return user.chatId;
  }

  async achieveList(id: number): Promise<number[] | undefined> {
      let user: User = await this.findOne(id)
      return user.achievementsId;
    }

  async arrayOfValuesUser(id: number, value: string): Promise<number[] | undefined> {
    if (value === enums.service.F)
      return this.friendsList(id)
    if (value === enums.service.B)
      return this.blackList(id)
    if (value === enums.service.C)
      return this.chatList(id)
    if (value === enums.service.A)
      return this.achieveList(id)

  }

  async findOne(id: number): Promise<User | undefined> {
    return this.user({id: Number(id)});
  }

  // Support service functions **

  // ** Find service functions

  async findMany(ids: number[]): Promise<User[] | undefined> {
    let users: User[] = await this.prisma.user.findMany({
      where: {
        id: {in: ids},
      }
    })
    return users;
  }

  async findOneByIntraId(ecole42Id: number): Promise<User | undefined> {
    return this.user({ecole42Id: Number(ecole42Id)});
  }

  async findOneByName(username: string): Promise<User | undefined> {
    return this.user({name: String(username)});
  }
  // Find service functions **



  async createUser(data: Prisma.UserCreateInput): Promise<User> {
    if (!(await this.achievService.tableExist())) {
      await this.achievService.tableCreate();
    }
    return this.prisma.user.create({
      data,
    });
  }

  async updateUser(params: {
    where: Prisma.UserWhereUniqueInput;
    data: Prisma.UserUpdateInput;
  }): Promise<User> {
    const {where, data} = params;
    return this.prisma.user.update({
      data,
      where,
    });
  }

  // async updateUserAvatar(userData: any): Promise<any>{
  //   const userId = Number(userData.userId);
  //   const avatarURL = userData.avatarURL;
  //   return this.updateUser({id: userId, avatar: avatarURL});
  //
  // }


  async deleteUser(where: Prisma.UserWhereUniqueInput): Promise<User> {
    return this.prisma.user.delete({
      where,
    });
  }

  async setTwoFactorAuthenticationSecret(secret: string, userId: number) {
    return this.updateUser({
      where: {id: userId},
      data: {twoFactorSecret: secret}
    })
    }

}
//   async blockUserAdd(id: Number, bid: Number): Promise<User>{
//
//   }
//
//   async blockUserDelete(id: Number, bid: Number): Promise<User>{
//
//   }

// async updateUserBlock(params: {
//   where: Prisma.UserWhereInput;
//   data: Prisma.UserUpdateInput; }): Promise<User> {
//   const { where, data}
//
// }
// })

// async friendsList(params: {
//   where?: Prisma.UserWhereUniqueInput;
//
// })
// async findOne(username: string): Promise<User> {
//    console.log(username);
//    return this.user({ name: String(username) });
//    //return this.users.find(user => user.username === username);
//  }

// async friendList(User: User): Promise<number[] | undefined>{
//   const user = User;
//
//   return this.user.friends(where )
// }

//  findOneId(id: number): Promise<User> {
//   return this.user.findOneBy({ id });
// }