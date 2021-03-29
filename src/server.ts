import dotenv from '@ev-fns/dotenv';

dotenv({}, dotenv.startup);

import server from '@ev-fns/server';
import app from './app';

server(app, +(process.env.PORT || 0) || 3000, undefined, async () => {
  console.info(`listening at http://localhost:${process.env.PORT}`);
}).catch((err) => {
  console.error(err);
  process.exit(1);
});
