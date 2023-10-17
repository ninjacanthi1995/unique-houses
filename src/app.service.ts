import { Injectable } from '@nestjs/common';
import { createReadStream } from 'fs';
import { CsvParser } from 'nest-csv-parser'
import { open } from 'node:fs/promises';
const { Readable } = require('stream');
import { HouseEntity } from './entities/house.entity';

@Injectable()
export class AppService {
  constructor(
    private csvParser: CsvParser
  ) {}

  getHello(): string {
    return 'Hello World!';
  }

  async uniqueHouses(file: Express.Multer.File): Promise<number> {
    const stream = Readable.from(file.buffer);
    
    const entities: any = await this.csvParser.parse(stream, HouseEntity, null, null, { strict: true, separator: ',' })

    return entities.list.length
  }
}
