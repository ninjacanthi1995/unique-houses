import { Test, TestingModule } from '@nestjs/testing';
import { readFileSync } from 'fs';
import { CsvModule } from 'nest-csv-parser';
import { AppController } from './app.controller';
import { AppService } from './app.service';

const getFile = (fileName): Express.Multer.File => {
  const data = readFileSync(__dirname + `/csv-files/${fileName}.csv`, { encoding: 'utf8' });
  return {
    buffer: Buffer.from(data, 'utf8'),
  } as Express.Multer.File
}

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      imports: [CsvModule],
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('Test API get unique houses', () => {
    it('should return correct result for the example test', async () => {
      const mockFile = getFile('example')
      const result = await appController.uniqueHouses(mockFile);
      expect(result).toBe(3)
    });

    it('should return correct result for the all related case', async () => {
      const mockFile = getFile('all-related')
      const result = await appController.uniqueHouses(mockFile);
      expect(result).toBe(1)
    });

    it('should return correct result for the all unique case', async () => {
      const mockFile = getFile('all-unique')
      const result = await appController.uniqueHouses(mockFile);
      expect(result).toBe(13)
    });

    it('should return correct result for the load test 1000 all unique case', async () => {
      const mockFile = getFile('1000-all-unique')
      const result = await appController.uniqueHouses(mockFile);
      expect(result).toBe(1000)
    });

    it('should return correct result for the load test 100000 all unique case', async () => {
      const mockFile = getFile('100000-all-unique')
      const result = await appController.uniqueHouses(mockFile);
      expect(result).toBe(100000)
    });

    it('should throw error for invalid csv format', async () => {
      try {
        const mockFile = getFile('invalid')
        await appController.uniqueHouses(mockFile);
      } catch (e) {
        expect(e.message).toBe('Wrong csv format')
      }
    });
  });
});
