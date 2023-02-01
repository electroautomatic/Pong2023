import { Module } from '@nestjs/common';
import {CurrentGame, GameInvite, GameQueue, UsersOnline} from "./game_objects.service";
import {GameService} from "../game/game.service";
import {GameModule} from "../game/game.module";
import {PrismaService} from "../prisma.service";


@Module({
  // imports: [GameModule],
  providers: [GameQueue, UsersOnline, CurrentGame, GameInvite, PrismaService],
  exports: [GameQueue, UsersOnline, CurrentGame, GameInvite]
})
export class GameObjectsModule {}