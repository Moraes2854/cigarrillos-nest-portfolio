import { BadRequestException, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import * as moment from 'moment';

import { CreateCompraDto, UpdateCompraDto } from './dto';
import { UpdateDateByDateDto, FindByDateDto } from '../common/dtos';
import { Compra } from './entities/compra.entity';
import { CigarrillosService } from '../cigarrillos/cigarrillos.service';
import { sumarRepetidos } from '../common/helpers/sumarRepetidos';
import { Cigarrillo } from '../cigarrillos/entities/cigarrillo.entity';


@Injectable()
export class ComprasService {

  private readonly logger = new Logger('ComprasService');

  constructor(
    @InjectRepository(Compra)
    private readonly compraRepository: Repository<Compra>,

    private readonly cigarrillosService: CigarrillosService,

    private readonly dataSource:DataSource,
  ){}

  async createSeveral(createCompraDtos: CreateCompraDto[]){
    try {
      const promises = [];
      
      const arrayFinal:CreateCompraDto[] = (sumarRepetidos(createCompraDtos) as CreateCompraDto[]);

      arrayFinal.forEach(async ({cigarrilloId, amount, date}) => {

        const cigarrillo = await this.cigarrillosService.findOne(cigarrilloId);

        if (amount < 1) throw new BadRequestException('The amount must be greater than or equal to 1');

        const { buy_price, sell_price} = cigarrillo;

        const compra = this.compraRepository.create({
          amount,
          cigarrillo,
          buy_price,
          sell_price,
          date
        });
      
        promises.push(this.cigarrillosService.update(cigarrilloId, {stock: (cigarrillo.stock + amount)}));
  
        promises.push(this.compraRepository.save(compra));

      });

      await Promise.all(promises);

      return true;

    } catch (error) {
      this.handleError(error);
    }
  }

  async create(createCompraDto: CreateCompraDto) {
    const { cigarrilloId, amount, date } = createCompraDto;

    try {
      const cigarrillo= await this.cigarrillosService.findOne(cigarrilloId);

      const { buy_price, sell_price} = cigarrillo;

      const compra = this.compraRepository.create({
        amount,
        cigarrillo,
        buy_price,
        sell_price,
        date
      });

      await this.cigarrillosService.update(cigarrilloId, {stock: (cigarrillo.stock + amount)});

      await this.compraRepository.save(compra);

      return { 
        ...compra,
        cigarrillo:{
          ...cigarrillo,
          amount: (cigarrillo.stock + amount)
        }
      }

    } catch (error) {
      this.handleError(error);
    }

  }

  async findAll() {
    const compras = await this.compraRepository.find();

    return compras.sort((a, b)=>(a.date<b.date)?-1:(a.date>b.date)? 1 : 0);
  }

  async findOne(id: string) {

    const compra = await this.compraRepository.findOneBy({id});

    if (!compra) throw new BadRequestException(`Compra with id: ${id} does not exist in DB`);
    
    return compra

  }

  async update(id: string, updateCompraDto: UpdateCompraDto) {

    try {

      await this.compraRepository.update(id, {
        ...updateCompraDto,
        id
      });

      const compra = await this.findOne(id);


      return compra

    } catch (error) {
      this.handleError(error);
    }

  }

  async remove(id: string) {
    try {
      const compra = await this.findOne(id);

      if (!compra) throw new BadRequestException('La compra con el id solicitado no existe en la base de datos');

      await this.compraRepository.delete({
        id
      });

      return true;

    } catch (error) {
      this.handleError(error);
    }
  }

  async updateComprasDatesByDate({dateToFindObjects, newDate}:UpdateDateByDateDto){
    const query = `
      UPDATE compras
      SET "date" = '${moment(newDate).format('YYYY-MM-DD')} 00:00:00'
      WHERE compras."date" = '${moment(dateToFindObjects).format('YYYY-MM-DD')} 00:00:00'
    `;
    const queryRunner = this.dataSource.createQueryRunner(); 
    await queryRunner.connect();
    await queryRunner.manager.query(query);
    await queryRunner.release();

    return true;
  }

  async deleteSeveralComprasByDate({date}:FindByDateDto){
    try {

      const compras = await this.compraRepository.find({
        where:{date:new Date(date.setHours(0, 0, 0, 0))},
        relations:{cigarrillo:true}
      });

      const cigarrillosFinal:Cigarrillo[] = [];

      const comprasFinal = this.getComprasFinal(compras);

      comprasFinal.forEach(({cigarrillo, amount})=>{
        cigarrillosFinal.push({
          ...cigarrillo,
          stock:cigarrillo.stock-amount,
          beforeInsert:null,
        })
      });

      const cigarrillosValues = cigarrillosFinal.map((c)=>{
        return `('${c.id}', ${c.stock})`
      }).join(',');

      const queryCigarrillos = `UPDATE cigarrillos as c SET
        "stock" = c2.stock
        FROM ( VALUES 
          ${cigarrillosValues}
        ) as c2 (id, stock)
        where c.id::text = c2.id
      `;
      

      const queryRunner = this.dataSource.createQueryRunner(); 
      await queryRunner.connect();
      await queryRunner.manager.query(queryCigarrillos);
      await queryRunner.release();

      await this.dataSource.createQueryBuilder()
      .delete()
      .from(Compra)
      .where("date = :date", { date:`${moment(date).format('YYYY-MM-DD')} 00:00:00` })
      .execute();
      
      return true;
    } catch (error) {
      this.handleError(error);
    }
  }

  private getComprasFinal(compras:Compra[]):Compra[]{
    const comprasFinal:Compra[] = [];

    for (let i=0; i<compras.length; i++){
      const currentCompra = compras[i];
      if (this.arrayHaveDuplicates([...comprasFinal.map((c)=>c.cigarrillo.id), currentCompra.cigarrillo.id])){
        const comprasAux = compras.filter((compra)=>compra.cigarrillo.id === currentCompra.cigarrillo.id);
        const finalAmount = comprasAux.reduce((acc, obj) => acc+obj.amount, 0);
        comprasFinal.push({
          ...currentCompra,
          amount:finalAmount,
          beforeInsert:null,
        });
      }
      else {
        comprasFinal.push({
          ...currentCompra,
          beforeInsert:null,
        });
      }
    }
    return comprasFinal; 
  }

  private arrayHaveDuplicates(cigarrillosIds:string[]){
    let haveDuplicates = false;

    const uniqueValues = new Set(cigarrillosIds);

    if (uniqueValues.size < cigarrillosIds.length) haveDuplicates = true
    
    return haveDuplicates;
  }

  private handleError(error){

    this.logger.error(error);
    throw new InternalServerErrorException('Unexpected error, check server logs [ ' + error.message + ' ]');
    
  }

  
}
