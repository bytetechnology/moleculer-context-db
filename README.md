moleculer-context-db
========================
A database integrator for injecting a transaction safe database session into the
context of the action.

## Setup

### Installation

To install with npm
```shell script
npm install moleculer-context-db
```
### Importing

ES6 style

```js
import {
  MikroConnector,
  DatabaseContextManager
} from 'moleculer-context-db';
```

CommonJS
```js
const {
  MikroConnector,
  DatabaseContextManager
} = require('winston-gelf-transporter');
``` 

### Configuration 

You can create a new MikroConnector as such
```js
const connector = new MikroConnector();
```

You will then need to initialize the connector
```js
const databaseType = 'mongodb';
const databaseName = 'database-name';
const databaseUrl = 'mongodb://localhost:27017';
const mikroOrmEntities = [YourEntity1, YourEntity2];
await connector.init(
  databaseType,
  databaseName,
  url,
  './path/to/migrations/from/cwd',
  mikroOrmEntities
)
```

## Usage

To use, simply add your connector to the DatabaseContextManager and then add
the result of the middleware method to your broker's middleware

```javascript

DatabaseContextManager.setDatabaseConnector(connector);

yourMoleculerBroker.middlewares.add(
  DatabaseContextManager.middleware()
);

```
The above statement will wrap all local actions with a Mikro ORM transaction.