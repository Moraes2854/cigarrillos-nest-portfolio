import { BadRequestException, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import * as moment from 'moment';

import { CigarrillosService } from '../cigarrillos/cigarrillos.service';
import { CreateVentaDto, UpdateVentaDto } from './dto';
import { FindByDateDto, UpdateDateByDateDto } from '../common/dtos';
import { Venta } from './entities/venta.entity';
import { sumarRepetidos } from '../common/helpers/sumarRepetidos';
import { Cigarrillo } from '../cigarrillos/entities/cigarrillo.entity';


@Injectable()
export class VentasService {

  private readonly logger = new Logger('VentasService');

  constructor(

    @InjectRepository(Venta)
    private readonly ventaRepository: Repository<Venta>,

    private readonly cigarrillosService: CigarrillosService,

    private readonly dataSource:DataSource
  ){}
  
  async createSeveral(createVentaDtos: CreateVentaDto[]){
    try {
      const promises = [];
      
      const arrayFinal:CreateVentaDto[] = (sumarRepetidos(createVentaDtos) as CreateVentaDto[]);


      arrayFinal.forEach(async ({cigarrilloId, amount, date}) => {

        const cigarrillo = await this.cigarrillosService.findOne(cigarrilloId);

        if (amount > cigarrillo.stock) throw new BadRequestException('The amount must be less or equal than current stock');

        const { buy_price, sell_price } = cigarrillo;

        const venta = this.ventaRepository.create({
          amount,
          cigarrillo,
          buy_price,
          sell_price,
          date
        });
      
        promises.push(this.cigarrillosService.update(cigarrilloId, {stock: (cigarrillo.stock - amount)}));
  
        promises.push(this.ventaRepository.save(venta));

      });

      await Promise.all(promises);

      return true;

    } catch (error) {
      this.handleError(error);
    }
  }

  async create(createVentaDto: CreateVentaDto) {
    const { cigarrilloId, amount, date } = createVentaDto;

    try {
      
      const cigarrillo = await this.cigarrillosService.findOne(cigarrilloId);

      if (amount > cigarrillo.stock) throw new BadRequestException('The amount must be less or equal than current stock');

      const { buy_price, sell_price } = cigarrillo;

      const venta = this.ventaRepository.create({
        amount,
        date,
        buy_price,
        sell_price,
        cigarrillo
      });

      await this.cigarrillosService.update(cigarrilloId, {stock:(cigarrillo.stock-amount)});

      await this.ventaRepository.save(venta);

      return { 
        ...venta,
        cigarrillo:{
          ...cigarrillo,
          stock:cigarrillo.stock-amount
        }
      }
    } catch (error) {
      this.handleError(error);
    }
  }

  async findOne(id: string) {

    const venta = await this.ventaRepository.findOneBy({id});

    if (!venta) throw new BadRequestException(`Venta with id: ${id} does not exist in DB`);
    
    return venta

  }

  async update(id: string, updateVentaDto: UpdateVentaDto) {

    try {

      await this.ventaRepository.update(id, {
        ...updateVentaDto,
        id
      });

      const venta = await this.findOne(id);

      return venta

    } catch (error) {
      this.handleError(error);
    }

  }

  async updateVentasDatesByDate({dateToFindObjects, newDate}:UpdateDateByDateDto){
    const query = `
      UPDATE ventas
      SET "date" = '${moment(newDate).format('YYYY-MM-DD')} 00:00:00'
      WHERE ventas."date" = '${moment(dateToFindObjects).format('YYYY-MM-DD')} 00:00:00'
    `;
    const queryRunner = this.dataSource.createQueryRunner(); 
    await queryRunner.connect();
    await queryRunner.manager.query(query);
    await queryRunner.release();

    return true;
  }

  async remove(id: string) {
    try {
      const venta = await this.findOne(id);

      if (!venta) throw new BadRequestException('La venta con el id solicitado no existe en la base de datos');

      await this.ventaRepository.delete({
        id
      });

      return true;

    } catch (error) {
      this.handleError(error);
    }
  }

  async deleteSeveralVentasByDate({date}:FindByDateDto){
    try {

      const ventas = await this.ventaRepository.find({
        where:{date:new Date(date.setHours(0, 0, 0, 0))},
        relations:{cigarrillo:true}
      });

      const cigarrillosFinal:Cigarrillo[] = [];

      const ventasFinal = this.getVentasFinal(ventas);


      
      ventasFinal.forEach(({cigarrillo, amount})=>{
        cigarrillosFinal.push({
          ...cigarrillo,
          stock:cigarrillo.stock+amount,
          beforeInsert:null,
        });
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
      .from(Venta)
      .where("date = :date", { date:`${moment(date).format('YYYY-MM-DD')} 00:00:00` })
      .execute();
      
      return true;
    } catch (error) {
      this.handleError(error);
    }
  }

  private getVentasFinal(ventas:Venta[]):Venta[]{
    const ventasFinal:Venta[] = [];

    for (let i=0; i<ventas.length; i++){
       const currentVenta = ventas[i];

      if (this.isInArrayMoreThanOnce(currentVenta.cigarrillo.id, ventas)){
        if (!ventasFinal.find((v)=>v.cigarrillo.id === currentVenta.cigarrillo.id)){
          let finalAmount = 0;
          
          ventas.forEach((v)=>{
            if (v.cigarrillo.id === currentVenta.cigarrillo.id) finalAmount+=v.amount;
          });

          ventasFinal.push({
            ...currentVenta,
            amount:finalAmount,
            beforeInsert:null,
          });
        }
      }
      else {
        ventasFinal.push({
          ...currentVenta,
          beforeInsert:null,
        });
      }
    }


    return ventasFinal; 
  }

  private isInArrayMoreThanOnce(cigarrilloId:string, ventas:Venta[]){
    let timesInArray = 0;

    ventas.forEach((v)=>{
      if (v.cigarrillo.id === cigarrilloId) timesInArray+=1;
    });

    return (timesInArray>1)
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
