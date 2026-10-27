const idParam = [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }];

const body = {
  required: true,
  content: { 'application/json': { schema: { $ref: '#/components/schemas/PessoaInput' } } },
};

const pessoaResp = (description) => ({
  description,
  content: { 'application/json': { schema: { $ref: '#/components/schemas/Pessoa' } } },
});

module.exports = {
  openapi: '3.0.0',
  info: { title: 'API Pessoas', version: '1.0.0', description: 'CRUD simples de pessoas' },
  paths: {
    '/pessoas': {
      get: {
        tags: ['Pessoas'],
        summary: 'Lista todas as pessoas',
        responses: {
          200: {
            description: 'Lista de pessoas',
            content: {
              'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Pessoa' } } },
            },
          },
        },
      },
      post: {
        tags: ['Pessoas'],
        summary: 'Cria uma pessoa',
        requestBody: body,
        responses: { 201: pessoaResp('Pessoa criada'), 400: { description: 'Dados inválidos' } },
      },
    },
    '/pessoas/{id}': {
      get: {
        tags: ['Pessoas'],
        summary: 'Busca uma pessoa pelo id',
        parameters: idParam,
        responses: { 200: pessoaResp('Pessoa encontrada'), 404: { description: 'Não encontrada' } },
      },
      put: {
        tags: ['Pessoas'],
        summary: 'Atualiza uma pessoa',
        parameters: idParam,
        requestBody: body,
        responses: {
          200: pessoaResp('Pessoa atualizada'),
          400: { description: 'Dados inválidos' },
          404: { description: 'Não encontrada' },
        },
      },
      delete: {
        tags: ['Pessoas'],
        summary: 'Remove uma pessoa',
        parameters: idParam,
        responses: { 204: { description: 'Removida' }, 404: { description: 'Não encontrada' } },
      },
    },
  },
  components: {
    schemas: {
      PessoaInput: {
        type: 'object',
        required: ['nome', 'idade', 'profissao', 'altura'],
        properties: {
          nome: { type: 'string', example: 'Maria Silva' },
          idade: { type: 'integer', example: 30 },
          profissao: { type: 'string', example: 'Engenheira' },
          altura: { type: 'number', example: 1.65 },
        },
      },
      Pessoa: {
        allOf: [
          { type: 'object', properties: { id: { type: 'integer', example: 1 } } },
          { $ref: '#/components/schemas/PessoaInput' },
        ],
      },
    },
  },
};
