import * as fs from 'fs';
import { exec } from 'child_process'; 
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';



@Injectable()
export class BackupService {

  constructor(
    private readonly configService: ConfigService,
  ) {}

  async createBackup(): Promise<string>  {

    return new Promise(async (resolve, reject)=>{
      fs.mkdirSync(`${__dirname}/backups`, {recursive:true});
      const file = `${__dirname}/backups/backup.pgsql`
      const command = `PGPASSWORD="${this.configService.get('dbPassword')}" pg_dump -U ${this.configService.get('dbUsername')} -h ${this.configService.get('dbHost')} ${this.configService.get('dbName')} > ${file}`;
      exec(command, (err)=>{
        if (err){
          console.log(err);
          throw new InternalServerErrorException('Internal server error please check logs, [Creating database backup]');
        }
        resolve(file);
      })
    })
  }

  deleteBackupsFiles():Promise<boolean>{
    return new Promise((resolve, reject)=>{
      fs.promises.unlink(`${__dirname}/backups`)
      .then(()=>resolve(true))
      .catch((err)=>{
        reject(err);
        throw new InternalServerErrorException(err.message);
      })
    })
  }


}


// async getFullDatabase(): Promise<string>  {

//   return new Promise(async (resolve, reject)=>{
//     const cigarrillos = await this.cigarrilloRepository.find({});
//     const compras = await this.comprasRepository.find({relations:{cigarrillo:true}});
//     const ventas = await this.ventasRepository.find({relations:{cigarrillo:true}});

//     let text = `
//       ${cigarrillos.map((c)=>{
//         return `INSERT INTO cigarrillos(id,name,stock,buy_price,sell_price,"isActive") VALUES('${c.id}', '${c.name}', ${c.stock}, ${c.buy_price}, ${c.sell_price}, ${(c.isActive) ? 'TRUE' : 'FALSE'})`
//       }).join(';\n')}

//       ${compras.map((c)=>{
//         return `INSERT INTO compras(id,amount,buy_price,sell_price,date,"cigarrilloId") VALUES ('${c.id}', ${c.amount}, ${c.buy_price}, ${c.sell_price}, '${moment(c.date).format('YYYY-MM-DD')} 00:00:00', '${c.cigarrillo.id}');`
//       }).join(';\n')}

//       ${ventas.map((v)=>{
//         return `INSERT INTO ventas(id,amount,buy_price,sell_price,date,"cigarrilloId") VALUES ('${v.id}', ${v.amount}, ${v.buy_price}, ${v.sell_price}, '${moment(v.date).format('YYYY-MM-DD')} 00:00:00', '${v.cigarrillo.id}');`
//       }).join(';\n')}

//     `;
     
//     fs.mkdirSync(`${__dirname}/backups`, {recursive:true});
    
//     const path = `${__dirname}/backups/cigarrillosBACKUP${moment().format('DD-MM-YYYY')}.sql`;

//     fs.promises.appendFile(path, text)
//     .then(()=>resolve(path))
//     .catch((err)=>{
//       if(err) {
//         console.log(err);
//         reject(err);
//       }
//     })

//   })
// }





