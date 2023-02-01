import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy, VerifyCallback } from 'passport-42';
import { AuthService } from './auth.service';
import { Injectable } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { FortyTwoUser } from './42user.interface';
import { Prisma, User } from '@prisma/client';
import { type } from 'os';

export class dataTransfer {
  ecole42Id: number;
  name: string;
};

@Injectable()
export class Ecole42Strategy extends PassportStrategy(Strategy, '42') {
  constructor(private authService: AuthService, 
              private usersService: UsersService) {
    super({
      // clientID: process.env.INTRA_CLIENT_ID,
      // clientSecret: process.env.INTRA_CLIENT_SECRET,
      // callbackURL: process.env.INTRA_REDIRECT_URL,

      clientID: "u-s4t2ud-3886109fb27f0c62d22d00bc88475d573436465c61c3157c08e78abfa6d1e2f4",
      clientSecret: "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",
      callbackURL: "http://localhost:3001/login/auth",
    });
  }
  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: VerifyCallback,
  ): Promise<User | undefined> {
    console.log(accessToken);
    console.log(refreshToken);
    console.log(profile.username);
    console.log(profile.id);
    console.log(profile.mail);
    console.log(profile.email);

    // console.log(profile.photos);
    // console.log(String(profile.login));
    // console.log(profile.displayname);
    // console.log(profile.email);
    const user = await this.authService.validateIntraUser(profile.id, profile.username, profile.emails[0].value);
    // console.log(user);
    return user;
  }
}