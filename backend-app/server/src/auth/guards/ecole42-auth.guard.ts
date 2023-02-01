import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class Ecole42AuthGuard extends AuthGuard('42') {}