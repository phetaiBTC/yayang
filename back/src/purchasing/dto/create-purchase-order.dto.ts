import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsInt,
  IsNumber,
  IsPositive,
  Min,
  ValidateNested,
} from 'class-validator';

export class CreatePoLineDto {
  @IsInt() @IsPositive() bookId!: number;
  @IsInt() @Min(1) qty!: number;
  @IsNumber() @Min(0) costPrice!: number;
}

export class CreatePurchaseOrderDto {
  @IsInt() @IsPositive() supId!: number;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreatePoLineDto)
  lines!: CreatePoLineDto[];
}
