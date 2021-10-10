const express = require('express');
const db = require('./config/db');
const path = require('path');

require('dotenv').config();

const app = express();

app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views')) // missing ; (the js engine will automatically add it but that's not necessarily a given on all browsers.)

app.use((req, res, next) => {
  const start = Date.now();
  next();
  const delta = Date.now() - start;
  console.log(`${req.method} ${req.baseUrl}${req.url} took ${delta}ms to run.`);
  // well done.
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/', express.static(path.join(__dirname, 'public')));

// it's worth considering to move the port, and the listener to a separate file
// think server.js that starts the server and calls your app.
// the benefit with this approach is that, should the project grow, you can have different
// logic that can contain load balancers and such.
const PORT = process.env.PORT || 8000;

// have you considered separating the routes from your app.js?
// when the project starts to grow, it's best to think of app.js as a handler for the server and routes
// and have your routes in another directory 
// https://stackoverflow.com/a/37309212
app.get('/', async (req, res) => {
  try {
    const jobs = await db.searchByValue({
      table: 'jobs', // some people might want to have these hardcoded strings as variables but I don't have a strong opinion
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

// did you consider creating an error handler middleware instead of using try/catch?
// this can help make your code more DRY (don't repeat yourself)
app.get(`/jobs/:job_id`, async (req, res) => {
  let { job_id } = req.params; // underscore as variable names is typically frown upon in JS (https://github.com/felixge/node-style-guide#naming-conventions)
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
