const Card = require('../models/card');
const NotFoundError = require('../errors/not-found-err');
const ForbiddenError = require('../errors/forbidden-err');
const BadRequestError = require('../errors/bad-request-err');

const errorCardHandler = (err, next) => {
  if (err.message === 'ErrorId') {
    next(new NotFoundError('Карточка с указанным id не найдена'));
  }
  if (err.name === 'ValidationError') {
    next(new BadRequestError('Передан некорректный id карточки'));
  } else {
    next(err);
  }
};

module.exports.getCards = (req, res, next) => {
  Card.find({})
    .then((cards) => res.send(cards))
    .catch(next);
};

module.exports.createCard = (req, res, next) => {
  const { name, link } = req.body;
  const owner = req.user._id;
  Card.create({ name, link, owner })
    .then((card) => res.send(card))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new BadRequestError('Переданы некорректные данные при создании карточки'));
      } else {
        next(err);
      }
    });
};

module.exports.deleteCard = (req, res, next) => {
  Card.findById(req.params.cardId)
    .orFail(
      new Error('ErrorId'),
    )
    .then((card) => {
      if (JSON.stringify(card.owner) !== JSON.stringify(req.user._id)) {
        next(new ForbiddenError('Вы не можете удалить чужую карточку'));
      }
      return Card.findByIdAndRemove(req.params.cardId).then(() => res.send({ message: 'Карточка удалена' }));
    })
    .catch((err) => {
      errorCardHandler(err, next);
    });
};

module.exports.likeCard = (req, res, next) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $addToSet: { likes: req.user._id } },
    { new: true },
  )
    .orFail(
      new Error('ErrorId'),
    )
    .then((card) => res.send(card))
    .catch((err) => {
      errorCardHandler(err, next);
    });
};

module.exports.dislikeCard = (req, res, next) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $pull: { likes: req.user._id } },
    { new: true },
  )
    .orFail(
      new Error('ErrorId'),
    )
    .then((card) => res.send(card))
    .catch((err) => {
      errorCardHandler(err, next);
    });
};
