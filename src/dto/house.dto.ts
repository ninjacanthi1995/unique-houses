export class HouseDto {
  houseId: string;
  houseAddress: string;
}

export class RelationDto {
  [key: string]: {
    isChecked: boolean
    links: Set<string>
  }
}
