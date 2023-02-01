import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './local.strategy';
import { AuthController, AuthGateway } from './auth.controller';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Ecole42Strategy } from './ecole42.strategy';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from './auth.constants';
import { JwtStrategy } from './jwt.strategy';
import { ConfigModule } from '@nestjs/config';
import { JwtAuthGuard } from './guards/jwt-auth.guards';
import { ChatGateway } from 'src/chat/chat/chat.gateway';

@Module({
  imports: [UsersModule, 
            PassportModule,
            // JwtModule.register({
            //   secret: process.env.JWT_SECRET,
            //   signOptions: { expiresIn: '7d' },
            // }),
            JwtModule.register({
              secret: jwtConstants.secret,
              signOptions: { expiresIn: '7d' },
            }),
          //   JwtModule.registerAsync({
          //     imports: [ConfigModule],
          //     inject: [ConfigService],
          //     useFactory: (configService: ConfigService) => ({
          //         // secret: configService.get('JWT_SECRET'),
          //         secret: process.env.JWT_SECRET,
          //         signOptions: {
          //             expiresIn: configService.get('JWT_EXPIRESIN'),
          //         }
          //     })
          // }),
],
  providers: [AuthService, ConfigService, Ecole42Strategy, JwtStrategy, JwtAuthGuard,AuthGateway],
  controllers : [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
