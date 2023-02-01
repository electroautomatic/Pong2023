import {Module} from '@nestjs/common';
import {UsersService} from './users.service';
import {PrismaService} from 'src/prisma.service';
import {UsersController} from './users.controller';
import {ChatService} from "../chat/chat.service";
import {JwtService} from '@nestjs/jwt';
import {CurrentGame, GameInvite, GameQueue, UsersOnline} from "../game_objects/game_objects.service";
import {TwoFactorAuthenticationService} from "../twoFactorAuthentication/twoFactorAuthentication.service";
import {AchievementsService} from "../achievements/achievements.service";
import {AchievementsModule} from "../achievements/achievements.module";

@Module({
  providers: [JwtService,GameInvite, PrismaService, UsersService, ChatService, UsersOnline, GameQueue, TwoFactorAuthenticationService, AchievementsService,CurrentGame],
  exports: [UsersService],
  // imports: [AchievementsModule],
  controllers: [UsersController]
})
export class UsersModule {
}