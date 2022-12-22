import { BadRequestException, Injectable, PipeTransform } from "@nestjs/common";

Injectable()
export class ParseNameToUppercase implements PipeTransform {
  transform(payload: any): any {

    if (!payload.name) throw new BadRequestException('Name should not be empty');
    

    if (typeof payload.name !== 'string') throw new BadRequestException('Name should be an string');
    
    return {
        ...payload,
        name:payload.name.toUpperCase(),
    };
  }
}