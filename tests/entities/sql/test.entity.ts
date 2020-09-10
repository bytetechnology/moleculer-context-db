import { Entity, Property, PrimaryKey } from '@mikro-orm/core';
import { v4 } from 'uuid';

@Entity()
export default class TestEntity {
  @PrimaryKey()
  uuid: string = v4();

  @Property()
  name!: string;

  @Property()
  date!: Date;
}
