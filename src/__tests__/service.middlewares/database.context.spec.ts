import { Service, ActionSchema, ServiceBroker } from 'moleculer';
import * as uuid from 'uuid';
import DatabaseContextManager from '../../service.middlewares/database.context';
import MikroConnector from '../../service.databases/mikro.connector';
import MoleculerMikroContext from '../../service.databases/moleculer.mikro.context';
import TestEntity from '../test.entity';

describe('DatabaseContext', () => {
  test('DatabaseContextManager with no connector throws error', () => {
    expect(DatabaseContextManager.middleware).toThrowError();
  });
  describe('Middleware With Connector Set', () => {
    let connector: MikroConnector;
    let spy: jest.SpyInstance;
    const broker = new ServiceBroker();
    const endpoint = {
      broker,
      id: 'ABC',
      node: {},
      local: true,
      state: true
    };
    beforeAll(async done => {
      connector = new MikroConnector();
      await connector.init(
        'sqlite',
        'test_sqlite_db',
        ':memory:',
        './',
        [TestEntity]
      );
      DatabaseContextManager.setDatabaseConnector(connector);
      spy = jest.spyOn(connector.getORM().em, 'fork');
      const generator = connector.getORM().getSchemaGenerator();
      await generator.dropSchema();
      await generator.createSchema();
      return done();
    });
    afterAll(async done => {
      const generator = connector.getORM().getSchemaGenerator();
      await generator.dropSchema();
      await connector.getORM().close();
      return done();
    });
    test(`transactionWrapper() forks the entity manager
    and starts transaction`, async done => {
      const transactionWrapper = DatabaseContextManager.middleware().localAction(
        async function testContextForNewEntityManager(
          this: Service,
          ctx: MoleculerMikroContext
        ) {
          expect(spy).toHaveBeenCalledTimes(1);
          expect(ctx.entityManager.isInTransaction()).toBeTruthy();
          return Promise.resolve();
        } as any,
        {} as ActionSchema
      );
      await transactionWrapper(
        new MoleculerMikroContext(broker, endpoint)
      );
      done();
    });
    describe('wrapActionWithTransaction', () => {
      let localUuid: string = '';
      const testEntityName = 'testing';
      const testEntity: TestEntity = new TestEntity();
      beforeAll(() => {
        localUuid = uuid.v4();
        testEntity.uuid = localUuid;
        testEntity.date = new Date();
        testEntity.name = testEntityName;
      });
      afterEach(async done => {
        await connector
          .getORM()
          .em.remove(TestEntity, { uuid: localUuid });
        return done();
      });
      test(`all changes are made when there are no errors`, async done => {
        const transactionWrapper = DatabaseContextManager.middleware().localAction(
          function testChangesArePersisted(
            this: Service,
            ctx: MoleculerMikroContext
          ) {
            ctx.entityManager.persistLater(testEntity);
            return Promise.resolve();
          } as any,
          {} as ActionSchema
        );
        try {
          await transactionWrapper(
            new MoleculerMikroContext(broker, endpoint)
          );
          const localTestEntity: TestEntity | null = await connector
            .getORM()
            .em.findOne(TestEntity, { name: testEntityName });
          if (localTestEntity !== null) {
            expect(localTestEntity.uuid).toEqual(localUuid);
          } else {
            expect(1).toEqual(0);
          }
        } catch (e) {
          expect(e).toBeFalsy();
        }
        done();
      });
      test(`no changes are made when there are invalid changes`, async done => {
        const transactionWrapper = DatabaseContextManager.middleware().localAction(
          function testChangesArePersisted(
            this: Service,
            ctx: MoleculerMikroContext
          ) {
            ctx.entityManager.persistLater(testEntity);
            const invalidTestEntity: TestEntity = new TestEntity();
            ctx.entityManager.persistLater(invalidTestEntity);
            return Promise.resolve();
          } as any,
          {} as ActionSchema
        );
        try {
          await transactionWrapper(
            new MoleculerMikroContext(broker, endpoint)
          );
        } catch (e) {
          expect(e).toBeTruthy();
        }
        const fetchedTestEntity: TestEntity | null = await connector
          .getORM()
          .em.findOne(TestEntity, { name: testEntityName });
        expect(fetchedTestEntity).toBeNull();
        done();
      });
      test(`no changes are made when the promise rejects`, async done => {
        const transactionWrapper = DatabaseContextManager.middleware().localAction(
          function testChangesArePersisted(
            this: Service,
            ctx: MoleculerMikroContext
          ) {
            ctx.entityManager.persistLater(testEntity);
            return Promise.reject();
          } as any,
          {} as ActionSchema
        );
        const mikroContext = new MoleculerMikroContext(
          broker,
          endpoint
        );
        const errorLogSpy = jest.spyOn(
          mikroContext.broker.logger,
          'error'
        );
        try {
          await transactionWrapper(mikroContext);
        } catch (e) {
          expect(e).toBeTruthy();
        }
        const fetchedTestEntity: TestEntity | null = await connector
          .getORM()
          .em.findOne(TestEntity, { name: testEntityName });
        expect(fetchedTestEntity).toBeNull();
        expect(errorLogSpy).toHaveBeenCalledTimes(1);
        done();
      });
    });
  });
});
