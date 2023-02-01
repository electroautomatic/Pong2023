import {Injectable, Inject, forwardRef} from '@nestjs/common';
import {PrismaService} from "../prisma.service";
import {Prisma, User, Achievements} from "@prisma/client";
import {titles, description} from "../additional_files/enums";
import {UsersService} from "../users/users.service";
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';


@Injectable()
export class AchievementsService {
    constructor(private prisma: PrismaService,
                @Inject(forwardRef(() => UsersService))
                private readonly usersService: UsersService,
    ) {}

    async achievements(
        achievementWhereUniqueInput: Prisma.AchievementsWhereUniqueInput,
    ): Promise<Achievements | null> {
        return this.prisma.achievements.findUnique({
            where: achievementWhereUniqueInput,
        });
    }

    async achieveObtain(achieves: number[], idAchieve: number) : Promise<boolean>{
        if (achieves.includes(idAchieve + 1))
            return true;
        else
            false
    }

    async tableExist() : Promise<boolean> {
        const achiv = (await this.prisma.achievements.findUnique({
            where: {key: 1}
        }))
        if (achiv)
            return true;
        else
            return false;
    }

    async tableCreate(){
        for (let i = 0; i < 6; i++){
            await this.achieveCreate({
                name: titles[i],
                description: description[i],
                key: i,
            });
        }
    }

    async achieveCreate(data: Prisma.AchievementsCreateInput){
        console.log("Table creation")
        return this.prisma.achievements.create({
            data,
        })
    }


    async secondAchieve(id: Number){
        await this.usersService.updateUser({
            where: {id: Number(id)},
            data: {
                achievementsId: {
                    push: 2
                }
            },
        })
    }

    async thirdAchieve(id: Number){
        await this.usersService.updateUser({
            where: {id: Number(id)},
            data: {
                achievementsId: {
                    push: 3
                }
            },
        })
    }

    async fourthAchieve(id: Number){ // FOURTH
        await this.usersService.updateUser({
            where: {id: Number(id)},
            data: {
            achievementsId: {
                push: 4
            }
        },
        })
    }

    async fifthAchieve(id: Number){
        await this.usersService.updateUser({
            where: {id: Number(id)},
            data: {
                achievementsId: {
                    push: 5
                }
            },
        })
    }

    async sixthAchieve(id: Number){
        await this.usersService.updateUser({
            where: {id: Number(id)},
            data: {
                achievementsId: {
                    push: 6
                }
            },
        })
    }
}

