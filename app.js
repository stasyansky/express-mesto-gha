require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const helmet = require('helmet');
const { celebrate, Joi, errors } = require('celebrate');
const { createUser, login } = require('./controllers/users');

const pattern = process.env.PATTERN;
const auth = require('./middlewares/auth');
const errorHandler = require('./middlewares/errorHandler');
const NotFoundError = require('./errors/not-found-err');

const { PORT } = process.env;
const app = express();
mongoose.connect('mongodb://localhost:27017/mestodb', {
  useNewUrlParser: true,
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(helmet());

app.post('/signup', celebrate({
  body: Joi.object().keys({
    name: Joi.string().min(2).max(30),
    about: Joi.string().min(2).max(30),
    avatar: Joi.string().pattern(new RegExp(pattern)),
    email: Joi.string().required().email(),
    password: Joi.string().min(8).required(),
  }),
}), createUser);

app.post('/signin', celebrate({
  body: Joi.object().keys({
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
  }),
}), login);

app.use('/users', auth, require('./routes/users'));
app.use('/cards', auth, require('./routes/cards'));

app.use('*', () => {
  throw new NotFoundError('Страница не найдена');
});
app.use(errors());
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});
