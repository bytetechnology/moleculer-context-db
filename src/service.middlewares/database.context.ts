import { Middleware, Context } from 'moleculer';
import { EntityManager } from '@mikro-orm/core';
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
        // use a forked entity manager for dealing with mongo unless implicitTransactions is set to true
        if (
          dbConnector.getORM().config.get('type') === 'mongo' &&
          !dbConnector.getORM().config.get('implicitTransactions')
        ) {
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
        }

        return async function wrapActionWithTransaction(ctx: Context) {
          const entityManager: EntityManager = dbConnector.getORM().em;
          // we are intransactional more, so use the em.transactional which will inject a forked EntityManager and then flush at end
          const transactionResult = await entityManager.transactional(
            async (em: EntityManager) => {
              // inject the forked EntityManger into moleculer context
              const moleculerMikroCtx = ctx as MoleculerMikroContext;
              moleculerMikroCtx.entityManager = em; // already forked

              // call handler
              const handlerResult = await handler(moleculerMikroCtx);

              // return handler result
              return handlerResult;
            }
          );
          return transactionResult;
        };
      },

      localEvent(handler: any) {
        // use a forked entity manager for dealing with mongo unless implicitTransactions is set to true
        if (
          dbConnector.getORM().config.get('type') === 'mongo' &&
          !dbConnector.getORM().config.get('implicitTransactions')
        ) {
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

        return async function wrapEventWithTransaction(ctx: Context) {
          const entityManager: EntityManager = dbConnector.getORM().em;
          // we are intransactional more, so use the em.transactional which will inject a forked EntityManager and then flush at end
          const transactionResult = await entityManager.transactional(
            async (em: EntityManager) => {
              // inject the forked EntityManger into moleculer context
              const moleculerMikroCtx = ctx as MoleculerMikroContext;
              moleculerMikroCtx.entityManager = em; // already forked

              // call handler
              const handlerResult = await handler(moleculerMikroCtx);

              // return handler result
              return handlerResult;
            }
          );
          return transactionResult;
        };
      }
    };
  }
}

export default DatabaseContextManager;
