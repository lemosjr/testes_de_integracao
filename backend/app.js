const express = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./docs/swagger');
const pessoaRoutes = require('./routes/pessoaRoutes');

const app = express();

app.use(express.json());
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use('/pessoas', pessoaRoutes);

module.exports = app;
