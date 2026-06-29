import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateCustomerDto {
  @IsString() @IsNotEmpty() name!: string;
  @IsOptional() @IsString() phone?: string;
}

export class UpdateCustomerDto {
  @IsOptional() @IsString() @IsNotEmpty() name?: string;
  @IsOptional() @IsString() phone?: string;
}
