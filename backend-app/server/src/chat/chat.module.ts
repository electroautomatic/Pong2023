import {ImageService} from "../image/image.service";
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from 'src/auth/auth.service';
import { PrismaService } from 'src/prisma.service';
import { UsersService } from 'src/users/users.service';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { AchievementsService } from '../achievements/achievements.service';
import {CurrentGame, GameInvite, GameQueue, UsersOnline} from "../game_objects/game_objects.service";

@Module({
    providers: [PrismaService, UsersService, ImageService, ChatService, UsersOnline, GameQueue, CurrentGame, GameInvite, AchievementsService],
    exports: [],
    controllers: [ChatController]
})
export class ChatModule {
}
