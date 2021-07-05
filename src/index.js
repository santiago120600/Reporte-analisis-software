const express = require('express');
const app = express();
const port = 3000;
const path = require('path');
const xlsx = require('xlsx');

app.get('/', (req, res) => {
    res.sendFile('index.html', {
        root: path.join(__dirname, './views')
    });
});

app.listen(port, () => {
  console.log(`listening at http://localhost:${port}`)
});
