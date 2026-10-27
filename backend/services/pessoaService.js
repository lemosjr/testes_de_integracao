const pessoaModel = require('../models/pessoaModel');

// Service: regras de negócio e validações. Não sabe nada de HTTP.

class ValidationError extends Error {}
class NotFoundError extends Error {}

function validar(dados) {
  const { nome, idade, profissao, altura } = dados || {};
  const erros = [];

  if (!nome || typeof nome !== 'string') erros.push('nome é obrigatório');
  if (!Number.isInteger(idade) || idade < 0) erros.push('idade deve ser um inteiro >= 0');
  if (!profissao || typeof profissao !== 'string') erros.push('profissao é obrigatória');
  if (typeof altura !== 'number' || altura <= 0 || altura >= 3) erros.push('altura deve ser um número entre 0 e 3 (metros)');

  if (erros.length) throw new ValidationError(erros.join('; '));
  return { nome, idade, profissao, altura };
}

async function listar() {
  return pessoaModel.findAll();
}

async function buscarPorId(id) {
  const pessoa = await pessoaModel.findById(id);
  if (!pessoa) throw new NotFoundError('Pessoa não encontrada');
  return pessoa;
}

async function criar(dados) {
  return pessoaModel.create(validar(dados));
}

async function atualizar(id, dados) {
  const pessoa = await pessoaModel.update(id, validar(dados));
  if (!pessoa) throw new NotFoundError('Pessoa não encontrada');
  return pessoa;
}

async function remover(id) {
  const removido = await pessoaModel.remove(id);
  if (!removido) throw new NotFoundError('Pessoa não encontrada');
}

module.exports = { listar, buscarPorId, criar, atualizar, remover, ValidationError, NotFoundError };
