import { Injectable } from '@nestjs/common';
import { CsvParser } from 'nest-csv-parser'
const { Readable } = require('stream');
import { HouseEntity, RelationEntity } from './entities/house.entity';

@Injectable()
export class AppService {
  constructor(
    private csvParser: CsvParser
  ) { }

  getHello(): string {
    return 'Hello World!';
  }

  async uniqueHouses(file: Express.Multer.File): Promise<number> {
    const stream = Readable.from(file.buffer);
    const data: { list: HouseEntity[] } = await this.csvParser.parse(stream, HouseEntity, null, null, { strict: true, separator: ',' })
    const houses: HouseEntity[] = data.list;
    let { idToAddresses, addressToIds } = this.initRelationObjects(houses)

    let result: number = 0;
    Object.keys(idToAddresses).forEach((id: string) => {
      if (idToAddresses[id].isChecked) {
        return
      }
      result++
      idToAddresses[id].isChecked = true
      idToAddresses[id].links.forEach((link: string) => {
        this.traverse(link, idToAddresses, addressToIds, false)
      })
    })

    return result
  }

  initRelationObjects(houses: HouseEntity[]): { idToAddresses: RelationEntity, addressToIds: RelationEntity } {
    let idToAddresses: RelationEntity = {}
    let addressToIds: RelationEntity = {}

    houses.forEach((house: HouseEntity) => {
      const { houseId, houseAddress }: HouseEntity = house;
      this.linkProperties(houseId, houseAddress, idToAddresses)
      this.linkProperties(houseAddress, houseId, addressToIds)
    });

    return {
      idToAddresses,
      addressToIds
    }
  }

  linkProperties(prop1: string, prop2: string, object: RelationEntity) {
    if (!object.hasOwnProperty(prop1)) {
      object[prop1] = {
        links: new Set([prop2]),
        isChecked: false
      }
    } else {
      object[prop1]?.links.add(prop2)
    }
  }

  traverse(node: string, idToAddresses: RelationEntity, addressToIds: RelationEntity, isIdObj: boolean) {
    const obj: RelationEntity = isIdObj ? idToAddresses : addressToIds
    if (obj[node].isChecked) {
      return
    }
    obj[node].isChecked = true
    obj[node].links.forEach((link: string) => {
      this.traverse(link, idToAddresses, addressToIds, !isIdObj)
    })
  }
}
