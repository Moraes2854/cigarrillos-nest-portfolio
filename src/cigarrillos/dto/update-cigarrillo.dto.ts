import { PartialType } from '@nestjs/mapped-types';
import { IsNumber, Min, IsOptional} from 'class-validator';
import { CreateCigarrilloDto } from './create-cigarrillo.dto';

export class UpdateCigarrilloDto extends PartialType(CreateCigarrilloDto) {

    @IsNumber()
    @Min(0)
    @IsOptional()
    stock?:number;
    
}
