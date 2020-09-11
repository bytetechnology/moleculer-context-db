import {
  Configuration,
  IDatabaseDriver,
  MikroORM,
  Options
} from '@mikro-orm/core';
import DatabaseConnector from './database.connector';

class MikroConnector<
  D extends IDatabaseDriver = IDatabaseDriver
> extends DatabaseConnector {
  orm!: MikroORM<D>;

  async init(
    options?: Options<D> | Configuration<D>
  ): Promise<MikroORM | Error> {
    try {
      this.orm = await MikroORM.init<D>(options);
      return this.orm;
    } catch (err) {
      return Promise.reject(err);
    }
  }

  getORM(): MikroORM<D> {
    return this.orm;
  }
}

export default MikroConnector;
