import { Type } from "class-transformer";
import { IsDate, IsNumber, IsPositive, IsString, IsUUID } from "class-validator";

export class CreateCompraDto {
    
    @IsUUID()
    @IsString()
    cigarrilloId:string;

    @IsNumber()
    @IsPositive()
    amount:number;

    @Type(() => Date)
    @IsDate()
    date:Date;

}
