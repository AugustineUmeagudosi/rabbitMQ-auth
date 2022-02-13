const express = require('express');

const port = 3000;
const app = express();

// rabbit config routers


app.listen(port, () => console.info(`Todo App listening on port ${port}...`));