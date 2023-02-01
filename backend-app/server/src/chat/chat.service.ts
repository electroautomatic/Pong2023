import {Injectable} from '@nestjs/common';
import {Chat, Message, Prisma, User} from '@prisma/client';
import {PrismaService} from 'src/prisma.service';
import {UsersService} from 'src/users/users.service';
import {MessageUpdatePayload} from "types";
import {encodePassword} from 'src/utils/bcrypt';
import {CurrentGame, GameInvite, GameQueue, UsersOnline} from "../game_objects/game_objects.service";

@Injectable()
export class ChatService {
    constructor(private prisma: PrismaService,
                private usersOnline: UsersOnline,
                private gameQueue: GameQueue,
                private currentGame: CurrentGame,
                private gameInvite :GameInvite) {
    }

    async chat(
        chatWhereUniqueInput: Prisma.ChatWhereUniqueInput,
    ): Promise<Chat | null> {
        return this.prisma.chat.findUnique({
            where: chatWhereUniqueInput,
        });
    }

    async chats(params: {
        skip?: number;
        take?: number;
        cursor?: Prisma.ChatWhereUniqueInput;
        where?: Prisma.ChatWhereInput;
    }): Promise<Chat[]> {
        const {skip, take, cursor, where} = params;
        return this.prisma.chat.findMany({
            skip,
            take,
            cursor,
            where,
        });
    }


    async commonUsersChat(id: number, fid: number): Promise<Chat[] | undefined> {
        let chats: Chat[] = await this.prisma.chat.findMany({
            where: {
                chat: true,
                AND: [
                    {
                        participants: {
                            has: id,
                        },
                    },
                    {participants: {has: fid}},
                ]
            }
        })
        return chats
    }

    async messages(params: {
        skip?: number;
        take?: number;
        cursor?: Prisma.MessageWhereUniqueInput;
        where?: Prisma.MessageWhereInput;
        // orderBy?: Prisma.MessageOrderByRelationAggregateInput;
    }): Promise<Message[]> {
        const {skip, take, cursor, where} = params;
        return this.prisma.message.findMany({
            skip,
            take,
            cursor,
            where,
            // orderBy
            orderBy: {
                createdAt: "asc",
            },
        });
    }

    async findOne(id: number): Promise<Chat | undefined> {
        console.log(id);
        return this.chat({id: Number(id)});
        //return this.users.find(user => user.username === username);
    }

    async createChat(data: Prisma.ChatCreateInput): Promise<Chat> {
        //console.log(data.posts);
        // const chat = this.prisma.chat.create({
        //   data,
        // });
        // console.log(chat);
        // data.password = encodePassword(data.password);
        let chat: Chat = await this.prisma.chat.create({
            data,
        });
        console.log(chat);
        return chat;
    }

    async updateChat(params: {
        where: Prisma.ChatWhereUniqueInput;
        data: Prisma.ChatUpdateInput;
    }): Promise<Chat> {
        const {where, data} = params;
        return this.prisma.chat.update({
            data,
            where,
        });
    }

    // получение всех сообщений
    async getMessages(): Promise<Message[]> {
        return this.prisma.message.findMany();
    }

    // удаление всех сообщений - для отладки в процессе разработки
    async clearMessages(): Promise<Prisma.BatchPayload> {
        return this.prisma.message.deleteMany();
    }

    // создание сообщения
    async createMessage(data: Prisma.MessageCreateInput) {
        return this.prisma.message.create({data});
    }

    // обновление сообщения
    async updateMessage(payload: MessageUpdatePayload) {
        const {id, text} = payload;
        return this.prisma.message.update({where: {id}, data: {text}});
    }

    // удаление сообщения
    async removeMessage(where: Prisma.MessageWhereUniqueInput) {
        return this.prisma.message.delete({where});
    }

    addSocket(socketID, userID) {
        this.usersOnline.addUser(socketID, userID);
    }

    getUsersOnline(){
        return this.usersOnline.getUsersOnline()
    }

    deleteSocket(socketID) {
        let userID = this.usersOnline.getUserID(socketID)
        if (userID != -1) {
            this.gameQueue.deleteFromQueue(userID)
            this.gameInvite.deleteInvitesByUserId(userID)
            this.usersOnline.deleteUserBySocketID(socketID)
            let gameId = this.currentGame.getGameIdByPlayerID(userID)
            if (gameId != -1) {
                this.currentGame.setAborted(gameId)
            }
        }
    }

    updateSocket(socketID: string, UserID: number) {
        this.usersOnline.updateUserID(socketID, UserID);
    }

    isOnline(UserID: number) {
        return this.usersOnline.isUserOnline(UserID)
    }

    getUserID(socketID: string) {
        return this.usersOnline.getUserID(socketID)
    }
}
