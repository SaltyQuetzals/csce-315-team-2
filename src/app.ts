import express = require('express');
import path = require('path');
const app = express();

const STATIC_DIR = path.join(__dirname, 'public');
app.use(express.static(STATIC_DIR));

app.get('/', (req, res) => {
  res.sendFile(path.join(STATIC_DIR, 'index.html'));
});


app.listen(3000, () => {
  console.log('Listening on port 3000');
});
