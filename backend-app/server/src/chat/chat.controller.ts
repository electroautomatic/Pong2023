import { Controller, Get, Post, Body, Param, ParseIntPipe, NotFoundException, Put, Req, UseGuards, HttpException, HttpStatus} from '@nestjs/common';
import { Chat, User } from '@prisma/client';
import { ChatService } from './chat.service';
import { Message } from '@prisma/client';
import { UsersService } from 'src/users/users.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guards';
import { comparePassword } from 'src/utils/bcrypt';
import { encodePassword } from 'src/utils/bcrypt';
import { tmpdir } from 'os';


@Controller()
export class ChatController {
  constructor(private readonly chatService: ChatService,
    private readonly userService: UsersService) {}

  @Get('all/chats')
  async getChats(): Promise<Chat[]>{
    return this.chatService.chats({});
  }

  // @UseGuards(JwtAuthGuard)
  // @Get('all/chats/:id')
  // async getUserChats(@Param('id', new ParseIntPipe()) id : number): Promise<Chat[]>{
  //   const user = this.userService.findOne(id);
  //   // console.log((await user).chatId);
  //   const ChatId = (await user).chatId;
  //   return this.chatService.chats({
  //     where: {
  //             id: { in: ChatId },
  //         }
  //       });
  // }

  @UseGuards(JwtAuthGuard)
  @Get('all/chats/user')
  async getUserChats(@Req() req : any): Promise<Chat[]>{
    const user = await this.userService.findOne(req.user.id);
    console.log((await user).chatId);
    const ChatId = (await user).chatId;
    return this.chatService.chats({
      where: {
              id: { in: ChatId },
          }
        }); 
  }

  
  @Get('chat/:id/messages')
  async getMessages(@Param('id', new ParseIntPipe()) id : number): Promise<Message[]>{
    return this.chatService.messages({where: {ChatId : id}});
  }

  @Get('chat/:id')
  async findOne(@Param('id', new ParseIntPipe()) id : number) : Promise<Chat>{
    const chat : Chat = await this.chatService.findOne(id);
    if (!chat) throw new NotFoundException();
    return chat;
  }

  @UseGuards(JwtAuthGuard)
  @Post('chat/create')
  async createChat(@Req() req : any, @Body() userData: { name?: string; chat?: boolean; public : boolean; password?: string; requestPass?: boolean; participants: number[] }) : Promise<Chat>{
    // userData.chat = false
    // userData.participants.push(req.user.id);
    // userData.participants.push(5);
    let tmp : boolean = userData.public
    if (userData.chat == true)
      tmp = false
    
    let password = userData.password;
    if(userData.password.length !== 0)
      password = encodePassword(password);
    
    console.log("password is " + password + " " + userData.requestPass);
    // userData.participants = [ Number(req.user.id)]
    // req.user.id;
    let chat : Chat = await this.chatService.createChat({
      name: userData.name,
      chat: userData.chat,
      public: tmp,
      password: password,
      requestPass : userData.password.length !== 0,
      participants: userData.participants,
      owner: [Number(req.user.id)],
      admins : [Number(req.user.id)]
        });
    console.log(userData.participants);
    for (let index = 0; index < userData.participants.length; index++) {
      await this.userService.updateUser({
        where: {id: Number(userData.participants[index])},
        data: {
          chatId: {
            push: Number(chat.id)
          }
        },
      })
    }
    return chat;
  }

@UseGuards(JwtAuthGuard)
@Post('chat/join')
async joinChat(@Req() req : any, @Body() userData: {chatId : number, password: string} ) : Promise <User> | null{
    // return this.userService.findOne(req.user.id);
    console.log(userData)
    const chat = await this.chatService.findOne(userData.chatId);
    console.log('>>> ' + (await chat).password + ':' + userData.password);
    if ((chat.requestPass == false) || (chat.requestPass == true && comparePassword(userData.password, chat.password)) ) {
      const index1 = chat.participants.indexOf(req.user.id);
      if (index1 > -1) return null;
      await this.chatService.updateChat({
        where: { id: Number(userData.chatId) },
        data: {
          participants: {
          push: Number(req.user.id)
          }
        }
      })
      return this.userService.updateUser({
        where: {id: Number(req.user.id)},
        data: {
          chatId: {
            push: Number(userData.chatId)
          }
        },
      })
    }
    else{
      console.log('>>> 3' + (await chat).password + ':' + userData.password);
      throw new HttpException('Wrong password', HttpStatus.UNAUTHORIZED);
      // return null;
    }
      
    // return chat;
  }

  @UseGuards(JwtAuthGuard)
@Post('chat/changePassword')
async changePassword(@Req() req : any, @Body() userData: {chatId : number, password: string} ) : Promise <Chat> {
    // return this.userService.findOne(req.user.id);
    console.log(userData)
    const chat = await this.chatService.findOne(userData.chatId);
    let password = userData.password;
    if (chat.requestPass == false)
    {
      password = encodePassword(password);
      console.log('>>> ' + (await chat).password + ':' + userData.password);
      return this.chatService.updateChat({
        where: { id: Number(userData.chatId) },
        data: {
          password: password,
          requestPass : true,
        }
      })
    }
    else 
    {
      if(userData.password.length !== 0)
      {
        password = encodePassword(password);
        console.log('>>> ' + (await chat).password + ':' + userData.password);
        return this.chatService.updateChat({
          where: { id: Number(userData.chatId) },
          data: {
            password: password,
          }
        })
      }
      else {
        return this.chatService.updateChat({
          where: { id: Number(userData.chatId) },
          data: {
            password: password,
            requestPass : false, 
          }
        })
      }
    }
  }


  @UseGuards(JwtAuthGuard)
  @Put('leave/chat')
  async leaveChat(@Req() req : any, @Body() userData: {chatId : number}) : Promise<Chat> {
    const chat : Chat = await this.chatService.findOne(userData.chatId);
    const index1 = chat.participants.indexOf(req.user.id);
    const indexa = chat.admins.indexOf(req.user.id);
    const indexo = chat.owner.indexOf(req.user.id);
    console.log(index1);
    if (index1 == -1)
        return chat;
    if (indexo != -1)
        throw new HttpException('You are owner you can not leave chat', HttpStatus.FORBIDDEN);
    if(chat.admins.length == 1 && chat.admins[0] == req.user.id)
        throw new HttpException('You are last admin you can not leave chat', HttpStatus.FORBIDDEN);
    chat.participants.splice(index1, 1);
    chat.admins.splice(indexa, 1);
    const user : User = await this.userService.findOne(req.user.id);
    const index2 = user.chatId.indexOf(userData.chatId);
    user.chatId.splice(index2, 1);
    await this.chatService.updateChat({
      where: {id: Number(userData.chatId)},
      data: {participants: chat.participants, admins: chat.admins},
    })
    await this.userService.updateUser({
      where: {id: Number(req.user.id)},
      data: {chatId: user.chatId},
    })
    return chat;
  }


  @Put('all/chats/search')
  async findManyBySearch(@Body() userData: { name?: string}) : Promise<Chat[]>{
    // userData.name = "New"
    console.log(userData);
    return this.chatService.chats({where: {
      public : true,
      name: {
        // search: userData.name,
        startsWith: userData.name
      }
    }
  });
    // const chat : Chat = await this.chatService.chats({});
    // if (!chat) throw new NotFoundException();
    // return chat;
  }

  @UseGuards(JwtAuthGuard)
  @Put('chat/:id/setadmin/:aid')
  async setAdmin(@Req() req : any, @Param('id', new ParseIntPipe()) id: number, @Param('aid', new ParseIntPipe()) aid: number) : Promise<Chat> {
    const chat : Chat = await this.chatService.findOne(id);
    const index = chat.admins.findIndex(x => x == req.user.id)
    const index1 = chat.admins.findIndex(x => x == aid)
    if (index == -1) {
      console.log("User not admin");
      return chat;
    }
    else if (index1 > -1) {
      // console.log((await chat).admins);
      chat.admins.splice(index1, 1)
      // console.log(admins);
      return this.chatService.updateChat({
        where: { id: Number(id) },
        data: {
          admins: chat.admins
        },
      });
    }
    else{
      return this.chatService.updateChat({
        where: { id: Number(id) },
        data: {
          admins: {
            push: Number(aid)
          }
        },
      });
    }
  }


  @UseGuards(JwtAuthGuard)
  @Put('chat/:id/setmute/:mid')
  async setMuteUser(@Req() req : any, @Param('id', new ParseIntPipe()) id: number, @Param('mid', new ParseIntPipe()) mid: number) : Promise<Chat> {
    const chat : Chat = await this.chatService.findOne(id);
    const index = chat.admins.indexOf(req.user.id, 0);
    const index1 = chat.muteList.findIndex(x => x == mid)
    const index2 = chat.owner.findIndex(x => x == mid)
    if (index == -1){
      console.log("User not admin");
      return chat;
    }
    else if (index2 > -1) {
      throw new HttpException('Trying to mute Owner', HttpStatus.FORBIDDEN);
    }
    else if (index1 > -1) {
      chat.muteList.splice(index1, 1);
      return this.chatService.updateChat({
        where: { id: Number(id) },
        data: {
          muteList: chat.muteList
        },
      });
    }
    else{
      // const index1 = chat.participants.indexOf(bid);
      // console.log(index1);
      // chat.participants.splice(index1, 1);
      // const user : User = await this.userService.findOne(bid);
      // const index2 = user.chatId.indexOf(id);
      // user.chatId.splice(index2, 1);
      // this.userService.updateUser({
      //   where: {id: Number(bid)},
      //   data: {chatId: user.chatId},
      // })
      // console.log(participants);
      return this.chatService.updateChat({
        where: { id: Number(id) },
        data: {
          // participants: chat.participants,
          muteList: {
            push: Number(mid)
          }
        },
      });
    }
    // const chat : Chat = await this.chatService.findOne(id);
    // const index = chat.admins.findIndex(x => x == req.user.id)
    // const index1 = chat.muteList.findIndex(x => x == mid)
    // const index2 = chat.owner.findIndex(x => x == mid)
    // if (index == -1) {
    //   console.log("User not admin");
    //   throw new HttpException('User not admin', HttpStatus.FORBIDDEN);
    //   // return chat;
    // }
    // else if (index1 > -1) {
    //   // console.log((await chat).admins);
    //   chat.muteList.splice(index1, 1)
    //   // console.log(admins);
    //   return this.chatService.updateChat({
    //     where: { id: Number(id) },
    //     data: {
    //       muteList: chat.muteList
    //     },
    //   });
    // }
    // else if (index2 > -1) {
    //   throw new HttpException('Trying to mute Owner', HttpStatus.FORBIDDEN);
    // }
    // else{
    //   return this.chatService.updateChat({
    //     where: { id: Number(id) },
    //     data: {
    //       muteList: {
    //         push: Number(mid)
    //       }
    //     },
    //   });
    // }
  }


  @UseGuards(JwtAuthGuard)
  @Put('chat/:id/ban/:bid')
  async banUser(@Req() req : any, @Param('id', new ParseIntPipe()) id: number, @Param('bid', new ParseIntPipe()) bid: number){
    const chat : Chat = await this.chatService.findOne(id);
    const index = chat.admins.indexOf(req.user.id, 0);
    const index1 = chat.blackList.findIndex(x => x == bid)
    const index2 = chat.owner.findIndex(x => x == bid)
    if (index == -1){
      console.log("User not admin");
      return chat;
    }
    else if (index2 > -1) {
      throw new HttpException('Trying to ban Owner', HttpStatus.FORBIDDEN);
    }
    else if (index1 > -1) {
      chat.blackList.splice(index1, 1);
      return this.chatService.updateChat({
        where: { id: Number(id) },
        data: {
          blackList: chat.blackList
        },
      });
    }
    else{
      const index1 = chat.participants.indexOf(bid);
      console.log(index1);
      chat.participants.splice(index1, 1);
      const user : User = await this.userService.findOne(bid);
      const index2 = user.chatId.indexOf(id);
      user.chatId.splice(index2, 1);
      this.userService.updateUser({
        where: {id: Number(bid)},
        data: {chatId: user.chatId},
      })
      // console.log(participants);
      return this.chatService.updateChat({
        where: { id: Number(id) },
        data: {
          participants: chat.participants,
          blackList: {
            push: Number(bid)
          }
        },
      });
    }
  }
}


  
  // @Put('/me')
  // async updateUser(
  //   @Body() userData: { name?: string; email: string; password?: string }, 
  // ): Promise<User> {
  //   return this.usersService.updateUser(userData);
  // }