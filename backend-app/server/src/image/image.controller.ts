import {Controller, FileTypeValidator, MaxFileSizeValidator} from "@nestjs/common";
import {UsersService} from "../users/users.service";
import {ImageService} from "./image.service";
import {ChatService} from "../chat/chat.service";
import {ParseFilePipe, Body, PipeTransform, Injectable, ArgumentMetadata, UseInterceptors, UploadedFile, Get, Param, Req, Res, UseGuards, Post} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express';
import { Express } from 'express'
import {PrismaService} from "../prisma.service";
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guards';
import { diskStorage } from 'multer';
import { extname } from 'path';


@Controller()
export class ImageController {
    constructor(private readonly usersService: UsersService,
                private readonly chatService: ChatService,
                private readonly imageService: ImageService,
                private prisma: PrismaService) {
    }

    SERVER_URL = 'http://localhost:3001/';


    @UseGuards(JwtAuthGuard)
    @Get('avatar/me')
    async downloadAvatarMe(@Res() res, @Req() req: any): Promise<any> {
        res.sendFile((await this.usersService.findOne(req.user.id)).avatar, {root: 'uploads'});
    }

    @Get('avatar/group')
    async downloadAvatarGroup(@Res() res): Promise<any>{
        res.sendfile('42.jpg', {root: 'uploads'});
    }

    @Get('avatar/:userId')
    async downloadAvatar(@Param('userId') userId, @Res() res: any): Promise<any> {
        res.sendFile((await this.usersService.findOne(userId)).avatar, {root: 'uploads'});
    }
    @UseGuards(JwtAuthGuard)
    @Post('avatar')
    @UseInterceptors(FileInterceptor('file',
            {
                storage: diskStorage({
                    destination: './uploads',
                    filename: (req, file, cb) => {
                        const randomName = Array(32).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('')
                        return cb(null, `${randomName}${extname(file.originalname)}`)
                    }
                })
            }
        )
    )
    async uploadAvatar(@Body() body, @UploadedFile(
        new ParseFilePipe({
            validators: [
                new MaxFileSizeValidator({ maxSize: 230000 }),
                new FileTypeValidator({ fileType: '.(png|jpeg|jpg)' }),
            ],
        }),
    )
        file, @Req() req : any) {
        console.log(body);
        if (file != undefined) {
            await this.imageService.updateUserAvatar({
                where: {id: req.user.id},
                data: {avatar: `${file.filename}`}
            });
            return  {
                avatar: `${this.SERVER_URL}${file.path}`
            };
        }
    }
}