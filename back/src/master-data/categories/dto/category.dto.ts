import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateCategoryDto {
  @IsString() @IsNotEmpty() catName!: string;
}

export class UpdateCategoryDto {
  @IsOptional() @IsString() @IsNotEmpty() catName?: string;
}
