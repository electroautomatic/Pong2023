import {Injectable, ParseIntPipe, UnauthorizedException} from '@nestjs/common';
import { authenticator } from 'otplib';
import { UsersService } from '../users/users.service'
import { toFileStream } from 'qrcode';
import { Response } from 'express';
import { User } from '@prisma/client'
import { toDataURL } from "qrcode";
import {JwtService} from '@nestjs/jwt';
import {JwtPayload} from "../auth/payload.interface";
import {jwtConstants} from "../auth/auth.constants";


@Injectable()
export class TwoFactorAuthenticationService {
    constructor (
        private readonly usersService: UsersService,
        private readonly jwtService: JwtService,
    ) {}

    async turnOnOf(id: number) : Promise<boolean> {
        let user = (await this.usersService.findOne(id))
        if (user.twoFactorEnabled){
            this.usersService.updateUser({
                where: {id: user.id},
                data: {twoFactorEnabled: false}
            })
            return false;
        }
        else{
            return true
        }
    }

    async generateTwoFactorAuthenticationSecret(req : any) {
        const user = req.user
        const secret = authenticator.generateSecret();
        const otpauth = authenticator.keyuri(
            user.mail,
            "BEST_TRANSCENDENCE_VERIFICATION",
            secret
        );
        await this.usersService.updateUser({
            where: {id: user.id},
            data: {
                twoFactorSecret: secret
            }
        })
        const dataUrl = await toDataURL(otpauth);
        return dataUrl;
    }


    async verifyCheck(userid: number, code: string, _res: any): Promise<any>{
        const user = (await this.usersService.findOne(userid));
        const secret = user.twoFactorSecret;
        const isValid = authenticator.verify({
            token: code,
            secret: secret,
        });
        // _res.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
        if (!isValid){
            throw new UnauthorizedException('Invalid code.')
        }
        const payload = { username: user.name, sub: user.id, mail: user.mail };
        const token = this.jwtService.sign(payload, {secret: jwtConstants.secret});
        _res.cookie('accessToken', token)
        return _res.redirect("http://localhost:3000/")
        }

    async verify(req: any, code: string): Promise<any>{
        const user = (await this.usersService.findOne(Number(req.user.id)));
        const secret = user.twoFactorSecret;
        const isValid = authenticator.verify({
            token: code,
            secret: secret,
        });
        if (!isValid)
            throw new UnauthorizedException('Invalid code.')
        await this.usersService.updateUser({
            where: {id: req.user.id},
            data: {
                twoFactorEnabled: true
            }
        })
        return ;
    }
}
