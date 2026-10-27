const pool = require('../config/db');

// Model: única camada que conversa com o banco de dados.

async function createTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS pessoas (
      id        SERIAL PRIMARY KEY,
      nome      VARCHAR(100)  NOT NULL,
      idade     INTEGER       NOT NULL,
      profissao VARCHAR(100)  NOT NULL,
      altura    NUMERIC(3, 2) NOT NULL
    )
  `);
}

// O pg devolve NUMERIC como string; convertemos altura para número.
function toPessoa(row) {
  return row && { ...row, altura: Number(row.altura) };
}

async function findAll() {
  const { rows } = await pool.query('SELECT * FROM pessoas ORDER BY id');
  return rows.map(toPessoa);
}

async function findById(id) {
  const { rows } = await pool.query('SELECT * FROM pessoas WHERE id = $1', [id]);
  return toPessoa(rows[0]);
}

async function create({ nome, idade, profissao, altura }) {
  const { rows } = await pool.query(
    'INSERT INTO pessoas (nome, idade, profissao, altura) VALUES ($1, $2, $3, $4) RETURNING *',
    [nome, idade, profissao, altura]
  );
  return toPessoa(rows[0]);
}

async function update(id, { nome, idade, profissao, altura }) {
  const { rows } = await pool.query(
    'UPDATE pessoas SET nome = $1, idade = $2, profissao = $3, altura = $4 WHERE id = $5 RETURNING *',
    [nome, idade, profissao, altura, id]
  );
  return toPessoa(rows[0]);
}

async function remove(id) {
  const { rowCount } = await pool.query('DELETE FROM pessoas WHERE id = $1', [id]);
  return rowCount > 0;
}

module.exports = { createTable, findAll, findById, create, update, remove };
