import express, { Request } from 'express';
import { generateWords } from './words-generator';
import { TestResopnse } from './types';
import datasource from './datasource';

const app = express();

const port = 8000;

app.get('/', (req: Request<unknown, TestResopnse>, res) => {
  res.send({
    message: `Hello ${generateWords()}`,
  });
});

app.use('/files', express.static('public'));

app.get('/file-get', (req, res) => {
  res.download('./public/index.html', 'index.html', (err) => {
    if (err) {
      console.log('download error', err);
    }
  });
});

app.listen(port, async () => {
  console.log(`Example app listening on port ${port}`);
  try {
    await datasource.raw('select 1 + 1 as results');
    console.log('database is runnning');
  } catch (e) {
    console.error('error occured', e);
  }
});
