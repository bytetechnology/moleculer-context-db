import { Middleware, Context } from 'moleculer';
import { EntityManager } from 'mikro-orm';
import MoleculerMikroContext from '../service.databases/moleculer.mikro.context';
import DatabaseConnector from '../service.databases/database.connector';

let databaseConnector: DatabaseConnector;

const DatabaseContextManager = {
  setDatabaseConnector(connector: DatabaseConnector): void {
    databaseConnector = connector;
  },
  middleware(): Middleware {
    // This returns a moleculer middleware which appends the entity manager to the
    // context of the action call.
    if (!databaseConnector) {
      throw new Error(`databaseConnector not assigned, did you call 
      middleware() before calling setDatabaseConnector()?`);
    }
    return {
      localAction(handler: any) {
        return async function wrapActionWithTransaction(
          ctx: Context
        ) {
          const entityManager: EntityManager = databaseConnector.getORM()
            .em;
          const transactionResult = await entityManager.transactional(
            (em: EntityManager) => {
              const moleculerMikroCtx = ctx as MoleculerMikroContext;
              moleculerMikroCtx.entityManager = em;
              return handler(moleculerMikroCtx)
                .then((handlerResult: any) => {
                  return handlerResult;
                })
                .catch((err: Error) => {
                  ctx.broker.logger.error(
                    'Could not commit data changes, error:',
                    err
                  );
                  throw err;
                });
            }
          );
          return transactionResult;
        };
      }
    };
  }
};

export default DatabaseContextManager;
