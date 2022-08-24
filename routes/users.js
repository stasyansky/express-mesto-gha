const router = require('express').Router();

const pattern = process.env.PATTERN;
const { celebrate, Joi } = require('celebrate');
const {
  getUsers,
  getUserById,
  updateUser,
  getMyProfile,
  updateAvatar,
} = require('../controllers/users');

router.get('/me', getMyProfile);

router.get('/', getUsers);

router.get('/:userId', celebrate({
  params: Joi.object().keys({
    userId: Joi.string().hex().length(24).required(),
  }),
}), getUserById);

router.patch('/me', celebrate({
  body: Joi.object().keys({
    name: Joi.string().required().min(2).max(30),
    about: Joi.string().required().min(2).max(30),
  }),
}), updateUser);

router.patch('/me/avatar', celebrate({
  body: Joi.object().keys({
    avatar: Joi.string().required().pattern(new RegExp(pattern)),
  }),
}), updateAvatar);

module.exports = router;
