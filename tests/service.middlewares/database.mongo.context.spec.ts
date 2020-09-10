/**
 * Entry point for unit test.
 * Uses the moleculer microservices framework.
 *
 * Copyright Byte Technology 2020. All rights reserved.
 */

import { ServiceBroker, Service } from 'moleculer';
import { MongoDriver } from '@mikro-orm/mongodb';
import { MongoMemoryServer } from 'mongodb-memory-server';

import { DatabaseContextManager, MikroConnector } from '../../src';
import MongoTestEntity from '../entities/mongo/test.entity';

import SampleService from '../service/mongo/sample.service';

describe('Mongo unit tests', () => {
  let broker: ServiceBroker;
  let service: Service;
  let mongod: MongoMemoryServer;
  let connector: MikroConnector<MongoDriver>;
  let entityId: string;

  beforeAll(async done => {
    // create a new moleculer service broker
    broker = new ServiceBroker({ logLevel: 'fatal' });

    // create an in-memory mongodb instance
    mongod = new MongoMemoryServer();
    const uri = await mongod.getUri();
    const dbName = await mongod.getDbName();

    // create our DatabaseContext with MikroConnector
    connector = new MikroConnector<MongoDriver>();
    await connector.init({
      type: 'mongo',
      dbName,
      clientUrl: uri,
      entities: [MongoTestEntity],
      cache: {
        enabled: false
      }
    });
    await connector.getORM().em.getDriver().createCollections();
    const dbContext = new DatabaseContextManager(connector);
    // add the db middleware to the broker
    broker.middlewares.add(dbContext.middleware());

    // create our service and start the broker
    service = broker.createService(SampleService);
    await broker.start();
    await broker.waitForServices('sample');
    done();
  });

  afterAll(async done => {
    await broker.destroyService(service);
    await broker.stop();
    await connector.getORM().close();
    await mongod.stop();
    done();
  });

  test('Ping test', async done => {
    // call an action without a parameter object
    const response: string = await broker.call('sample.ping');
    expect(response).toBe('Hello World!');
    done();
  });

  test('Test database entity creation', async done => {
    // create a sample entity
    entityId = await broker.call(
      'sample.addTestEntity',
      {
        name: 'John Doe'
      },
      { caller: 'jest' }
    );

    expect(entityId).toBeTruthy();
    done();
  });

  test('Test database entity fetch by id', async done => {
    // create a sample entity
    const entityName = await broker.call(
      'sample.getTestEntityById',
      {
        id: entityId
      },
      { caller: 'jest' }
    );

    expect(entityName).toBe('John Doe');
    done();
  });

  test('Test database entity fetch by name', async done => {
    // create a sample entity
    const theId = await broker.call(
      'sample.getTestEntityByName',
      {
        name: 'John Doe'
      },
      { caller: 'jest' }
    );

    expect(theId).toBeTruthy();
    done();
  });

  test('Test invalid database entity fetch by id', async done => {
    // create a sample entity
    await expect(
      broker.call(
        'sample.getTestEntityById',
        {
          id: '1234'
        },
        { caller: 'jest' }
      )
    ).rejects.toThrow();
    done();
  });

  test('Test invalid database entity fetch by name', async done => {
    // create a sample entity
    await expect(
      broker.call(
        'sample.getTestEntityByName',
        {
          name: 'Jane Doe'
        },
        { caller: 'jest' }
      )
    ).rejects.toThrow();
    done();
  });

  test('Generate valid sample event', async done => {
    // create a spy to look at events
    const spy = jest.spyOn(service, 'eventTester');

    await broker.emit('sample.testEntityEvent', {
      name: 'John Doe'
    });

    expect(spy).toBeCalledTimes(1);
    done();
  });

  test('Generate invalid sample event', async done => {
    // create a spy to look at events
    const spy = jest.spyOn(service, 'eventTester');

    await broker.emit('sample.testEntityEvent', {
      name: 'Jane Doe'
    });

    expect(spy).toBeCalledTimes(1);
    done();
  });
});
