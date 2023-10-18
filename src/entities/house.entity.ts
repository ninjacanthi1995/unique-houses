export class HouseEntity {
  houseId: string;
  houseAddress: string;
}

export class RelationEntity {
  [key: string]: {
    isChecked: boolean
    links: Set<string>
  }
}
