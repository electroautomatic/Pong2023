import { Controller, Get, Redirect,Post, UseGuards, Res, Body, Request } from '@nestjs/common';
// import { AppService } from './app.service';
import { ConfigService } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { User as UserModel } from '@prisma/client';
import { encodePassword } from './utils/bcrypt';
import { LocalAuthGuard } from './auth/auth.guards';
import { AuthService } from './auth/auth.service';

@Controller()
export class AppController {
  constructor(
              private configService: ConfigService,
              private authService: AuthService) {}

  @Get()
  getHello(): string {
    //return this.appService.getHello();
    return "https://www.google.com/";
  }

  @Get('zaq')
  //@Redirect("https://www.google.com/", 301)
  getGooggle(): string {
    //return this.appService.getHello();
    return "https://www.google.com/";
  }

  // @UseGuards(LocalAuthGuard)
  // @Post('auth/login')
  // async login(@Request() req){
  //   return this.authService.login(req.user);
  // }
  // @Get('users')
  // async getUsers(): Promise<UserModel[]> {
  //   return this.userService.users({});
  // }


  // @Get('login')
  // @UseGuards(IntraAuthGuard)
  // loginIntra(@Res() res): any {
  //   res.redirect(this.configService.get('oauth.redirect'));
  // }

  // @Get('login')
  // @Redirect('http://localhost:5173')
  // getInIntra(@Body() body): string {
  //   // console.log(body);
  //   console.log("Hello");
  //   //return 
  //   // prihodit code i state heades of http request to us
  //   //return this.appService.getHello();
  //   //return "https://api.intra.42.fr/oauth/authorize?client_id=u-s4t2ud-3886109fb27f0c62d22d00bc88475d573436465c61c3157c08e78abfa6d1e2f4&redirect_uri=http%3A%2F%2Flocalhost%3A3001%2Flogin&response_type=code";
  //   //return "https://api.intra.42.fr/oauth/authorize?client_id=u-s4t2ud-3886109fb27f0c62d22d00bc88475d573436465c61c3157c08e78abfa6d1e2f4&redirect_uri=http%3A%2F%2Flocalhost%3A3001%2Flogin&response_type=code";
  //   //return "https://api.intra.42.fr/oauth/authorize?client_id=u-s4t2ud-3886109fb27f0c62d22d00bc88475d573436465c61c3157c08e78abfa6d1e2f4&redirect_uri=http%3A%2F%2Flocalhost%3A5173&response_type=code";
  //   return body;
  // }

  // @Post('https://api.intra.42.fr/oauth/token') 

  


  // @Redirect('https://api.intra.42.fr/oauth/authorize?client_id=u-s4t2ud-3886109fb27f0c62d22d00bc88475d573436465c61c3157c08e78abfa6d1e2f4&redirect_uri=http%3A%2F%2Flocalhost%3A3001%2Flogin&response_type=code')
  // @Get('login')
  // getAll(): string {
  //   console.log("asdsadsad");
  //   //return 'getAll'
  //   return 'https://api.intra.42.fr/oauth/authorize?client_id=u-s4t2ud-3886109fb27f0c62d22d00bc88475d573436465c61c3157c08e78abfa6d1e2f4&redirect_uri=http%3A%2F%2Flocalhost%3A3001%2Flogin&response_type=code';
  // }

  // @Post('user')
  // async signupUser(
  //   @Body() userData: { name?: string; email: string; password: string; },
  // ): Promise<UserModel> {
  //   //userData.password = encodePassword(userData.password);
  //   console.log(userData.password);
  //   return this.userService.createUser(userData);
  // }

  // @Post('https://api.intra.42.fr/oauth/token')
  // getIntraToken(){
  // }
}