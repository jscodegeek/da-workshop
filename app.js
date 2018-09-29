const uuidv1 = require('uuid/v1');
const md5 = require('md5');

const _ = require('lodash');

const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');

const adapter = new FileSync('db.json');
const db = low(adapter);

const express = require('express');
const app = express();
const bodyParser = require('body-parser');

const {NODE_ENV, PORT, SECRET, TOKEN_TTL} = process.env;

const carValidator = require('./validators/car');


const passport = require('passport');
const LocalStrategy = require('passport-local');
passport.use(new LocalStrategy(
  function(username, password, done) {
    const user = db.get('users').find({ username }).value();

    if (!user || user.password !== password) {
      done(null, false);
    }

    return done(null, user);
  }
));

const authUser = (req, res, next) => {
  const token = req.headers['da-workshop-token'];

  const session = db.get('sessions').find({ token }).value();

  if (!session) {
    return res.sendStatus(401);
  }
  
  console.log((_.now() - session.timestamp), TOKEN_TTL);
  if ((_.now() - session.timestamp) > TOKEN_TTL * 1000) {
    db.get('sessions')
    .remove({ token })
    .write();
    return res.sendStatus(401);
  }

  next();
};

app.use(bodyParser.json());

app.post('/login', passport.authenticate('local', { session: false }), (req, res) => {
  const token = md5(`${SECRET} ${Math.random()}`);

  const { username } = req.body;

  const sessions = db.get('sessions')
    .push({ username, token, timestamp: _.now() })
    .write();

  res.json(200, token);
});

app.get('/hc', passport.authenticate('basic', { session: false }), (req, res) => {
  res.json({ status: 'OK'});
});

app.get('/cars', authUser, (req, res) => {
  const cars = db.get('cars');
  res.json(cars);
});

app.post('/cars', carValidator, (req, res) => {
  const { title, brand, number } = req.body;

  const cars = db.get('cars')
    .push({ id: uuidv1(), title, brand, number })
    .write();

  res.json(201, _.last(cars));
});

app.put('/cars/:id', (req, res) => {
  const { title, brand, number } = req.body;
  const { id } = req.params;

  const car = db.get('cars').find({ id }).value();

  if (!car) {
    return res.json(404, {message: 'Car not found!'});
  }

  const carUpdated = db.get('cars')
  .find({ id })
  .assign({ title, brand, number })
  .write();

  res.json(200, carUpdated);
});

app.delete('/cars/:id', (req, res) => {
  const { id } = req.params;

  const car = db.get('cars').find({ id }).value();

  if (!car) {
    return res.json(404, {message: 'Car not found!'});
  }

  db.get('cars')
    .remove({ id })
    .write();

  res.json(204);
});

app.get('/cars/:id', (req, res) => {
  const { id } = req.params;

  const car = db.get('cars').find({ id }).value();

  if (!car) {
    return res.json(404, {message: 'Car not found!'});
  }

  res.json(car);
});

app.listen(PORT, () => console.log(`Example app listening on port ${PORT}!`));