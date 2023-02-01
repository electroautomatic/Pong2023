import { Module } from '@nestjs/common';
import {PrismaService} from "../prisma.service";
import { AuthService} from "../auth/auth.service";
import {UsersService} from "../users/users.service";
import {JwtService} from "@nestjs/jwt";
import {ConfigService} from "@nestjs/config";
import {GameService} from "./game.service";
import {GameController} from "./game.controller";
import {ChatService} from "../chat/chat.service";
import {GameObjectsModule} from "../game_objects/game_objects_module";
import {GameInvite, GameQueue, UsersOnline} from "../game_objects/game_objects.service";
import {AppModule} from "../app.module";
import {AchievementsService} from "../achievements/achievements.service";

@Module({
    imports: [GameObjectsModule],
    providers: [PrismaService, GameService, AuthService, UsersService, JwtService, ConfigService, ChatService, UsersOnline, GameInvite, AchievementsService],
    exports: [],
    controllers: [GameController]
})
export class GameModule {}
