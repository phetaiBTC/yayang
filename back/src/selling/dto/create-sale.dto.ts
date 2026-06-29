import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsIn,
  IsInt,
  IsPositive,
  Min,
  ValidateNested,
} from 'class-validator';

export class CreateSaleLineDto {
  @IsInt() @IsPositive() bookId!: number;
  @IsInt() @Min(1) qty!: number;
}

export class CreateSaleDto {
  @IsInt() @IsPositive() cusId!: number;

  @IsIn(['cash', 'transfer', 'qr']) paymentMethod!: 'cash' | 'transfer' | 'qr';

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateSaleLineDto)
  lines!: CreateSaleLineDto[];
}
