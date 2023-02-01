import { ClassSerializerInterceptor, Controller, Header, Post,
        UseInterceptors, Body, Res, UseGuards, Req, Get, Put, ParseIntPipe} from '@nestjs/common';
import { TwoFactorAuthenticationService } from './twoFactorAuthentication.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guards';


@Controller('2fa')
@UseInterceptors(ClassSerializerInterceptor)
export class TwoFactorAuthenticationController {
    constructor(
        private readonly twoFactorAuth: TwoFactorAuthenticationService,
    ) {}

    @Put('turn')
    @UseGuards(JwtAuthGuard)
    enableTwoFactorAuth(@Req() req : any){
        return this.twoFactorAuth.turnOnOf(req.user.id);
    }

    @Get('generate')
    @UseGuards(JwtAuthGuard)
    QR(@Req() req: any): Promise<any> {
        return this.twoFactorAuth.generateTwoFactorAuthenticationSecret(req);
    }

    @Post('verifyCheck')
    verifyCheck(@Body('userid', ParseIntPipe) userid: number, @Body('code') code: string,
                @Res({passthrough: true}) res : any): Promise<any> {
        return this.twoFactorAuth.verifyCheck(userid, code, res);
    }

    @Post('verify')
    @UseGuards(JwtAuthGuard)
    verify(@Req() req : any, @Body('code') code: string): Promise<any> {
        return this.twoFactorAuth.verify(req, code);
    }
}