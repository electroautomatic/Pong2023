import { ExtractJwt, Strategy } from 'passport-jwt';
// import { ExtractJwt } from 'passport-jwt';
// import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { AuthService } from './auth.service';
// import { User } from 'src/users/entities/user.entity';
import { User } from '@prisma/client';
// import { JwtPayload } from '../type/jwt-payload.type';
// import { JwtPayload } from './payload.interface';
import { ConfigService } from '@nestjs/config';
import { jwtConstants } from './auth.constants';


export type JwtPayload = {
  name: string,
  id: number,
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService,) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtConstants.secret,
    });
  }

  async validate(payload: JwtPayload) : Promise <User> {
    console.log(payload);
    // console.log(payload);
    // const data = {name : payload.username, }
    const user = await this.authService.validateUser(payload);
    if (!user) {
      throw new HttpException('Invalid token', HttpStatus.UNAUTHORIZED);
    }
    return user;
    // return { userId: payload.sub, username: payload.username };
  }
}