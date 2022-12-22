import { BadRequestException, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { CreateCigarrilloDto, UpdateCigarrilloDto, UpdateSeveralCigarrilloDto } from './dto';

import { Cigarrillo } from './entities/cigarrillo.entity';

@Injectable()
export class CigarrillosService {

  private readonly logger = new Logger('CigarrillosService');

  constructor(

    @InjectRepository(Cigarrillo)
    private readonly cigarrilloRepository: Repository<Cigarrillo>,

    private readonly dataSource:DataSource

  ){}
  
  async create(createCigarrilloDto: CreateCigarrilloDto) {

    try {
      
      const cigarrillo = this.cigarrilloRepository.create({
        ...createCigarrilloDto
      });
      
      await this.cigarrilloRepository.save(cigarrillo);

      return cigarrillo;
      
    } catch (error) {
      this.handleError(error);
    }

  }

  async findAll() {
    const cigarrillos = await this.cigarrilloRepository.find({where:{isActive:true}});

    return cigarrillos.sort((a, b)=>(a.name<b.name)?-1:(a.name>b.name)? 1 : 0);
  }

  async findOne(id: string) {

  const cigarrillo = await this.cigarrilloRepository.findOneBy({id});
  
  if (!cigarrillo) throw new BadRequestException(`Cigarrillo with id: ${id} does not exist in DB`);
  if (!cigarrillo.isActive) throw new BadRequestException(`Cigarrillo with id: ${id} is not active in DB`);
  
  return cigarrillo

}

  async update(id: string, updateCigarrilloDto: UpdateCigarrilloDto) {

    try {
      await this.cigarrilloRepository.update(id, {
        ...updateCigarrilloDto,
        id
      });

      const cigarrillo = await this.findOne(id);
  
      return cigarrillo;

    } catch (error) {
      this.handleError(error);
    }

  }

  async updateSeveral(updateSeveralCigarrilloDto: UpdateSeveralCigarrilloDto[]){
    const cigarrillosValues = updateSeveralCigarrilloDto.map((c)=>{
      return `('${c.id}','${c.name}', ${c.buy_price}, ${c.sell_price}, ${c.stock})`
    }).join(',');
    

    const queryCigarrillos = `UPDATE cigarrillos as c SET
      "name" = c2.name,
      "buy_price" = c2.buy_price,
      "sell_price" = c2.sell_price,
      "stock" = c2.stock
      FROM ( VALUES 
        ${cigarrillosValues}
      ) as c2 (id, name, buy_price, sell_price, stock)
      where c.id::text = c2.id
    `;

    console.log(queryCigarrillos);

    const queryRunner = this.dataSource.createQueryRunner(); 
    await queryRunner.connect();
    await queryRunner.manager.query(queryCigarrillos);
    await queryRunner.release();

    return true;
  }

  async remove(id: string) {

    try {

      await this.cigarrilloRepository.update(id, {
        isActive:false,
      });

      const cigarrillo = await this.findOne(id);
  
      return cigarrillo

    } catch (error) {
      this.handleError(error);
    }

  }



  private handleError(error){

    this.logger.error(error);
    throw new InternalServerErrorException('Unexpected error, check server logs [ ' + error.message + ' ]');
    
  }
}
