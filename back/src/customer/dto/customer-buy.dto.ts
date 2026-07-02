import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, IsIn, ValidateNested } from 'class-validator';
import { CreateSaleLineDto } from '../../selling/dto/create-sale.dto';

export class CustomerBuyDto {
  @IsIn(['cash', 'transfer', 'qr']) paymentMethod!: 'cash' | 'transfer' | 'qr';

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateSaleLineDto)
  lines!: CreateSaleLineDto[];
}
