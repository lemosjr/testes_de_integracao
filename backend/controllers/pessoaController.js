const pessoaService = require('../services/pessoaService');

// Controller: recebe a requisição HTTP, chama o service e devolve a resposta (a "view" em JSON).

function tratarErro(res, err) {
  if (err instanceof pessoaService.ValidationError) return res.status(400).json({ erro: err.message });
  if (err instanceof pessoaService.NotFoundError) return res.status(404).json({ erro: err.message });
  console.error(err);
  return res.status(500).json({ erro: 'Erro interno do servidor' });
}

async function listar(req, res) {
  try {
    res.json(await pessoaService.listar());
  } catch (err) {
    tratarErro(res, err);
  }
}

async function buscarPorId(req, res) {
  try {
    res.json(await pessoaService.buscarPorId(Number(req.params.id)));
  } catch (err) {
    tratarErro(res, err);
  }
}

async function criar(req, res) {
  try {
    res.status(201).json(await pessoaService.criar(req.body));
  } catch (err) {
    tratarErro(res, err);
  }
}

async function atualizar(req, res) {
  try {
    res.json(await pessoaService.atualizar(Number(req.params.id), req.body));
  } catch (err) {
    tratarErro(res, err);
  }
}

async function remover(req, res) {
  try {
    await pessoaService.remover(Number(req.params.id));
    res.status(204).send();
  } catch (err) {
    tratarErro(res, err);
  }
}

module.exports = { listar, buscarPorId, criar, atualizar, remover };
