import { MikroORM } from 'mikro-orm';
import {
  EntityClass,
  EntityClassGroup,
  AnyEntity
} from 'mikro-orm/dist/typings';
import { EntitySchema } from 'mikro-orm/dist/schema';
import DatabaseConnector from './database.connector';

class MikroConnector extends DatabaseConnector {
  orm!: MikroORM;

  async init(
    dbType: 'postgresql' | 'sqlite' | 'mysql' | 'mongo',
    dbName: string,
    url: string,
    migrationPath: string,
    entities: (
      | EntityClass<AnyEntity>
      | EntityClassGroup<AnyEntity>
      | EntitySchema<any>
    )[]
  ): Promise<void | Error> {
    try {
      this.orm = await MikroORM.init({
        entities,
        type: dbType,
        clientUrl: url,
        dbName,
        migrations: {
          path: migrationPath,
          transactional: true,
          allOrNothing: true
        }
      });
      return Promise.resolve();
    } catch (err) {
      return Promise.reject(err);
    }
  }

  getORM(): MikroORM {
    return this.orm;
  }
}

export default MikroConnector;
