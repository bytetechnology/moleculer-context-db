import { Entity, UuidEntity, Property, PrimaryKey } from 'mikro-orm';
import { v4 } from 'uuid';

@Entity()
export default class TestEntity implements UuidEntity<TestEntity> {
  @PrimaryKey()
  uuid: string = v4();

  @Property()
  name!: string;

  @Property()
  date!: Date;
}
