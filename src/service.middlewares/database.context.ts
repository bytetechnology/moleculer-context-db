import { Middleware, Context } from 'moleculer';
import { EntityManager } from '@mikro-orm/core';
import { MongoDriver } from '@mikro-orm/mongodb';
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
          return function wrapActionWithMongoCommit(ctx: Context) {
            const em: EntityManager<MongoDriver> = dbConnector.getORM()
              .em as EntityManager<MongoDriver>;
            const moleculerMikroCtx = ctx as MoleculerMikroContext;
            moleculerMikroCtx.entityManager = em.fork();
            return handler(moleculerMikroCtx)
              .then(async (handlerResult: any) => {
                // flush to DB
                await moleculerMikroCtx.entityManager.flush();
                return handlerResult;
              })
              .catch((err: Error) => {
                ctx.broker.logger.error('MikroORM error:', err);
                throw err;
              });
          };
        }

        return async function wrapActionWithTransaction(ctx: Context) {
          const entityManager: EntityManager = dbConnector.getORM().em;
          const transactionResult = await entityManager.transactional(
            (em: EntityManager) => {
              const moleculerMikroCtx = ctx as MoleculerMikroContext;
              moleculerMikroCtx.entityManager = em;
              return handler(moleculerMikroCtx)
                .then((handlerResult: any) => {
                  return handlerResult;
                })
                .catch((err: Error) => {
                  ctx.broker.logger.error('MikroORM error:', err);
                  throw err;
                });
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
          return function wrapEventWithMongoCommit(ctx: Context) {
            const em: EntityManager<MongoDriver> = dbConnector.getORM()
              .em as EntityManager<MongoDriver>;
            const moleculerMikroCtx = ctx as MoleculerMikroContext;
            moleculerMikroCtx.entityManager = em.fork();
            return handler(moleculerMikroCtx).then(
              async (handlerResult: any) => {
                // flush to DB
                await moleculerMikroCtx.entityManager.flush();
                return handlerResult;
              }
            );
          };
        }

        return async function wrapEventWithTransaction(ctx: Context) {
          const entityManager: EntityManager = dbConnector.getORM().em;
          const transactionResult = await entityManager.transactional(
            (em: EntityManager) => {
              const moleculerMikroCtx = ctx as MoleculerMikroContext;
              moleculerMikroCtx.entityManager = em;
              return handler(moleculerMikroCtx)
                .then((handlerResult: any) => {
                  return handlerResult;
                })
                .catch((err: Error) => {
                  ctx.broker.logger.error('MikroORM error:', err);
                  throw err;
                });
            }
          );
          return transactionResult;
        };
      }
    };
  }
}

export default DatabaseContextManager;
