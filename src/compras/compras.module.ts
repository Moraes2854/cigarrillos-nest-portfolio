import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ComprasService } from './compras.service';
import { ComprasController } from './compras.controller';
import { Compra } from './entities/compra.entity';
import { CigarrillosModule } from '../cigarrillos/cigarrillos.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  controllers: [ComprasController],
  providers: [ComprasService],
  imports:[
    AuthModule,
    CigarrillosModule,
    TypeOrmModule.forFeature([Compra])
  ],
  exports:[
    ComprasService,
    TypeOrmModule,
  ]

})
export class ComprasModule {}
