import { BadRequestException, Injectable } from '@nestjs/common';
import { CsvParser } from 'nest-csv-parser'
const { Readable } = require('stream');
import { HouseDto, RelationDto } from './dto/house.dto';

@Injectable()
export class AppService {
  constructor(
    private csvParser: CsvParser
  ) { }

  async uniqueHouses(file: Express.Multer.File): Promise<number> {
    try {
      // Get list houses from file
      const stream = Readable.from(file.buffer);
      const data: { list: HouseDto[] } = await this.csvParser.parse(stream, HouseDto, null, null, { strict: true, separator: ',' })
      const houses: HouseDto[] = data.list;

      // Create 2 objects to map ids to addresses and vice versa
      let { idToAddresses, addressToIds } = this.initRelationObjects(houses)

      let result: number = 0;
      // Traverse list houses using these above objects
      Object.keys(idToAddresses).forEach((id: string) => {
        // Ignore node that is already passed
        if (idToAddresses[id].isChecked) {
          return
        }
        result++
        idToAddresses[id].isChecked = true
        // Traverse all linked nodes
        idToAddresses[id].links.forEach((link: string) => {
          this.traverse(link, idToAddresses, addressToIds, false)
        })
      })

      return result
    } catch (error) {
      throw error
    }
  }

  initRelationObjects(houses: HouseDto[]): { idToAddresses: RelationDto, addressToIds: RelationDto } {
    let idToAddresses: RelationDto = {}
    let addressToIds: RelationDto = {}

    houses.forEach((house: HouseDto) => {
      const { houseId, houseAddress }: HouseDto = house;
      if (!houseId || !houseAddress) {
        throw new BadRequestException('Wrong csv format')
      }
      this.linkProperties(houseId.trim(), houseAddress.trim(), idToAddresses)
      this.linkProperties(houseAddress.trim(), houseId.trim(), addressToIds)
    });

    return {
      idToAddresses,
      addressToIds
    }
  }

  linkProperties(prop1: string, prop2: string, object: RelationDto) {
    if (!object.hasOwnProperty(prop1)) {
      object[prop1] = {
        links: new Set([prop2]),
        isChecked: false
      }
    } else {
      object[prop1]?.links.add(prop2)
    }
  }

  traverse(node: string, idToAddresses: RelationDto, addressToIds: RelationDto, isIdObj: boolean) {
    const obj: RelationDto = isIdObj ? idToAddresses : addressToIds
    if (obj[node].isChecked) {
      return
    }
    obj[node].isChecked = true
    obj[node].links.forEach((link: string) => {
      this.traverse(link, idToAddresses, addressToIds, !isIdObj)
    })
  }
}
