import { Controller, Request, Post, UseGuards, Get, Redirect, Body, Req,Res } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { LocalAuthGuard } from './auth.guards';
import { Ecole42AuthGuard } from './guards/ecole42-auth.guard';
import { AuthService } from './auth.service';
import { FortyTwoUser } from './42user.interface';
import { JwtAuthGuard } from './guards/jwt-auth.guards';
import { UsersService } from 'src/users/users.service';
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';



@WebSocketGateway()
export class AuthGateway {

  @WebSocketServer()
  server;
}


@Controller('login')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UsersService,
    private readonly authGateway: AuthGateway,
  ) {}

  @UseGuards(Ecole42AuthGuard)
  @Get('auth')
  async ecole42AuthLogin(@Req() req: any, @Res() res: any) : Promise<any>{
    await this.authGateway.server.emit("messages:editUser", await this.userService.findOne(req.user.id));
    return this.authService.login(req, res);
  }


  @UseGuards(JwtAuthGuard)
  @Get('/me/profile')
  getProfile(@Req() req : any) : Promise<any> {
    // console.log(req);
    return this.userService.findOne(req.user.id);
  }
}