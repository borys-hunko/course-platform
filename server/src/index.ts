import express from 'express';
import datasource from './datasource';
import * as dotenv from 'dotenv';

dotenv.config();

const app = express();

const port = 8000;

app.listen(port, async () => {
  console.log(`Example app listening on port ${port}`);
  try {
    await datasource.raw('select 1 + 1 as results');
    console.log('database is runnning');
  } catch (e) {
    console.error('error occured', e);
  }
});
