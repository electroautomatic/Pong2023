// import { Injectable } from '@nestjs/common';
// import { AuthGuard } from '@nestjs/passport';

// @Injectable()
// export class JwtAuthGuard extends AuthGuard('jwt') {}

// @Injectable()
// export class TwoFactorJwtAuthGuard extends AuthGuard('jwt-2fa') {}

import { Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

// @Injectable()
// export class JwtAuthGuard extends AuthGuard('jwt') {
//     handleRequest(err: any, user: any, info: any) {
//         if (err || !user) {
//             return null;
//         }
//         return user;
//     }
// }

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
