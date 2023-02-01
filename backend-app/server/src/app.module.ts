import { Module } from "@nestjs/common";
// import { AppService } from "./app.service";
// !
// import { AppGateway } from "./app.gateway";
import { PrismaService } from "./prisma.service";
import { AppController } from "./app.controller";
import { UsersService } from "./users/users.service";
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ConfigService } from "@nestjs/config";
import { LoginModule } from './login/login.module';
import { GameService } from './game/game.service';
import { GameModule } from './game/game.module';
import { ChatModule } from './chat/chat.module';
import { JwtService } from "@nestjs/jwt";
// import { ChatGateway } from "./chat.gateway";
import { ChatGateway } from "./chat/chat/chat.gateway";
import { ChatService } from "./chat/chat.service";
import {ImageModule} from "./image/image.module";
import {GameGateway} from "./game/game/game.gateway";
import {GameObjectsModule} from "./game_objects/game_objects_module";
import {TwoFactorAuthModule} from "./twoFactorAuthentication/twoFactorAuthentication.module";
import {GameQueue, UsersOnline} from "./game_objects/game_objects.service";
import {TwoFactorAuthenticationService} from "./twoFactorAuthentication/twoFactorAuthentication.service";
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AchievementsController } from './achievements/achievements.controller';
import { AchievementsService } from './achievements/achievements.service';
import { AchievementsModule } from './achievements/achievements.module';
import {UsersController} from "./users/users.controller";

@Module({
  imports: [ServeStaticModule.forRoot({
    rootPath: join(__dirname, 'uploads'),
  }),
    AuthModule, UsersModule, AchievementsModule, LoginModule,  TwoFactorAuthModule,
    GameModule, ChatModule, GameModule, ImageModule, GameObjectsModule],
  //controllers: [],
  controllers: [AppController, AchievementsController, UsersController],
  // !
  providers: [ConfigService, JwtService, ChatGateway, PrismaService, ChatService, GameService, GameGateway, TwoFactorAuthenticationService, UsersService, AchievementsService, GameQueue],
  // controllers: [AppController],
  // providers: [PrismaService ,AppService, UserService],
  // imports: [AuthModule, UsersModule],
  //imports: [AuthModule, UsersModule],
})
export class AppModule {}

