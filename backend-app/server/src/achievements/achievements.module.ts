import { Module } from '@nestjs/common';
import {PrismaService} from "../prisma.service";
import {UsersService} from "../users/users.service";
import {ChatService} from "../chat/chat.service";
import {AchievementsService} from "./achievements.service";
import {ConfigService} from "@nestjs/config";
import {UsersModule} from "../users/users.module";
import {CurrentGame, GameInvite, GameQueue, UsersOnline} from "../game_objects/game_objects.service";

@Module({
    imports: [UsersModule],
    providers: [PrismaService, UsersService, ChatService,CurrentGame, AchievementsService, UsersOnline, GameQueue, GameInvite],
    exports: [AchievementsService]
})
export class AchievementsModule {}
