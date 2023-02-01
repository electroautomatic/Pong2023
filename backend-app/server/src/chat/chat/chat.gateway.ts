import { MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer, ConnectedSocket} from "@nestjs/websockets";
import { Body , HttpException, HttpStatus} from "@nestjs/common";
// import { AppService } from "./app.service";
// import { AppService } from "src/app.service";
import { ChatService } from "../chat.service";
import { Prisma, User} from "@prisma/client";
import { Server, Socket } from "socket.io";
import { Req, UseGuards } from "@nestjs/common";
import { AuthService } from "src/auth/auth.service";
import { UsersService } from "src/users/users.service";
import { Chat } from "@prisma/client";
import { IoAdapter } from "@nestjs/platform-socket.io";
import { CurrentGame } from "src/game_objects/game_objects.service";
import { GameService } from "src/game/game.service";
// import { AuthService } from "./auth/auth.service";
// import { MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";

// @WebSocketGateway()
// export class ChatGateway{

//     @WebSocketServer()
//     server;

//     @SubscribeMessage('message')
//     handleMessage(@MessageBody() message : string) : void {
//         console.log("message recieved")
//         this.server.emit('message', message);
//     }
// }

export type JwtPayload = {
  name: string,
  id: number,
}

// const users: Record<string, string> = {};

@WebSocketGateway()
export class ChatGateway {

    constructor(private readonly chatService: ChatService, 
                private readonly authService: AuthService,
                private readonly usersService: UsersService, 
                private readonly currentGame: CurrentGame, 
                private readonly gameService: GameService) {}

    @WebSocketServer()
    server;

    @SubscribeMessage('message')
    handleMessage(@MessageBody() message : string) : void {
        this.server.emit('message', message);
    }

    @SubscribeMessage('messages:get')
    async handleMessagesGet(): Promise<void> {
      const messages = await this.chatService.getMessages();
      this.server.emit('messages', messages);
    }

    @SubscribeMessage('messages:clear')
    async handleMessagesClear(): Promise<void> {
      await this.chatService.clearMessages();
    }

    @SubscribeMessage("user:editAvatar")
    async handleAvatarEdit(@MessageBody() payload : {userId: number}) : Promise<void> {
      console.log("name edited");
      // const userEdit = await this.usersService.findOne(payload.userId)
      // const userEdit = await this.usersService.findOne(payload.userId)
      // console.log(userEdit);
      this.server.emit("user:avatarUpdate", payload.userId);
    }

    @SubscribeMessage("messages:editName")
    async handleMessageseditName(@MessageBody() payload : {userId: number, newUserName: string}) : Promise<void> {
      console.log("name edited");
      const user = await this.usersService.findOneByName(payload.newUserName);
      if (user)
      {
        this.server.emit("messages:editName:error", "username already exists");
        return ;
      }
      const userEdit = await this.usersService.updateUser({
        where: { id: Number(payload.userId) },
        data: { name: payload.newUserName },
      });
      // const userEdit = await this.usersService.findOne(payload.userId)
      // console.log(userEdit);
      this.server.emit("messages:editName", userEdit);
    }


    @SubscribeMessage("messages:editUser")
    async handleMessageseditUser(@MessageBody() payload : {userId: number}) : Promise<void> {
      const user = await this.usersService.findOne(payload.userId);
      // const userEdit = await this.usersService.findOne(payload.userId)
      // console.log(userEdit);
      this.server.emit("messages:editUser", user);
    }

    


    @SubscribeMessage("chats:requestUpdate")
    async getMessages(@MessageBody() payload : {participants: number[] }) : Promise<void> {
      console.log("chats:requestUpdate");
      this.server.emit("chats:requestUpdate", payload.participants);
      // return this.userService.findOne(req.user.id);
    }


    @SubscribeMessage("chat:requestUpdate:banList")
    async banListUpdate(@MessageBody() payload : {userId: number, banUserId: number, chatId: number }) : Promise<void> {
      const chat : Chat = await this.chatService.findOne(payload.chatId);
      console.log(chat)
      this.server.emit("chat:responseUpdate:banList", chat);
      // return this.chatService.findOne(payload.chatId);
      // const chat : Chat = await this.chatService.findOne(payload.chatId);
      // const index = chat.admins.indexOf(payload.userId, 0);
      // const index1 = chat.blackList.findIndex(x => x == payload.banUserId)
      // const index2 = chat.owner.findIndex(x => x == payload.banUserId)
      // if (index == -1){
      //   console.log("User not admin");
      //   throw new HttpException('User not admin', HttpStatus.FORBIDDEN); 
      // }
      // else if (index2 > -1) {
      //   throw new HttpException('Trying to ban Owner', HttpStatus.FORBIDDEN);
      // }
      // else{
      //   const index1 = chat.participants.indexOf(payload.banUserId);
      //   console.log(index1);
      //   chat.participants.splice(index1, 1);
      //   const user : User = await this.usersService.findOne(payload.banUserId);
      //   const index2 = user.chatId.indexOf(payload.chatId);
      //   user.chatId.splice(index2, 1);
      //   this.usersService.updateUser({
      //     where: {id: Number(payload.banUserId)},
      //     data: {chatId: user.chatId},
      //   })
      //   // console.log(participants);
      //   const chat1 = this.chatService.updateChat({
      //     where: { id: Number(payload.chatId) },
      //     data: {
      //       participants: chat.participants,
      //       blackList: {
      //         push: Number(payload.banUserId)
      //       }
      //     },
      //   });
      //   this.server.emit("chat:responseUpdate:banList", chat1);
      // }
      
      // return this.userService.findOne(req.user.id);
    }



    @SubscribeMessage("chat:requestUpdate:adminList")
    async adminListUpdate(@MessageBody() payload : {userId: number, adminUserId: number, chatId: number }) : Promise<void> {
      const chat : Chat = await this.chatService.findOne(payload.chatId);
      console.log(chat);
      this.server.emit("chat:responseUpdate:adminList", chat);
      // const index = chat.admins.findIndex(x => x == payload.userId)
      // const index1 = chat.admins.findIndex(x => x == payload.adminUserId)
      // if (index == -1) {
      //   console.log("User not admin");
      //   throw new HttpException('User not admin', HttpStatus.FORBIDDEN); 
      //   // return chat;
      // }
      // else if (index1 > -1) {
      //   // console.log((await chat).admins);
      //   chat.admins.splice(index1, 1)
      //   // console.log(admins);
      //   const chat1 = this.chatService.updateChat({
      //     where: { id: Number(payload.chatId) },
      //     data: {
      //       admins: chat.admins
      //     },
      //   });
      //   this.server.emit("chat:responseUpdate:adminList", chat1);
      // }
      // else{
      //   const chat2 = this.chatService.updateChat({
      //     where: { id: Number(payload.chatId) },
      //     data: {
      //       admins: {
      //         push: Number(payload.adminUserId)
      //       }
      //     },
      //   });
      //   this.server.emit("chat:responseUpdate:adminList", chat2);
      // }
    }

    @SubscribeMessage("chat:requestUpdate:muteList")
    async muteListUpdate(@MessageBody() payload : {userId: number, muteUserId: number, chatId: number }) : Promise<void> {
      const chat : Chat = await this.chatService.findOne(payload.chatId);
      // const index = chat.admins.findIndex(x => x == payload.userId)
      // const index1 = chat.muteList.findIndex(x => x == payload.muteUserId)
      // const index2 = chat.owner.findIndex(x => x == payload.muteUserId)
      // if (index == -1) {
      //   console.log("User not admin");
      //   throw new HttpException('User not admin', HttpStatus.FORBIDDEN);
      //   // return chat;
      // }
      // else if (index1 > -1) {
      //   // console.log((await chat).admins);
      //   chat.muteList.splice(index1, 1)
      //   // console.log(admins);
      //   const chat1 =  this.chatService.updateChat({
      //     where: { id: Number(payload.chatId) },
      //     data: {
      //       muteList: chat.muteList
      //     },
      //   });
      //   this.server.emit("chat:responseUpdate:muteList", chat1);
      // }
      // else if (index2 > -1) {
      //   throw new HttpException('Trying to mute Owner', HttpStatus.FORBIDDEN);
      // }
      // else{
      //   const chat2 = this.chatService.updateChat({
      //     where: { id: Number(payload.chatId) },
      //     data: {
      //       muteList: {
      //         push: Number(payload.muteUserId)
      //       }
      //     },
      //   });
        this.server.emit("chat:responseUpdate:muteList", chat);
      
    }
      
      // return this.userService.findOne(req.user.id);

    @SubscribeMessage("chat:requestUpdate:participants")
    async participantsListUpdate(@MessageBody() payload : {chatId: number,userId: number }) : Promise<void> {
        const chat : Chat = await this.chatService.findOne(payload.chatId);
        // const index = chat.admins.findIndex(x => x == payload.userId)
        // const index1 = chat.muteList.findIndex(x => x == payload.muteUserId)
        // const index2 = chat.owner.findIndex(x => x == payload.muteUserId)
        // if (index == -1) {
        //   console.log("User not admin");
        //   throw new HttpException('User not admin', HttpStatus.FORBIDDEN);
        //   // return chat;
        // }
        // else if (index1 > -1) {
        //   // console.log((await chat).admins);
        //   chat.muteList.splice(index1, 1)
        //   // console.log(admins);
        //   const chat1 =  this.chatService.updateChat({
        //     where: { id: Number(payload.chatId) },
        //     data: {
        //       muteList: chat.muteList
        //     },
        //   });
        //   this.server.emit("chat:responseUpdate:muteList", chat1);
        // }
        // else if (index2 > -1) {
        //   throw new HttpException('Trying to mute Owner', HttpStatus.FORBIDDEN);
        // }
        // else{
        //   const chat2 = this.chatService.updateChat({
        //     where: { id: Number(payload.chatId) },
        //     data: {
        //       muteList: {
        //         push: Number(payload.muteUserId)
        //       }
        //     },
        //   });
        this.server.emit("chat:responseUpdate:participants", {chat: chat,userId: payload.userId});

    }

    // return this.userService.findOne(req.user.id);


    // @UseGuards(JwtAuthGuard)
    @SubscribeMessage('message:post')
    async handleMessagePost(
      @MessageBody()
      payload:// { userId: string, text: string, ChatId: }
      Prisma.MessageCreateInput
    ): Promise<void> {
      console.log('handleMessagePost');

      const createdMessage = await this.chatService.createMessage(payload);
      this.server.emit('message:post', createdMessage);
    }

    @SubscribeMessage('giveMeID')
    async handleGiveMeID(
        @MessageBody()
            payload:
            {
                socketId: string,
                userId: number,
            }
    ): Promise<void> {
        if (payload.userId != -1) {
            this.chatService.updateSocket(payload.socketId, payload.userId)
            this.server.emit('user:online', {userId: payload.userId, isOnline: true});
            console.log(`client `, payload.userId, ' connected');
        }
    }

    @SubscribeMessage('user:isOnline')
    async isUserOnline(
        @MessageBody()
            payload:
            {
                userId: number,
            }
    ): Promise<void> {
            this.server.emit('user:isOnline', {userId: payload.userId, isOnline: this.chatService.isOnline(payload.userId)})
    }

    @SubscribeMessage('users:isOnline')
    async isUsersOnline(): Promise<void> {
        this.server.emit('users:isOnline', this.chatService.getUsersOnline())
    }

    async handleConnection(client: Socket, ...args: any[]) {
        const userName = client.handshake.query.userName as string;
        const socketId = client.id;
        client.emit("giveMeID", {socketID: socketId})
        // users[socketId] = userName;
        this.chatService.addSocket(socketId, -1)
        // client.broadcast.emit('log', `${userName} connected`);
      }

    async handleDisconnect(client: Socket) {
        const socketId = client.id;

        let userID = await this.chatService.getUserID(socketId)

        let gameId = this.currentGame.getGameIdByPlayerID(userID);
        this.gameService.deleteGame(gameId);
        this.server.emit('game:finish', {gameId: gameId, leftUserId: 0, rightUserId: 0, leftPlayerScore: 0,
            rightPlayerScore: 0 , error: true});
        
        this.chatService.deleteSocket(socketId)


 

        if (userID != -1) {
            this.server.emit('user:online', {userId: userID, isOnline: false});
            console.log(`client `, userID, ' disconnected');
        }
      }
}