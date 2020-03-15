import { Entity, UuidEntity, Property, PrimaryKey } from 'mikro-orm';

@Entity()
export default class TestEntity implements UuidEntity<TestEntity> {
  @PrimaryKey()
  uuid: string;

  @Property()
  name!: string;

  @Property()
  date!: Date;
}
