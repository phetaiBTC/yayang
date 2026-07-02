import { ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Employee-area guard: requires a valid JWT AND an employee role.
 * Customer tokens (role 'customer') are rejected here so the back-office
 * endpoints — many of which carry no @Roles — stay staff/admin only.
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest<TUser = any>(err: any, user: any): TUser {
    if (err || !user) {
      throw err || new UnauthorizedException();
    }
    if (user.role === 'customer') {
      throw new ForbiddenException('This area is for employees only');
    }
    return user as TUser;
  }
}
