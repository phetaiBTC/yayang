import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface CurrentUserData {
  empId: number; // JWT subject: empId for employees, cusId for customers
  username: string;
  role: 'admin' | 'staff' | 'customer';
}

/** Extracts the authenticated user (set by JwtStrategy.validate) from the request. */
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): CurrentUserData => {
    return ctx.switchToHttp().getRequest().user;
  },
);
