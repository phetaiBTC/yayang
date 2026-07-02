import { ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Customer-area guard: requires a valid JWT AND the 'customer' role.
 * Employee tokens are rejected. Mirrors JwtAuthGuard but for the storefront.
 */
@Injectable()
export class CustomerAuthGuard extends AuthGuard('jwt') {
  handleRequest<TUser = any>(err: any, user: any): TUser {
    if (err || !user) {
      throw err || new UnauthorizedException();
    }
    if (user.role !== 'customer') {
      throw new ForbiddenException('This area is for customers only');
    }
    return user as TUser;
  }
}
