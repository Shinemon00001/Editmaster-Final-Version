const express = require('express');
const app = express();
const port = 3001;
const annotationHandler = require('./annotationHandler');
const bodyParser = require('body-parser');

app.use(bodyParser.text());
app.use(express.static('client'));

app.listen(port, '0.0.0.0', async () => {
  console.info(`Server listening at port ${port}`);
  const { default: open } = await import('open');
  open('http://localhost:3001/index.html');
});

annotationHandler(app);
