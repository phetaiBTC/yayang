import { IsIn, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateEmployeeDto {
  @IsString() @IsNotEmpty() name!: string;
  @IsOptional() @IsString() phone?: string;
  @IsString() @IsNotEmpty() username!: string;
  @IsString() @MinLength(6) password!: string;
  @IsIn(['admin', 'staff']) role!: 'admin' | 'staff';
}

export class UpdateEmployeeDto {
  @IsOptional() @IsString() @IsNotEmpty() name?: string;
  @IsOptional() @IsString() phone?: string;
  @IsOptional() @IsString() @IsNotEmpty() username?: string;
  @IsOptional() @IsString() @MinLength(6) password?: string;
  @IsOptional() @IsIn(['admin', 'staff']) role?: 'admin' | 'staff';
}
