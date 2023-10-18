import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { UploadedFile, UseInterceptors } from '@nestjs/common/decorators';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('houses')
  @UseInterceptors(FileInterceptor('file'))
  async uniqueHouses(@UploadedFile() file: Express.Multer.File) {
    return await this.appService.uniqueHouses(file);
  }
}
