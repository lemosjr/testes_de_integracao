// Importa o Supertest: biblioteca que faz requisições HTTP para a nossa API sem precisar subir um servidor de verdade.
const request = require('supertest');
// Importa o app do Express (as rotas, middlewares etc.) que vamos testar.
const app = require('../app');
// Importa a conexão (pool) com o PostgreSQL, para limpar a tabela e fechar a conexão no fim.
const pool = require('../config/db');
// Importa o Model, só para garantir que a tabela "pessoas" exista antes dos testes.
const pessoaModel = require('../models/pessoaModel');

// Testes de integração: usam o PostgreSQL de verdade (suba o banco com docker compose antes).

// beforeAll: roda UMA vez, antes de todos os testes do arquivo.
beforeAll(async () => {
  // Cria a tabela "pessoas" caso ela ainda não exista no banco.
  await pessoaModel.createTable();
}); // Fim do beforeAll.

// beforeEach: roda ANTES DE CADA teste, para que um teste não interfira no outro.
beforeEach(async () => {
  // Apaga todas as linhas da tabela e reinicia o contador do id (volta a começar em 1).
  await pool.query('TRUNCATE pessoas RESTART IDENTITY');
}); // Fim do beforeEach.

// afterAll: roda UMA vez, depois que todos os testes terminaram.
afterAll(async () => {
  // Fecha a conexão com o banco; sem isso o Jest fica "pendurado" esperando.
  await pool.end();
}); // Fim do afterAll.

// describe: agrupa vários testes relacionados sob um mesmo nome.
describe('API de Pessoas', () => {
  // ---------------------------------------------------------------------------
  // Testes do "caminho feliz" (tudo dá certo)
  // ---------------------------------------------------------------------------

  // test: define um caso de teste. O primeiro parâmetro é a descrição do que se espera.
  test('cria uma pessoa e depois a encontra pelo id', async () => {
    // Objeto com os dados da pessoa que vamos cadastrar.
    const nova = { nome: 'Maria Silva', idade: 30, profissao: 'Engenheira', altura: 1.65 };

    // Faz um POST /pessoas enviando o objeto "nova" no corpo (JSON) da requisição.
    const criada = await request(app).post('/pessoas').send(nova);
    // Verifica se a API respondeu 201 (Created = recurso criado com sucesso).
    expect(criada.status).toBe(201);
    // Verifica se o corpo da resposta contém os mesmos dados que enviamos.
    expect(criada.body).toMatchObject(nova);
    // Verifica se o banco gerou um id para a nova pessoa.
    expect(criada.body.id).toBeDefined();

    // Faz um GET /pessoas/:id usando o id que acabou de ser gerado.
    const buscada = await request(app).get(`/pessoas/${criada.body.id}`);
    // Verifica se a API respondeu 200 (OK = encontrou).
    expect(buscada.status).toBe(200);
    // Verifica se a pessoa buscada é exatamente igual à que foi criada.
    expect(buscada.body).toEqual(criada.body);
  }); // Fim do teste.

  // Teste que passa por PUT (atualizar) e DELETE (remover).
  test('atualiza e remove uma pessoa', async () => {
    // Cria uma pessoa com POST e já "desestrutura" o body da resposta na variável "criada".
    const { body: criada } = await request(app)
      // Define o verbo POST e a rota /pessoas.
      .post('/pessoas')
      // Envia os dados da pessoa no corpo da requisição.
      .send({ nome: 'João', idade: 25, profissao: 'Pedreiro', altura: 1.8 });

    // Faz um PUT /pessoas/:id para alterar os dados da pessoa criada.
    const atualizada = await request(app)
      // Define o verbo PUT e a rota com o id da pessoa.
      .put(`/pessoas/${criada.id}`)
      // Envia os novos dados (o PUT substitui todos os campos).
      .send({ nome: 'João Souza', idade: 26, profissao: 'Mestre de obras', altura: 1.8 });
    // Verifica se a API respondeu 200 (OK = atualizou).
    expect(atualizada.status).toBe(200);
    // Verifica se o nome realmente foi alterado.
    expect(atualizada.body.nome).toBe('João Souza');

    // Faz um DELETE /pessoas/:id para remover a pessoa.
    const removida = await request(app).delete(`/pessoas/${criada.id}`);
    // Verifica se a API respondeu 204 (No Content = removido, sem corpo na resposta).
    expect(removida.status).toBe(204);

    // Tenta buscar a pessoa que acabou de ser removida.
    const buscada = await request(app).get(`/pessoas/${criada.id}`);
    // Verifica se a API respondeu 404 (Not Found = não existe mais).
    expect(buscada.status).toBe(404);
  }); // Fim do teste.

  // ---------------------------------------------------------------------------
  // Novos testes: um para cada rota (GET lista, GET por id, POST, PUT, DELETE)
  // ---------------------------------------------------------------------------

  // 1) GET /pessoas: listar todas as pessoas cadastradas.
  test('GET /pessoas lista todas as pessoas cadastradas', async () => {
    // Cadastra a primeira pessoa via POST.
    await request(app).post('/pessoas').send({ nome: 'Ana', idade: 20, profissao: 'Estudante', altura: 1.6 });
    // Cadastra a segunda pessoa via POST.
    await request(app).post('/pessoas').send({ nome: 'Bruno', idade: 40, profissao: 'Professor', altura: 1.75 });

    // Faz um GET /pessoas (sem id) para buscar a lista completa.
    const resposta = await request(app).get('/pessoas');
    // Verifica se a API respondeu 200 (OK).
    expect(resposta.status).toBe(200);
    // Verifica se o corpo da resposta é um array (uma lista).
    expect(Array.isArray(resposta.body)).toBe(true);
    // Verifica se a lista tem exatamente 2 pessoas (as que cadastramos).
    expect(resposta.body).toHaveLength(2);
    // Verifica se a primeira da lista é a Ana (a lista vem ordenada por id).
    expect(resposta.body[0].nome).toBe('Ana');
    // Verifica se a segunda da lista é o Bruno.
    expect(resposta.body[1].nome).toBe('Bruno');
  }); // Fim do teste.

  // 2) GET /pessoas/:id: buscar um id que não existe.
  test('GET /pessoas/:id retorna 404 para um id que não existe', async () => {
    // Busca o id 999; a tabela foi limpa no beforeEach, então ele não existe.
    const resposta = await request(app).get('/pessoas/999');
    // Verifica se a API respondeu 404 (Not Found).
    expect(resposta.status).toBe(404);
    // Verifica se a mensagem de erro devolvida no JSON é a esperada.
    expect(resposta.body.erro).toBe('Pessoa não encontrada');
  }); // Fim do teste.

  // 3) POST /pessoas: enviar dados inválidos.
  test('POST /pessoas retorna 400 quando os dados são inválidos', async () => {
    // Monta uma pessoa com problemas: nome vazio, idade negativa e altura impossível (5 metros).
    const invalida = { nome: '', idade: -1, profissao: 'Atleta', altura: 5 };

    // Tenta cadastrar a pessoa inválida via POST.
    const resposta = await request(app).post('/pessoas').send(invalida);
    // Verifica se a API respondeu 400 (Bad Request = o cliente enviou dados errados).
    expect(resposta.status).toBe(400);
    // Verifica se a mensagem de erro menciona o problema no nome.
    expect(resposta.body.erro).toContain('nome é obrigatório');
    // Verifica se a mensagem de erro menciona o problema na idade.
    expect(resposta.body.erro).toContain('idade deve ser um inteiro >= 0');
    // Verifica se a mensagem de erro menciona o problema na altura.
    expect(resposta.body.erro).toContain('altura deve ser um número entre 0 e 3');

    // Busca a lista de pessoas para conferir que nada foi salvo no banco.
    const lista = await request(app).get('/pessoas');
    // Verifica se a lista continua vazia (a validação impediu o cadastro).
    expect(lista.body).toHaveLength(0);
  }); // Fim do teste.

  // 4) PUT /pessoas/:id: tentar atualizar um id que não existe.
  test('PUT /pessoas/:id retorna 404 ao atualizar um id que não existe', async () => {
    // Tenta atualizar o id 999 enviando dados válidos (para o erro ser o 404, e não o 400).
    const resposta = await request(app)
      // Define o verbo PUT e a rota com um id inexistente.
      .put('/pessoas/999')
      // Envia dados válidos no corpo da requisição.
      .send({ nome: 'Carla', idade: 35, profissao: 'Médica', altura: 1.7 });
    // Verifica se a API respondeu 404 (Not Found).
    expect(resposta.status).toBe(404);
    // Verifica se a mensagem de erro devolvida no JSON é a esperada.
    expect(resposta.body.erro).toBe('Pessoa não encontrada');
  }); // Fim do teste.

  // 5) DELETE /pessoas/:id: tentar remover um id que não existe.
  test('DELETE /pessoas/:id retorna 404 ao remover um id que não existe', async () => {
    // Tenta remover o id 999, que não existe.
    const resposta = await request(app).delete('/pessoas/999');
    // Verifica se a API respondeu 404 (Not Found).
    expect(resposta.status).toBe(404);
    // Verifica se a mensagem de erro devolvida no JSON é a esperada.
    expect(resposta.body.erro).toBe('Pessoa não encontrada');
  }); // Fim do teste.
}); // Fim do describe.
