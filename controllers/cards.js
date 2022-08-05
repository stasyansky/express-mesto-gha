const Card = require('../models/card');

module.exports.createCard = (req, res) => {
  const { name, link } = req.body;
  const owner = req.user._id;
  Card.create({ name, link, owner })
    .then(card => res.send(card))
    .catch((err) => {
    if (err.name === 'ValidationError') {
      return res.status(400).send({
        message: 'Переданы некорректные данные при создании карточки',
      });
    }
    return res.status(500).send({ message: 'На сервере произошла ошибка' });
  });
};

module.exports.getCards = (req, res) => {
  Card.find({})
    .then(cards => res.send(cards))
    .catch(() => res.status(500).send({ message: 'На сервере произошла ошибка' }));
};

module.exports.deleteCard = (req, res) => {
  Card.findByIdAndRemove(req.params.cardId)
    .then(card => res.send(card))
    .catch((err) => {
      if (err.name === 'CastError') {
        return res.status(404).send({
          message: 'Карточка с указанным id не найдена',
        });
      }
      return res.status(500).send({ message: 'На сервере произошла ошибка' });
    });
};

module.exports.likeCard = (req, res) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $addToSet: { likes: req.user._id } },
    { new: true },
  )
    .then(card => res.send(card))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return res.status(400).send({
          message: 'Переданы некорректные данные для постановки лайка',
        });
      } else if (err.name === 'CastError') {
        return res.status(404).send({
          message: 'Передан несуществующий id карточки',
        });
      }
      return res.status(500).send({ message: 'На сервере произошла ошибка' });
    });
}

module.exports.dislikeCard = (req, res) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $pull: { likes: req.user._id } },
    { new: true },
  )
    .then(card => res.send(card))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return res.status(400).send({
          message: 'Переданы некорректные данные для удаления лайка',
        });
      } else if (err.name === 'CastError') {
        return res.status(404).send({
          message: 'Передан несуществующий id карточки',
        });
      }
      return res.status(500).send({ message: 'На сервере произошла ошибка' });
    });
}
