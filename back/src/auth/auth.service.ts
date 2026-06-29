import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { EntityManager } from '@mikro-orm/core';
import * as bcrypt from 'bcryptjs';
import { Employee } from '../entities';
import { LoginDto } from './dto/login.dto';
import { JwtPayload } from './jwt.strategy';

export interface AuthUser {
  empId: number;
  username: string;
  role: 'admin' | 'staff';
}

@Injectable()
export class AuthService {
  constructor(
    private readonly em: EntityManager,
    private readonly jwt: JwtService,
  ) {}

  /** Returns the employee if credentials are valid, otherwise null. */
  async validateEmployee(username: string, password: string): Promise<Employee | null> {
    const emp = await this.em.findOne(Employee, { username });
    if (!emp) return null;
    const ok = await bcrypt.compare(password, emp.password);
    return ok ? emp : null;
  }

  async login(dto: LoginDto): Promise<{ access_token: string; user: AuthUser }> {
    const emp = await this.validateEmployee(dto.username, dto.password);
    if (!emp) {
      // Generic message — do not reveal whether the username exists.
      throw new UnauthorizedException('Invalid username or password');
    }
    const user: AuthUser = {
      empId: emp.empId,
      username: emp.username,
      role: emp.role as 'admin' | 'staff',
    };
    const payload: JwtPayload = { sub: user.empId, username: user.username, role: user.role };
    return { access_token: await this.jwt.signAsync(payload), user };
  }
}
