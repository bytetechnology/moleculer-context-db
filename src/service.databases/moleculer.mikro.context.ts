import moleculer from 'moleculer';
import { EntityManager } from 'mikro-orm';
import { MongoDriver } from 'mikro-orm/dist/drivers/MongoDriver';

class MoleculerMikroContext<
  P = unknown,
  M extends object = {}
> extends moleculer.Context<P, M> {
  public entityManager!: EntityManager | EntityManager<MongoDriver>;
}

export default MoleculerMikroContext;
