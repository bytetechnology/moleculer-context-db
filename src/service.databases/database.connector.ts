import { MikroORM } from 'mikro-orm';

export default abstract class DatabaseConnector {
  abstract init(options?: any): Promise<void | Error>;

  abstract getORM(): MikroORM;
}
