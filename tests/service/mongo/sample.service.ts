// Moleculer micro-services framework
import moleculer from 'moleculer';
import { Action, Event, Method, Service } from 'moleculer-decorators';

import { MoleculerMikroContext } from '../../../src';
import TestEntity from '../../entities/mongo/test.entity';

// Define our service
@Service({
  // Our service name
  name: 'sample'
})
class Sample extends moleculer.Service {
  // Our actions
  @Action()
  ping(ctx: moleculer.Context) {
    this.logger.info(
      `hello got called from ${ctx.nodeID}; caller: ${ctx.caller}`
    );
    return `Hello World!`;
  }

  @Action({
    cache: false,
    params: {
      name: 'string'
    }
  })
  async addTestEntity(ctx: MoleculerMikroContext<{ name: string }>) {
    this.logger.info(`addTestEntity got called from ${ctx.nodeID}`);
    const em = ctx.entityManager;
    const newEntity = new TestEntity(ctx.params.name);
    await em.persistAndFlush([newEntity]);
    return newEntity.id;
  }

  @Action({
    cache: false,
    params: {
      id: 'string'
    }
  })
  async getTestEntityById(ctx: MoleculerMikroContext<{ id: string }>) {
    this.logger.info(`getTestEntity got called from ${ctx.nodeID}`);
    const em = ctx.entityManager;
    const entity = await em.findOne<TestEntity>(TestEntity, {
      id: ctx.params.id
    });
    if (entity) {
      return entity.name;
    }
    throw Error(`Could not find entity by id ${ctx.params.id}`);
  }

  @Action({
    cache: false,
    params: {
      name: 'string'
    }
  })
  async getTestEntityByName(ctx: MoleculerMikroContext<{ name: string }>) {
    this.logger.info(`getTestEntity got called from ${ctx.nodeID}`);
    const em = ctx.entityManager;
    const entity = await em.findOne<TestEntity>(TestEntity, {
      name: ctx.params.name
    });
    if (entity) {
      return entity.id;
    }
    throw Error(`Could not find entity by name ${ctx.params.name}`);
  }

  @Event({
    params: {
      name: 'string'
    }
  })
  async 'sample.testEntityEvent'(ctx: MoleculerMikroContext<{ name: string }>) {
    this.logger.info(
      `Got event from sender ${ctx.nodeID}; id: ${ctx.params.name}`
    );
    const em = ctx.entityManager;
    const entity = await em.findOne<TestEntity>(TestEntity, {
      name: ctx.params.name
    });
    if (entity) {
      this.eventTester();
    }
    throw Error(`Could not find entity by name ${ctx.params.name}`);
  }

  @Method
  eventTester(): void {} // eslint-disable-line class-methods-use-this
}

export default Sample;
