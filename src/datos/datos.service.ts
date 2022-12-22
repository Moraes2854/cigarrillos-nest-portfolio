import { Injectable, BadRequestException } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import * as moment from 'moment';

import { FindBetweenTwoDatesDto, FindByDateDto } from '../common/dtos';

interface TableData {
  tableData1:string; 
  tableData2:string;
}

export interface DatoResponse{
  tableHeader1:string;
  tableHeader2:string;
  data:TableData[];
  caption?:string;
}



@Injectable()
export class DatosService {

  constructor(
    private readonly dataSource:DataSource,
  ){}

  async general(){

    const queryRunner = this.dataSource.createQueryRunner();
        
    await queryRunner.connect();

    const { totalComprado, totalUnidadesCompradas, totalDiasCompra } = (await queryRunner.manager.query(`
      SELECT
        SUM(compras.amount*compras.buy_price) as "totalComprado", 
        SUM(compras.amount) as "totalUnidadesCompradas", 
        COUNT(DISTINCT(compras.date)) as "totalDiasCompra"
          from compras
    `))[0];

    const { totalVendido, totalUnidadesVendidas, totalDiasVenta, totalGanancia } = (await queryRunner.manager.query(
      `
        SELECT

          SUM(ventas.amount*ventas.sell_price) as "totalVendido", 
          SUM(ventas.amount) as "totalUnidadesVendidas", 
          SUM(ventas.amount*(ventas.sell_price-ventas.buy_price)) as "totalGanancia",
          COUNT(DISTINCT(ventas.date)) as "totalDiasVenta"
          
            from ventas

      `
    ))[0];
    
    const { totalUnidadesStock, totalDineroStockActualCompra, totalDineroStockActualVenta} = (await queryRunner.query(
      `
        SELECT

        SUM(cigarrillos.stock) as "totalUnidadesStock", 
        SUM(cigarrillos.stock*cigarrillos.buy_price) as "totalDineroStockActualCompra", 
        SUM(cigarrillos.stock*cigarrillos.sell_price) as "totalDineroStockActualVenta"

          from cigarrillos
      `
    ))[0];


    await queryRunner.release();

    const data:TableData[] = [
      {
        tableData1:'Total comprado',
        tableData2:`$${totalComprado}`
      },
      {
        tableData1:'Total vendido',
        tableData2:`$${totalVendido}`
      },
      {
        tableData1:'Total ganancia',
        tableData2:`$${totalGanancia}`
      },
      {
        tableData1:'Total unidades compradas',
        tableData2:`${totalUnidadesCompradas}`
      },
      {
        tableData1:'Total unidades vendidas',
        tableData2:`${totalUnidadesVendidas}`
      },
      {
        tableData1:'Total Unidades en stock',
        tableData2:`${totalUnidadesStock}`
      },
      {
        tableData1:'Total dinero de stock actual por compra',
        tableData2:`$${totalDineroStockActualCompra}`
      },
      {
        tableData1:'Total dinero de stock actual por venta',
        tableData2:`$${totalDineroStockActualVenta}`
      },
      {
        tableData1:'Total de dias de compra',
        tableData2:`${totalDiasCompra}`
      },
      {
        tableData1:'Total de dias de venta',
        tableData2:`${totalDiasVenta}`
      },
      {
        tableData1:'Promedio de venta por dia',
        tableData2:`$${Math.round(totalVendido/totalDiasVenta)}`
      },
      {
        tableData1:'Promedio de compra',
        tableData2:`$${Math.round(totalComprado/totalDiasCompra)}`
      },
      {
        tableData1:'Promedio de ganancia por dia',
        tableData2:`$${Math.round(totalGanancia/totalDiasVenta)}`
      },
    ]

    const response:DatoResponse = {
      tableHeader1:'Dato',
      tableHeader2:'Cantidad',
      data        
    }


    return response;
  }

  async generalByCigarrillo(){

  }

  async cigarrillosMasVendidos(){

    const queryRunner = this.dataSource.createQueryRunner();
        
    await queryRunner.connect();


    const query = `
      SELECT 
        cigarrillos.id as "cigarrilloId",
        cigarrillos."name" as "cigarrilloName",
        SUM(ventas.amount) AS "totalVendido"
          FROM cigarrillos
            INNER JOIN ventas 
              ON ventas."cigarrilloId" = cigarrillos.id
                GROUP BY cigarrillos."name", cigarrillos.id
                ORDER BY SUM(ventas.amount) DESC;
    `
    const cigarrillosMasVendidos = (await queryRunner.query(query));

    await queryRunner.release();

    const data:TableData[] = cigarrillosMasVendidos.map(({cigarrilloName, totalVendido})=>({
      tableData1:cigarrilloName,
      tableData2:totalVendido
    }));

    const response: DatoResponse = {
      tableHeader1:'Cigarrillo',
      tableHeader2:'Unidades vendidas',
      data
    }

    return response;
  }

  async cigarrillosMasComprados(){
    const queryRunner = this.dataSource.createQueryRunner();
        
    await queryRunner.connect();


    const query = `
      SELECT 
        cigarrillos.id as "cigarrilloId",
        cigarrillos."name" as "cigarrilloName",
        SUM(compras.amount) AS "totalComprado"
          FROM cigarrillos
            INNER JOIN compras 
              ON compras."cigarrilloId" = cigarrillos.id
                GROUP BY cigarrillos."name", cigarrillos.id
                ORDER BY SUM(compras.amount) DESC;
    `
    const cigarrillosMasComprados = (await queryRunner.query(query));

    await queryRunner.release();

    const data:TableData[] = cigarrillosMasComprados.map(({cigarrilloName, totalComprado})=>({
      tableData1:cigarrilloName,
      tableData2:totalComprado
    }));

    const response:DatoResponse = {
      tableHeader1:'Cigarrillo',
      tableHeader2:'Unidades compradas',
      data
    };

    return response;
  }

  async diasMayorVenta(){
    const queryRunner = this.dataSource.createQueryRunner();
        
    await queryRunner.connect();

    const query = `
      SELECT
        date,
        SUM( amount*sell_price ) as "totalVendido"
      FROM
        ventas
      GROUP BY
        date
      ORDER BY
        "totalVendido" DESC;
    `

    const diasMayorVenta = (await queryRunner.query(query));

    await queryRunner.release();

    const data:TableData[] = diasMayorVenta.map(({date, totalVendido})=>({
      tableData1:`${moment(date).format('DD/MM/YYYY')}`,
      tableData2:`$${totalVendido}`
    }));

    const response:DatoResponse = {
      tableHeader1:'Fecha',
      tableHeader2:'Total vendido',
      data
    }

    return response;
  }

  async diasMayorCompra(){
    const queryRunner = this.dataSource.createQueryRunner();
        
    await queryRunner.connect();

    const query = `
      SELECT
        date,
        SUM( amount*buy_price ) as "totalComprado"
      FROM
        compras
      GROUP BY
        date
      ORDER BY
        "totalComprado" DESC;
    `

    const diasMayorCompra = (await queryRunner.query(query));

    await queryRunner.release();

    const data:TableData[] = diasMayorCompra.map(({date, totalComprado})=>({
      tableData1:`${moment(date).format('DD/MM/YYYY')}`,
      tableData2:`$${totalComprado}`
    }));

    const response:DatoResponse = {
      tableHeader1:'Fecha',
      tableHeader2:'Total comprado',
      data
    }
    return response;
  }

  async ventasDelDia(findByDateDto:FindByDateDto){
    const { date } = findByDateDto;
    
    const queryRunner = this.dataSource.createQueryRunner();
        
    await queryRunner.connect();

    const query = `
      SELECT
          amount, ventas.buy_price, ventas.sell_price, "date", "cigarrilloId", cigarrillos."name"
        FROM
          ventas
        INNER JOIN cigarrillos
        ON ventas."cigarrilloId" = cigarrillos.id
      WHERE ventas."date" = '${moment(date).format('YYYY-MM-DD')}'
    `

    const ventas = (await queryRunner.query(query));

    const totalGanancia = ventas.reduce((acc, obj)=>{return acc+(obj.amount*(obj.sell_price - obj.buy_price))}, 0);
    const totalVendido = ventas.reduce((acc, obj)=>{return acc+(obj.amount*obj.sell_price)}, 0);

    await queryRunner.release();



    const data:TableData[] = ventas.map(({amount, name})=>({
      tableData1:name,
      tableData2:`${amount}`,
    }));

    const response:DatoResponse = {
      tableHeader1:'Cigarrillo',
      tableHeader2:'Unidades vendidas',
      data,
      caption:`Ventas del ${moment(date).format('DD/MM/YYYY')}: $${totalVendido}. Ganancia total: $${totalGanancia}`
    }


    return response;
  }

  async ventasEntreDosDias(findBetweenTwoDatesDto:FindBetweenTwoDatesDto){
    const {initDate, endDate } = findBetweenTwoDatesDto;
    
    if (initDate > endDate) throw new BadRequestException('Init date should be same or before than end date');
    
    const queryRunner = this.dataSource.createQueryRunner();
        
    await queryRunner.connect();

    const query = `
      SELECT 
        ventas.date, 
        sum(ventas.amount*(ventas.sell_price-ventas.buy_price)) as "totalGanancia",
        sum(ventas.amount*ventas.sell_price) as "totalVendido"
      FROM ventas 
      WHERE  ventas.date >= '${moment(initDate).format('YYYY-MM-DD')}'::date
      AND    ventas.date   <= '${moment(endDate).format('YYYY-MM-DD')}'::date
      GROUP BY ventas.date
      ORDER BY ventas.date ASC;
    `
    const ventas = await queryRunner.query(query);
    
    const totalGananciaFinal = ventas.reduce((acc, obj)=>{return acc+Number(obj.totalGanancia)}, 0);
    const totalVendidoFinal = ventas.reduce((acc, obj)=>{return acc+Number(obj.totalVendido)}, 0);
    
    await queryRunner.release();

    const data:TableData[] = ventas.map(({date, totalVendido})=>({
      tableData1:`${moment(date).format('DD/MM/YYYY')}`,
      tableData2:`$${totalVendido}`,
    }));

    const response:DatoResponse = {
      tableHeader1:'Fecha',
      tableHeader2:'Total vendido',
      data,
      caption:`Ventas entre el ${moment(initDate).format('DD/MM/YYYY')} y el ${moment(endDate).format('DD/MM/YYYY')}: $${totalVendidoFinal}. Ganancia: $${totalGananciaFinal}`
    }

    return response;
  }

  async comprasDelDia(findByDateDto:FindByDateDto){
    const { date } = findByDateDto;
    
    const queryRunner = this.dataSource.createQueryRunner();
        
    await queryRunner.connect();

    const query = `
      SELECT
          amount, compras.buy_price, compras.sell_price, "date", "cigarrilloId", cigarrillos."name"
        FROM
          compras
        INNER JOIN cigarrillos
        ON compras."cigarrilloId" = cigarrillos.id
      WHERE compras."date" = '${moment(date).format('YYYY-MM-DD')}'
    `

    const compras = (await queryRunner.query(query));

    const totalComprado = compras.reduce((acc, obj)=>{return acc+(obj.amount*obj.buy_price)}, 0);

    await queryRunner.release();

    const data:TableData[] = compras.map(({amount, name})=>({
      tableData1:name,
      tableData2:`${amount}`,
    }));

    const response:DatoResponse = {
      tableHeader1:'Cigarrillo',
      tableHeader2:'Unidades compradas',
      data,
      caption:`Compras del ${moment(date).format('DD/MM/YYYY')}: $${totalComprado}`

    }

    return response;
  }

  async comprasEntreDosDias(findBetweenTwoDatesDto:FindBetweenTwoDatesDto){
    const {initDate, endDate } = findBetweenTwoDatesDto;
    
    if (initDate > endDate) throw new BadRequestException('Init date should be same or before than end date');
    
    const queryRunner = this.dataSource.createQueryRunner();
        
    await queryRunner.connect();

    const query = `
      SELECT 
        compras.date, 
        sum(compras.amount*compras.buy_price) as "totalComprado"
      FROM compras 
      WHERE  compras.date >= '${moment(initDate).format('YYYY-MM-DD')}'::date
      AND    compras.date   <= '${moment(endDate).format('YYYY-MM-DD')}'::date
      GROUP BY compras.date
      ORDER BY compras.date ASC;
      

    `
    const compras = await queryRunner.query(query);
    
    const totalComprado = compras.reduce((acc, obj)=>{return acc+Number(obj.totalComprado)}, 0);

    await queryRunner.release();

    const data:TableData[] = compras.map(({date, totalComprado})=>({
      tableData1:`${moment(date).format('DD/MM/YYYY')}`,
      tableData2:`$${totalComprado}`,
    }));

    const response:DatoResponse = {
      tableHeader1:'Cigarrillo',
      tableHeader2:'Cantidad vendida',
      data,
      caption:`Compras entre el ${moment(initDate).format('DD/MM/YYYY')} y el ${moment(endDate).format('DD/MM/YYYY')}: $${totalComprado}`
    }

    return response;
  }

  async diaDeMasUnidadesVendidas(){
    const queryRunner = this.dataSource.createQueryRunner();
        
    await queryRunner.connect();

    
    const query = `
      SELECT
        date,
        SUM( amount ) as "totalUnidadesVendidas"
      FROM
        ventas
      GROUP BY
        date
      ORDER BY
        "totalUnidadesVendidas" DESC;
    `

    const diaDeMasUnidadesVendidas = (await queryRunner.query(query));

    await queryRunner.release();


    const data:TableData[] = diaDeMasUnidadesVendidas.map(({date, totalUnidadesVendidas})=>({
      tableData1:`${moment(date).format('DD/MM/YYYY')}`,
      tableData2:`${totalUnidadesVendidas}`,
    }));

    const response:DatoResponse = {
      tableHeader1:'Fecha',
      tableHeader2:'Unidades vendidas',
      data
    }

    return response;

  }

  async diaDeMasUnidadesVendidasPorCigarrillo(){

    const queryRunner = this.dataSource.createQueryRunner();
        
    await queryRunner.connect();

    
    const query = `
      SELECT 
      DISTINCT ON (ventas."cigarrilloId")
        ventas."cigarrilloId", 
        MAX(amount) as "amount", 
        ventas.buy_price, 
        ventas.sell_price, 
        "date", 
        cigarrillos.name
      FROM   ventas
      INNER JOIN cigarrillos
      ON ventas."cigarrilloId" = cigarrillos.id
      WHERE  ventas."cigarrilloId" IS NOT NULL 
      GROUP  BY ventas."cigarrilloId", cigarrillos."name", "date", ventas.buy_price, ventas.sell_price
      ORDER  BY ventas."cigarrilloId" DESC
    `
    
    const diaDeMasUnidadesVendidasPorCigarrillo = (await queryRunner.query(query));

    await queryRunner.release();

    const data:TableData[] = diaDeMasUnidadesVendidasPorCigarrillo.map(({date, totalUnidadesVendidas})=>({
      tableData1:`${moment(date).format('DD/MM/YYYY')}`,
      tableData2:`${totalUnidadesVendidas}`,
    }));

    const response:DatoResponse = {
      tableHeader1:'Fecha',
      tableHeader2:'Unidades vendidas',
      data
    }

    return response;
  }

  async unidadesVendidasEntreDosDias(findBetweenTwoDatesDto:FindBetweenTwoDatesDto){
    const {initDate, endDate } = findBetweenTwoDatesDto;
    
    if (initDate > endDate) throw new BadRequestException('Init date should be same or before than end date');
    
    const queryRunner = this.dataSource.createQueryRunner();
        
    await queryRunner.connect();

    const query = `
      SELECT 
      DISTINCT ON (ventas."cigarrilloId")
      ventas."cigarrilloId",
      cigarrillos."name",
      SUM(amount) as "totalUnidadesVendidas"
      from ventas 
    
      INNER JOIN cigarrillos
      ON ventas."cigarrilloId" = cigarrillos.id
      WHERE  ventas."cigarrilloId" IS NOT NULL 
      AND  ventas.date >= '${moment(initDate).format('YYYY-MM-DD')}'::date
      AND  ventas.date <= '${moment(endDate).format('YYYY-MM-DD')}'::date
      GROUP  BY ventas."cigarrilloId", cigarrillos.name
      ORDER  BY ventas."cigarrilloId" DESC	
    `
    const unidadesVendidasEntreDosDias = await queryRunner.query(query);

    const totalUnidadesVendidas = unidadesVendidasEntreDosDias.reduce((acc, obj)=>{return acc+Number(obj.totalUnidadesVendidas)}, 0);

    await queryRunner.release();

    // const data:string[] = [
    //   `Unidades vendidas entre el ${moment(initDate).format('DD/MM/YYYY')} y el ${moment(endDate).format('DD/MM/YYYY')}`,
    //   `Total unidades vendidas: ${totalUnidadesVendidas}`,
    //   ...unidadesVendidasEntreDosDias
    //   .sort((a, b) => parseFloat(b.totalUnidadesVendidas) - parseFloat(a.totalUnidadesVendidas))
    //   .map(({name, totalUnidadesVendidas})=>
    //     `${totalUnidadesVendidas} unidades vendidas de ${name}`
    //   ),
    // ]

    const data:TableData[] = unidadesVendidasEntreDosDias
      .sort((a, b) => parseFloat(b.totalUnidadesVendidas) - parseFloat(a.totalUnidadesVendidas))
      .map(({name, totalUnidadesVendidas})=>({
        tableData1:`${name}`,
        tableData2:`${totalUnidadesVendidas}`,
      }));

    const response:DatoResponse = {
      tableHeader1:'Cigarrillo',
      tableHeader2:'Unidades vendidas',
      data
    }

    return response;
  }

}
