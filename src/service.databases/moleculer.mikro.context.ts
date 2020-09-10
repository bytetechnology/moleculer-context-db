import moleculer from 'moleculer';
import { EntityManager } from '@mikro-orm/core';
import { MongoDriver } from '@mikro-orm/mongodb';

class MoleculerMikroContext<
  P = unknown,
  M extends object = {}
> extends moleculer.Context<P, M> {
  public entityManager!: EntityManager | EntityManager<MongoDriver>;
}

export default MoleculerMikroContext;
