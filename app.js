const express = require('express');
const mongoose = require('mongoose');
const { PORT = 3000 } = process.env;
const app = express();

mongoose.connect('mongodb://localhost:27017/mestodb', {
  useNewUrlParser: true,
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use((req, res, next) => {
  req.user = {
    _id: '62ebc58a238ac41625401325',
  };
  next();
});
app.use('/users', require('./routes/users'));
app.use('/cards', require('./routes/cards'));
app.use('/*', (req, res) => {
  res.status(404).send({
    message: 'Страница не найдена'
  });
});

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});
