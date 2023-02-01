import {Module} from "@nestjs/common";
import {PrismaService} from "../prisma.service";
import {ImageService} from "./image.service";
import {ImageController} from "./image.controller"
import {UsersService} from "../users/users.service";
import {ChatModule} from "../chat/chat.module";
import {ChatService} from "../chat/chat.service";
import {AchievementsService} from "../achievements/achievements.service";
import {CurrentGame, GameInvite, GameQueue, UsersOnline} from "../game_objects/game_objects.service";

@Module({
    providers: [PrismaService, UsersService, ImageService, ChatService, UsersOnline, GameQueue, CurrentGame, GameInvite, AchievementsService],
    exports: [ImageService],
    controllers: [ImageController]
})
export class ImageModule {
}