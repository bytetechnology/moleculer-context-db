import { MikroORM } from 'mikro-orm';

export default abstract class DatabaseConnector {
  abstract getORM(): MikroORM;
}
