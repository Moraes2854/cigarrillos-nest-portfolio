import * as fs from 'fs';
import { Controller, Get, Post, Res } from '@nestjs/common';
import { Response } from 'express';

import { BackupService } from './backup.service';
import { Auth } from '../auth/decorators/auth.decorator';

@Controller('backup')
export class BackupController {
  constructor(private readonly backupService: BackupService) {}

  @Post()
  async getBackup(   
    @Res() res:Response
  ){
    const fileURL = await this.backupService.createBackup();
    res.contentType('application/pgsql');
    res.setHeader('Content-Disposition', `attachment; filename="backup.pgsql"`);
    return res.download(fileURL, (err)=>{
      if (err) throw err;
      fs.unlinkSync(fileURL);
    });

  }

  @Post('deleteBackupsFiles')
  @Auth('admin')
  async deleteBackupsFiles(){
    return this.backupService.deleteBackupsFiles();
  }

}
