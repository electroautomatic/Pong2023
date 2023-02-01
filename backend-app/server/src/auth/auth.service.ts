import { Injectable, ForbiddenException, Res, Req } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { comparePassword } from 'src/utils/bcrypt';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { JwtAuthGuard } from './guards/jwt-auth.guards';
// import { JwtPayload } from './payload.interface';
import { Prisma, PrismaClient } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';
import { profile } from 'console';
import { User } from '@prisma/client';
import { FortyTwoUser } from './42user.interface';
import { ChatGateway } from 'src/chat/chat/chat.gateway';
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
// @Injectable()
// export class AuthService {
//   constructor(private usersService: UsersService) {}

//   async validateUser(username: string, pass: string): Promise<any> {
//     const user = await this.usersService.findOneByName(username);
//     //if (user && user.password === pass) {
//     if (user && comparePassword(pass, user.password)) {
//       const { password, ...result } = user;
//       return result;
//     }
//     return null;
//   }
// }

export type JwtPayload = {
  name: string,
  id: number,
}

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private usersService: UsersService,
    private configService: ConfigService,
  ) {}

  async validateIntraUser(id: number, username : string, email : string): Promise<any> {
    const user = await this.usersService.findOneByIntraId(id);
    //if (user && user.password === pass) {
    if(user){
      // console.log("User exists");
      return user;
    }
    else{
      // console.log('create user');
      const user = this.usersService.createUser({
        id: Number(id),
        ecole42Id: Number(id),
        name: username,
        achievementsId: 1,
        mail: email,
      });
      return user;
    }
  }

  generateJWT(userId: number, username : string): string {
    // console.log(userId);
    // console.log(username);
    return this.jwtService.sign({ sub: userId, username : username });
  }

  async login(@Req() _req: any, @Res() _res: any) : Promise<any> {
    let user = (await this.usersService.findOne(_req.user.id))
    if (user && user.twoFactorEnabled){
      // const payload = { username: _req.user.name, sub: _req.user.id, mail: _req.user.mail };
      // const token = this.jwtService.sign(payload);
      // _res.cookie('accessToken', token);

      return _res.redirect('http://localhost:3000/?2fa=' + String(_req.user.id))
    }
    // if (user && user.twoFactorEnabled){
    //   _res.cookie('2fa', user.id);
    //   return _res;
    // }
    const payload = { username: _req.user.name, sub: _req.user.id, mail: _req.user.mail };
    // const payload = { username: _req.user.name };
    const token = this.jwtService.sign(payload);
    _res.cookie('accessToken', token);

    return _res.redirect('http://localhost:3000/');
  }

  async validateUser(payload: any): Promise<User> {
    // console.log(payload);
    const id  = payload.sub;
    // console.log("tuta", id);
    // console.log(payload.id);
    try {
        const user = await this.usersService.findOne(Number(id));
        if (!user) {
            return null;
        }
        return user;
    } catch {
        return null;
    }
  }
}