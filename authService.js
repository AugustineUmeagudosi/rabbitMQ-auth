const express = require('express');

const port = 2000;
const app = express();

// rabbit config routers


app.listen(port, () => console.info(`Auth Service listening on port ${port}...`));