import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CigarrillosService } from './cigarrillos.service';
import { CigarrillosController } from './cigarrillos.controller';
import { Cigarrillo } from './entities/cigarrillo.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  controllers: [ CigarrillosController ],
  providers: [ CigarrillosService ],
  imports:[
    AuthModule,
    TypeOrmModule.forFeature([Cigarrillo])
  ],
  exports:[
    CigarrillosService,
    TypeOrmModule,
  ]
})
export class CigarrillosModule {}
