import moleculer from 'moleculer';
import { EntityManager } from '@mikro-orm/core';

class MoleculerMikroContext<
  P = unknown,
  M extends object = {}
> extends moleculer.Context<P, M> {
  public entityManager!: EntityManager;
}

export default MoleculerMikroContext;
