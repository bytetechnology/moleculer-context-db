import {
  Entity,
  Property,
  PrimaryKey,
  SerializedPrimaryKey
} from '@mikro-orm/core';
import { ObjectId } from '@mikro-orm/mongodb';

@Entity()
export default class TestEntity {
  @PrimaryKey()
  _id!: ObjectId;

  @SerializedPrimaryKey()
  id!: string;

  @Property()
  name!: string;

  @Property()
  date!: Date;

  constructor(name: string) {
    this.name = name;
    this.date = new Date();
  }
}
