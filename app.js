const uuidv1 = require('uuid/v1');
const _ = require('lodash');

const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');

const adapter = new FileSync('db.json');
const db = low(adapter);

const express = require('express');
const app = express();
const bodyParser = require('body-parser');

const {NODE_ENV, PORT} = process.env;

app.use(bodyParser.json());

app.get('/hc', (req, res) => {
  res.json({ status: 'OK'});
});

app.get('/cars', (req, res) => {
  const cars = db.get('cars');
  res.json(cars);
});

app.post('/cars', (req, res) => {
  const { title, brand, number } = req.body;

  const cars = db.get('cars')
    .push({ id: uuidv1(), title, brand, number })
    .write();

  res.json(_.last(cars));
});

app.put('/cars/:id', (req, res) => {
  const { id } = req.params;
  res.json({ status: 'OK'});
});

app.delete('/cars/:id', (req, res) => {
  const { id } = req.params;
  res.json({ status: 'OK'});
});

app.get('/cars/:id', (req, res) => {
  const { id } = req.params;
  res.json({ status: 'OK'});
});

app.listen(PORT, () => console.log(`Example app listening on port ${PORT}!`));