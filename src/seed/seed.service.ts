import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';

import { Cigarrillo } from '../cigarrillos/entities/cigarrillo.entity';
import { Compra } from '../compras/entities/compra.entity';
import { Venta } from '../ventas/entities/venta.entity';

import { AuthService } from '../auth/auth.service';
import { User } from '../auth/entities/user.entity';
import { cigarrillosQuery, comprasQuery, ventasQuery } from './data';
import { ValidRoles } from 'src/auth/interfaces';

@Injectable()
export class SeedService {

  private seedExecuted:boolean;

  constructor(

    @InjectRepository(Cigarrillo)
    private readonly cigarrilloRepository: Repository<Cigarrillo>,

    @InjectRepository(Compra)
    private readonly comprasRepository: Repository<Compra>,

    @InjectRepository(User)
    private readonly userRepository:Repository<User>,

    @InjectRepository(Venta)
    private readonly ventasRepository: Repository<Venta>,

    private readonly authService: AuthService,

    private readonly configService: ConfigService,

    private readonly dataSource:DataSource,
  ) {
    this.seedExecuted = (this.configService.getOrThrow<string>('seedExecuted') === 'FALSE') ? false : true;
  }

  async executeSeed(){
    if (!this.seedExecuted) {
      await this.deleteAllTables();
  
      const queryRunner = this.dataSource.createQueryRunner(); 
      await queryRunner.connect();

      await queryRunner.manager.query(cigarrillosQuery);
      await queryRunner.manager.query(comprasQuery);
      await queryRunner.manager.query(ventasQuery);  

      await queryRunner.release();
      
      await this.insertUsers();
  
      return 'SEED EXECUTED';
    }

    else return 'SEED HAS BEEN EXECUTED BEFORE'
  }



  private async deleteAllTables(){
    await this.comprasRepository.delete({});
    await this.ventasRepository.delete({});
    await this.cigarrilloRepository.delete({});
    await this.userRepository.delete({});
  }


  private async insertUsers(){

    const rolesAdmin:ValidRoles[]=['user', 'super-user', 'admin']

    await this.authService.createUser(({
      email:this.configService.get('email'),
      password:this.configService.get('password'),
      fullName:this.configService.get('fullName'),
    }), rolesAdmin);

    return true;
  }
}
