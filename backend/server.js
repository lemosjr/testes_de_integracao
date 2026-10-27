const app = require('./app');
const pessoaModel = require('./models/pessoaModel');

const PORT = process.env.PORT || 3010;

pessoaModel
  .createTable()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`API rodando em http://localhost:${PORT}`);
      console.log(`Swagger em http://localhost:${PORT}/docs`);
    });
  })
  .catch((err) => {
    console.error('Erro ao conectar no banco:', err.message);
    process.exit(1);
  });
