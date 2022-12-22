import { Type } from 'class-transformer';
import { IsNumber, IsPositive, IsUUID, IsString, IsDate,  } from 'class-validator';

export class CreateVentaDto {   
    
    @IsString()
    @IsUUID()
    cigarrilloId:string;
    
    @IsNumber()
    @IsPositive()
    amount:number;
    
    @Type(() => Date)
    @IsDate()
    date:Date;

}
