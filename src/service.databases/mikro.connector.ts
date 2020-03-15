import {
  Configuration,
  IDatabaseDriver,
  MikroORM,
  Options
} from 'mikro-orm';
import DatabaseConnector from './database.connector';

class MikroConnector extends DatabaseConnector {
  orm!: MikroORM;

  async init<D extends IDatabaseDriver = IDatabaseDriver>(
    options?: Options<D> | Configuration<D>
  ): Promise<void | Error> {
    try {
      this.orm = await MikroORM.init(options);
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
