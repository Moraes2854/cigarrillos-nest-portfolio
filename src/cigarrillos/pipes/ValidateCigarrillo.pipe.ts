import { BadRequestException, forwardRef, Inject, Injectable, PipeTransform } from "@nestjs/common";
import { isUUID } from "class-validator";
import { CigarrillosService } from '../cigarrillos.service';

Injectable()
export class ValidateCigarrilloExistsPipe implements PipeTransform {

    constructor(
    // use forwardRef here
    // @Inject(forwardRef(() => DatabaseService)) private db: DatabaseService 
      @Inject(forwardRef(() => CigarrillosService)) private cigarrillosService:CigarrillosService,
    ) {}

  async transform(payload: any) {
    let id = payload;

    if (typeof payload !== 'string'){
      if (payload.id_cigarrillo) id=payload.id_cigarrillo
      else throw new BadRequestException('Cigarrillo id not found');
    } 

    if (!isUUID(id)) throw new BadRequestException('Cigarrillo id is not valid');

    if (!await this.cigarrillosService.findOne(id)) {
      throw new BadRequestException('Cigarrillo does not exist on DB');
    }
    
    return payload;

  }
}