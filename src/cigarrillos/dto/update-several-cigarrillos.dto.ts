import { IsNumber, IsPositive, IsUUID, IsNotEmpty, IsString, Min } from 'class-validator';

export class UpdateSeveralCigarrilloDto{

    @IsString()
    @IsUUID()
    @IsNotEmpty()
    id:string;
    
    @IsString()
    name:string;
    
    @IsNumber()
    @IsPositive()
    buy_price:number;
    
    @IsNumber()
    @IsPositive()
    sell_price:number;
    
    @IsNumber()
    @Min(0)
    stock:number;   
    
}

