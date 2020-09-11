import { MikroORM } from '@mikro-orm/core';

export type ORM = MikroORM;

export default abstract class DatabaseConnector {
  abstract init(options?: any): Promise<ORM | Error>;

  abstract getORM(): ORM;
}
