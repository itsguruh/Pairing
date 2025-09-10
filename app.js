const express = require('express');
const app = express();
const pairRouter = require('./pair');

app.use('/pair', pairRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
