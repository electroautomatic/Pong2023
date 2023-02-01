import {Injectable} from "@nestjs/common";
import { PrismaService } from 'src/prisma.service';
import {UsersService} from "../users/users.service";
import {Prisma, User} from '@prisma/client'

@Injectable()
export class ImageService {
    constructor(private prisma: PrismaService,
                private readonly userService: UsersService,
    ){}

    async updateUserAvatar(params: {
        where: Prisma.UserWhereUniqueInput;
        data: Prisma.UserUpdateInput;
    }): Promise<User> {
        const {where, data} = params;
        return this.prisma.user.update({
            data,
            where,
        });
    }
}

