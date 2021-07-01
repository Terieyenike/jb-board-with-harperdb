const express = require('express');
const db = require('./config/db');
const path = require('path');

require('dotenv').config();

const app = express();

app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'))

app.use((req, res, next) => {
  const start = Date.now();
  next();
  const delta = Date.now() - start;
  console.log(`${req.method} ${req.baseUrl}${req.url} took ${delta}ms to run.`);
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/', express.static(path.join(__dirname, 'public')));

const PORT = process.env.PORT || 8000;

app.get('/', async (req, res) => {
  try {
    const jobs = await db.searchByValue({
      table: 'jobs',
      operation: 'search_by_value',
      schema: 'job',
      searchValue: '*',
      searchAttribute: 'job_id',
      attributes: ['*'],
    });
    return res.render('index', {
      details: jobs.data,
      brand: 'All Dev Jobs',
    });
  } catch (error) {
    return res.render('error', {
      error: 'Connect to the internet',
    });
  }
});

app.get('/new', (req, res) => {
  return res.render('new');
});

app.get(`/jobs/:job_id`, async (req, res) => {
  let { job_id } = req.params;
  try {
    const jobs = await db.searchByHash({
      table: 'jobs',
      operation: 'search_by_hash',
      schema: 'job',
      hashValues: [job_id],
      attributes: ['*'],
    });
    return res.render('jobs', {
      btn: "back to all jobs",
      details: jobs.data
    });
  } catch (error) {
    return res.render('error', {
      error: 'Connect to the internet',
    });
  }
});

app.post('/new', async (req, res) => {
  let { body } = req;
  try {
    await db.insert({
      operation: 'insert',
      schema: 'job',
      table: 'jobs',
      records: [body],
    });
    return res.status(200).redirect('/');
  } catch (error) {
    return res.render('error', {
      error: 'Connect to the internet',
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port:${PORT}`);
});
