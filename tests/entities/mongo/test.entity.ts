import {
  Entity,
  MongoEntity,
  Property,
  PrimaryKey,
  SerializedPrimaryKey
} from 'mikro-orm';
import { ObjectId } from 'mongodb';

@Entity()
export default class TestEntity implements MongoEntity<TestEntity> {
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
