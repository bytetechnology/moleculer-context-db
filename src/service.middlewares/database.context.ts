import { Middleware, Context } from 'moleculer';
import MoleculerMikroContext from '../service.databases/moleculer.mikro.context';
import DatabaseConnector from '../service.databases/database.connector';

class DatabaseContextManager {
  databaseConnector: DatabaseConnector;

  constructor(databaseConnector: DatabaseConnector) {
    this.databaseConnector = databaseConnector;
  }

  // This returns a moleculer middleware which appends the entity manager to the
  // context of the action call.
  middleware(): Middleware {
    const dbConnector: DatabaseConnector = this.databaseConnector;

    return {
      localAction(handler: any) {
        return async function wrapActionWithMongoCommit(ctx: Context) {
          const { em } = dbConnector.getORM();

          // inject a forked EntityManager into the moleculer context
          const moleculerMikroCtx = ctx as MoleculerMikroContext;
          moleculerMikroCtx.entityManager = em.fork();

          // call the handler
          const handlerResult = await handler(moleculerMikroCtx);

          // flush the entity manager
          await moleculerMikroCtx.entityManager.flush();

          // return handler result
          return handlerResult;
        };
      },

      localEvent(handler: any) {
        return async function wrapEventWithMongoCommit(ctx: Context) {
          const { em } = dbConnector.getORM();

          // inject a forked EntityManager into the moleculer context
          const moleculerMikroCtx = ctx as MoleculerMikroContext;
          moleculerMikroCtx.entityManager = em.fork();

          // call the handler
          const handlerResult = await handler(moleculerMikroCtx);

          // flush the entity manager
          await moleculerMikroCtx.entityManager.flush();

          // return handler result
          return handlerResult;
        };
      }
    };
  }
}

export default DatabaseContextManager;
