import { Module } from "@nestjs/common";
import {JwtModule, JwtService} from "@nestjs/jwt";
import { UsersModule } from "src/users/users.module";
import {TwoFactorAuthenticationController} from "./twoFactorAuthentication.controller";
import {TwoFactorAuthenticationService} from "./twoFactorAuthentication.service";
import {PrismaService} from "../prisma.service";
import {UsersService} from "../users/users.service";
import {ChatService} from "../chat/chat.service";
import {AchievementsService} from "../achievements/achievements.service";
import {CurrentGame, GameInvite, GameQueue, UsersOnline} from "../game_objects/game_objects.service";

@Module({
    providers: [JwtService,GameInvite, TwoFactorAuthenticationService, UsersService, PrismaService, ChatService, UsersOnline, GameQueue, CurrentGame,AchievementsService],
    exports: [ TwoFactorAuthenticationService],
    controllers: [TwoFactorAuthenticationController]
})
export class TwoFactorAuthModule { }