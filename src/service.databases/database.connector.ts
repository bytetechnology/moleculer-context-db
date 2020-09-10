import { MikroORM } from '@mikro-orm/core';

export default abstract class DatabaseConnector {
  abstract init(options?: any): Promise<void | Error>;

  abstract getORM(): MikroORM;
}
