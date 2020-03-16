# moleculer-context-db

A database integrator for injecting a transaction safe database session into the
context of the action. Currently, this only has built in support for [Mikro-ORM](https://mikro-orm.io/)

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
} = require('moleculer-context-db');
```

### Configuration

You can create a new MikroConnector as such

```js
const connector = new MikroConnector();
```

You will then need to initialize the connector

```js
await connector.init({
  type: 'sqlite',
  dbName: ':memory',
  entities: [YourEntity1, YourEntity2],
  cache: {
    enabled: false
  }
});
```

You can use all available options for MikroORM.init()

## Usage

To use, simply instantiate a DatabaseContextManager with the connector and then add
the result of the middleware method to your broker's middleware

```javascript
const dbContextManager: DatabaseContextManager = new DatabaseContextManager(
  connector
);

yourMoleculerBroker.middlewares.add(
  DatabaseContextManager.middleware()
);
```

The above statement will wrap all local actions with a Mikro-ORM transaction.
