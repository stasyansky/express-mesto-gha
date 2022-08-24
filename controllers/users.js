const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const ConflictError = require('../errors/conflict-err');
const NotFoundError = require('../errors/not-found-err');
const BadRequestError = require('../errors/bad-request-err');
const UnauthorizedError = require('../errors/unauthorized-err');

module.exports.getUsers = (req, res, next) => {
  User.find({})
    .then((users) => res.send(users))
    .catch(next);
};

module.exports.getUserById = (req, res, next) => {
  User.findById(req.params.userId)
    .orFail(
      new Error('ErrorId'),
    )
    .then((user) => res.send(user))
    .catch((err) => {
      if (err.message === 'ErrorId') {
        next(new NotFoundError('Пользователь по указанному id не найден'));
      } if (err.name === 'ValidationError') {
        next(new BadRequestError('Передан некорректный id пользователя'));
      } else {
        next(err);
      }
    });
};

module.exports.createUser = (req, res, next) => {
  const {
    name, about, avatar, email, password,
  } = req.body;
  User.findOne({ email })
    .then((user) => {
      if (user) {
        next(new ConflictError('Пользователь с таким логином уже существует'));
      } else {
        bcrypt.hash(password, 10)
          .then((hash) => {
            User.create({
              name,
              about,
              avatar,
              email,
              password: hash,
            })
              .then((data) => res.send(data));
          });
      }
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new BadRequestError('Переданы некорректные данные при создании пользователя'));
      } else {
        next(err);
      }
    });
};

module.exports.login = (req, res, next) => {
  const { email, password } = req.body;
  return User.findOne({ email }).select('+password')
    .then((user) => {
      if (!user) {
        next(new UnauthorizedError('Неправильные почта или пароль'));
      }
      return bcrypt.compare(password, user.password)
        .then((matched) => {
          if (!matched) {
            next(new UnauthorizedError('Неправильные почта или пароль'));
          }
          return user;
        });
    })
    .then((user) => {
      const token = jwt.sign(
        { _id: user._id },
        process.env.JWT_SECRET,
        { expiresIn: '7d' },
      );
      res.cookie('jwt', token, {
        maxAge: 3600000,
        httpOnly: true,
      });
      res.send({ token });
    })
    .catch(() => {
      next(new UnauthorizedError('Неправильные почта или пароль'));
    });
};

module.exports.getMyProfile = (req, res, next) => {
  User.findById(req.user._id)
    .orFail(
      new Error('ErrorId'),
    )
    .then((user) => res.send(user))
    .catch((err) => {
      if (err.message === 'ErrorId') {
        next(new NotFoundError('Пользователь по указанному id не найден'));
      } else {
        next(err);
      }
    });
};

module.exports.updateUser = (req, res, next) => {
  const { name, about } = req.body;
  User.findByIdAndUpdate(
    req.user._id,
    { name, about },
    {
      new: true,
      runValidators: true,
      upsert: true,
    },
  )
    .then((user) => res.send(user))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new BadRequestError('Переданы некорректные данные при обновлении профиля'));
      } else {
        next(err);
      }
    });
};

module.exports.updateAvatar = (req, res, next) => {
  const { avatar } = req.body;
  User.findByIdAndUpdate(
    req.user._id,
    { avatar },
    {
      new: true,
      runValidators: true,
      upsert: true,
    },
  )
    .then((user) => res.send(user))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new BadRequestError('Переданы некорректные данные при обновлении аватара'));
      } else {
        next(err);
      }
    });
};
