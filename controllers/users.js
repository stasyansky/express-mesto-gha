const User = require('../models/user');

module.exports.getUsers = (req, res) => {
  User.find({})
    .then((users) => res.send(users))
    .catch((err) => res.status(500).json({
      message: `На сервере произошла ошибка: ${err.message}`
    }));
};

module.exports.getUser = (req, res) => {
  User.findById(req.params.userId)
    .orFail(
      new Error('ErrorId')
    )
    .then((user) => res.send(user))
    .catch((err) => {
      if (err.message === 'ErrorId') {
        return res.status(404).json({
          message: 'Пользователь по указанному id не найден'
        });
      }
      return res.status(500).json({
        message: `На сервере произошла ошибка: ${err.message}`
      });
    });
};

module.exports.createUser = (req, res) => {
  const { name, about, avatar } = req.body;
  User.create({ name, about, avatar })
    .then((user) => res.send(user))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return res.status(400).json({
          message: 'Переданы некорректные данные при создании пользователя'
        });
      }
      return res.status(500).json({
        message: `На сервере произошла ошибка: ${err.message}`
      });
    });
};

module.exports.updateUser = (req, res) => {
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
        return res.status(400).send({
          message: 'Переданы некорректные данные при обновлении профиля'
        });
      }
      return res.status(500).send({
        message: `На сервере произошла ошибка: ${err.message}`
      });
    });
};
module.exports.updateAvatar = (req, res) => {
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
        return res.status(400).send({
          message: 'Переданы некорректные данные при обновлении аватара'
        });
      }
      return res.status(500).send({
        message: `На сервере произошла ошибка: ${err.message}`
      });
    });
};
