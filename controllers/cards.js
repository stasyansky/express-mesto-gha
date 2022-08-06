const Card = require('../models/card');

module.exports.getCards = (req, res) => {
  Card.find({})
    .then((cards) => res.send(cards))
    .catch((err) => res.status(500).json({
      message: `На сервере произошла ошибка: ${err.message}`
    }));
};

module.exports.createCard = (req, res) => {
  const { name, link } = req.body;
  const owner = req.user._id;
  Card.create({ name, link, owner })
    .then((card) => res.send(card))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return res.status(400).json({
          message: 'Переданы некорректные данные при создании карточки'
        });
      }
      return res.status(500).json({
        message: `На сервере произошла ошибка: ${err.message}`
      });
    });
};

module.exports.deleteCard = (req, res) => {
  Card.findByIdAndRemove(req.params.cardId)
    .orFail(
      new Error('ErrorId')
    )
    .then((card) => res.send(card))
    .catch((err) => {
      if (err.message === 'ErrorId') {
        return res.status(404).json({
          message: 'Карточка с указанным id не найдена'
        });
      }
      return res.status(500).json({
        message: `На сервере произошла ошибка: ${err.message}`
      });
    });
};

module.exports.likeCard = (req, res) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $addToSet: { likes: req.user._id } },
    { new: true },
  )
    .then((card) => {
      card
        ? res.send(card)
        : res.status(404).json({
          message: 'Передан несуществующий id карточки'
        })
    })
    .catch((err) => {
      return res.status(500).json({
        message: `На сервере произошла ошибка: ${err.message}`
      });
    });
};

module.exports.dislikeCard = (req, res) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $pull: { likes: req.user._id } },
    { new: true },
  )
    .then((card) => {
      card
        ? res.send(card)
        : res.status(404).json({
          message: 'Передан несуществующий id карточки'
        })
    })
    .catch((err) => {
      return res.status(500).json({
        message: `На сервере произошла ошибка: ${err.message}`
      });
    });
};
