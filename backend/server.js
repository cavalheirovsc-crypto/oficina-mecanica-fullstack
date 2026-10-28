
/*
==========================================
PROJETO: API OFICINA MECÂNICA
TECNOLOGIAS: Node.js, Express e MySQL

Este arquivo controla:
- Cadastro de clientes
- Cadastro de veículos
- Ordens de serviço
- Consultas ao banco de dados
- Atualizações e exclusões

Métodos HTTP utilizados:
GET    = Consultar
POST   = Cadastrar
PUT    = Atualizar
DELETE = Excluir
==========================================
*/


// ==========================================
// 1. IMPORTAÇÃO DAS BIBLIOTECAS
// ==========================================

// Importa o Express, utilizado para criar a API.
const express = require('express');

// Importa o CORS, que permite requisições de outras origens.
const cors = require('cors');

// Importa a função que gera IDs únicos para os registros.
const { randomUUID } = require('crypto');

// Importa a conexão com o banco de dados MySQL.
const db = require('./db');


// ==========================================
// 2. CONFIGURAÇÃO DO SERVIDOR
// ==========================================

// Cria nossa aplicação Express.
const app = express();

// Habilita o CORS.
app.use(cors());

// Permite receber dados enviados em formato JSON.
app.use(express.json());


// ==========================================
// 3. ARMAZENAMENTO TEMPORÁRIO
// ==========================================

// Cria arrays para armazenar dados em memória.
// Clientes e veículos já utilizam o MySQL.
// Ordens de serviço ainda utilizam o array.
let clientes = [], veiculos = [], ordensServico = [];

// Relaciona o nome das rotas com os arrays.
const tabelas = {
  clientes,
  veiculos,
  'ordens-servico': ordensServico
};

// Define os nomes utilizados nas mensagens da API.
const nomes = {
  clientes: 'Cliente',
  veiculos: 'Veículo',
  'ordens-servico': 'Ordem de serviço'
};


// ==========================================
// 4. FUNÇÃO PARA RETORNAR ERROS
// ==========================================

// Recebe a resposta, o código HTTP e a mensagem.
// Exemplo: erro(res, 404, 'Cliente não encontrado').
function erro(res, codigo, mensagem) {
  return res.status(codigo).json({
    erro: mensagem
  });
}


// ==========================================
// 5. CRIAÇÃO DAS ROTAS
// ==========================================

// Percorre os módulos definidos no objeto tabelas.
// Assim, podemos reutilizar a estrutura das rotas.
for (const tipo of Object.keys(tabelas)) {

  // Seleciona o array correspondente ao módulo.
  const itens = tabelas[tipo];

  // Seleciona o nome do módulo para mensagens.
  const nome = nomes[tipo];


  // ========================================
  // ROTA GET - LISTAR TODOS OS REGISTROS
  // ========================================

  // Exemplos:
  // GET /clientes
  // GET /veiculos
  // GET /ordens-servico

  app.get('/' + tipo, async (req, res) => {

    // Se a rota for de clientes, consulta o MySQL.
    if (tipo === 'clientes') {

      try {

        // SELECT * busca todos os registros da tabela.
        const [resultado] = await db.execute(
          'SELECT * FROM clientes'
        );

        // Retorna a lista de clientes em JSON.
        return res.json(resultado);

      } catch (erroBanco) {

        // Exibe o erro no terminal.
        console.error(
          'Erro ao listar clientes:',
          erroBanco.message
        );

        // Retorna erro HTTP 500.
        return erro(
          res,
          500,
          'Erro ao buscar clientes no MySQL'
        );
      }
    }

    // Se a rota for de veículos, consulta o MySQL.
    if (tipo === 'veiculos') {

      try {

        // Busca todos os veículos cadastrados.
        const [resultado] = await db.execute(
          'SELECT * FROM veiculos'
        );

        // Retorna os veículos em JSON.
        return res.json(resultado);

      } catch (erroBanco) {

        console.error(
          'Erro ao listar veículos:',
          erroBanco.message
        );

        return erro(
          res,
          500,
          'Erro ao buscar veículos no MySQL'
        );
      }
    }

    // ==========================================
// GET - LISTAR ORDENS DE SERVIÇO NO MYSQL
// ==========================================

// Verifica se a rota acessada é /ordens-servico.
if (tipo === 'ordens-servico') {

  try {

    // Consulta todas as ordens de serviço no MySQL.
    const [resultado] = await db.execute(
      'SELECT * FROM ordens_servico'
    );

    // Retorna os registros encontrados em JSON.
    // Se a tabela estiver vazia, retorna [].
    return res.json(resultado);

  } catch (erroBanco) {

    // Mostra o erro no terminal para facilitar a correção.
    console.error(
      'Erro ao listar ordens de serviço:',
      erroBanco.message
    );

    // Retorna HTTP 500 se a consulta falhar.
    return erro(
      res,
      500,
      'Erro ao buscar ordens de serviço no MySQL'
    );
  }
}


// Retorno temporário para outros tipos de registros.
return res.json(itens);
  });


  // ========================================
  // ROTA GET POR ID - CONSULTAR UM REGISTRO
  // ========================================

  // Exemplos:
  // GET /clientes/123
  // GET /veiculos/123
  //
  // req.params.id recebe o ID informado na URL.

  app.get('/' + tipo + '/:id', async (req, res) => {
    
    // ==========================================
// GET POR ID - ORDEM DE SERVIÇO NO MYSQL
// ==========================================

// Verifica se estamos consultando uma ordem de serviço.
if (tipo === 'ordens-servico') {

  try {

    // Busca no MySQL a ordem com o ID informado na URL.
    // O ? recebe o valor de req.params.id.
    const [resultado] = await db.execute(
      'SELECT * FROM ordens_servico WHERE id = ?',
      [req.params.id]
    );

    // Se não encontrar nenhum registro, retorna erro 404.
    if (resultado.length === 0) {
      return erro(res, 404, 'Ordem de serviço não encontrada');
    }

    // Retorna os dados da ordem encontrada.
    return res.json(resultado[0]);

  } catch (erroBanco) {

    // Mostra no terminal o erro ocorrido no banco.
    console.error(
      'Erro ao buscar ordem de serviço:',
      erroBanco.message
    );

    // Retorna erro 500 caso a consulta falhe.
    return erro(
      res,
      500,
      'Erro ao consultar ordem de serviço no MySQL'
    );
  }
}
    // Consulta um veículo específico no MySQL.
    if (tipo === 'veiculos') {

      try {

        // O ? recebe o ID enviado na URL.
        const [resultado] = await db.execute(
          'SELECT * FROM veiculos WHERE id = ?',
          [req.params.id]
        );

        // Verifica se o veículo foi encontrado.
        if (resultado.length === 0) {
          return erro(
            res,
            404,
            'Veículo não encontrado'
          );
        }

        // Retorna somente o veículo encontrado.
        return res.json(resultado[0]);

      } catch (erroBanco) {

        console.error(
          'Erro ao buscar veículo:',
          erroBanco.message
        );

        return erro(
          res,
          500,
          'Erro ao consultar veículo no MySQL'
        );
      }
    }

    // Consulta um cliente específico no MySQL.
    if (tipo === 'clientes') {

      try {

        const [resultado] = await db.execute(
          'SELECT * FROM clientes WHERE id = ?',
          [req.params.id]
        );

        // Retorna 404 se não encontrar o cliente.
        if (resultado.length === 0) {
          return erro(
            res,
            404,
            'Cliente não encontrado'
          );
        }

        // Retorna os dados do cliente encontrado.
        return res.json(resultado[0]);

      } catch (erroBanco) {

        console.error(
          'Erro ao buscar cliente:',
          erroBanco.message
        );

        return erro(
          res,
          500,
          'Erro ao consultar MySQL'
        );
      }
    }

    // Busca uma ordem de serviço no array.
    // find() procura um item com o ID informado.
    const item = itens.find(
      x => x.id === req.params.id
    );

    // Se encontrar, retorna o item.
    // Caso contrário, retorna HTTP 404.
    return item
      ? res.json(item)
      : erro(res, 404, nome + ' não encontrado(a)');
  });


  // ========================================
  // ROTA POST - CADASTRAR REGISTROS
  // ========================================

  // Exemplos:
  // POST /clientes
  // POST /veiculos
  // POST /ordens-servico
  //
  // req.body contém os dados enviados em JSON.

  app.post('/' + tipo, async (req, res) => {

    // Verifica se os dados recebidos são válidos.
    if (
      !req.body ||
      typeof req.body !== 'object' ||
      Array.isArray(req.body)
    ) {
      return erro(res, 400, 'Dados inválidos');
    }

    // O cadastro de cliente exige um nome.
    if (
      tipo === 'clientes' &&
      !String(req.body.nome || '').trim()
    ) {
      return erro(res, 400, 'Informe o nome');
    }

    // ==========================================
// VALIDAÇÃO DAS ORDENS DE SERVIÇO
// ==========================================

// A validação do veículo será feita no MySQL
// dentro da rota POST de ordens de serviço.
// Não utilizaremos mais o array de veículos.

    // Monta um novo objeto com os dados recebidos.
    const novo = {

      // Copia os campos enviados pelo usuário.
      ...req.body,

      // Define o status inicial da ordem de serviço.
      ...(tipo === 'ordens-servico'
        ? { status: req.body.status || 'Aberta' }
        : {}),

      // Gera um ID único.
      id: randomUUID()
    };


    // ======================================
    // POST - CADASTRAR CLIENTE NO MYSQL
    // ======================================

    if (tipo === 'clientes') {

      try {

        // Comando SQL para inserir um cliente.
        const sql = `
          INSERT INTO clientes (id, nome, email, telefone)
          VALUES (?, ?, ?, ?)
        `;

        // Envia os valores para o banco.
        await db.execute(sql, [
          novo.id,
          novo.nome.trim(),
          novo.email || null,
          novo.telefone || null
        ]);

        // HTTP 201 significa registro criado.
        return res.status(201).json(novo);

      } catch (erroBanco) {

        console.error(
          'Erro ao cadastrar cliente:',
          erroBanco.message
        );

        return erro(
          res,
          500,
          'Erro ao salvar cliente no MySQL'
        );
      }
    }


    // ======================================
    // POST - CADASTRAR VEÍCULO NO MYSQL
    // ======================================

    if (tipo === 'veiculos') {

      try {

        // Extrai os dados do veículo.
        const { marca, modelo, ano, placa } = novo;

        // Aceita clienteId ou cliente_id.
        const clienteId =
          novo.clienteId ?? novo.cliente_id;

        // Verifica os campos obrigatórios.
        if (!marca || !modelo || !clienteId) {
          return erro(
            res,
            400,
            'Informe marca, modelo e cliente'
          );
        }

        // Verifica se o proprietário existe no MySQL.
        const [clientesEncontrados] = await db.execute(
          'SELECT id FROM clientes WHERE id = ?',
          [clienteId]
        );

        // Impede cadastrar veículo sem cliente válido.
        if (clientesEncontrados.length === 0) {
          return erro(
            res,
            400,
            'Cliente associado inexistente!'
          );
        }

        // Insere o veículo na tabela veiculos.
        await db.execute(
          `INSERT INTO veiculos
           (id, marca, modelo, ano, placa, cliente_id)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [
            novo.id,
            marca,
            modelo,
            ano ?? null,
            placa ?? null,
            clienteId
          ]
        );

        // Retorna o veículo cadastrado.
        return res.status(201).json({
          id: novo.id,
          marca,
          modelo,
          ano: ano ?? null,
          placa: placa ?? null,
          cliente_id: clienteId
        });

      } catch (erroBanco) {

        console.error(
          'Erro ao cadastrar veículo:',
          erroBanco.message
        );

        return erro(
          res,
          500,
          'Erro ao salvar veículo no MySQL'
        );
      }
    }
// ==========================================
// POST - CADASTRAR ORDEM DE SERVIÇO NO MYSQL
// ==========================================

// Verifica se estamos cadastrando uma ordem.
if (tipo === 'ordens-servico') {

  try {

    // Recebe os dados enviados pelo usuário.
    // Aceita os dois formatos de nomes dos IDs.
    const clienteId = novo.cliente_id ?? novo.clienteId;
    const veiculoId = novo.veiculo_id ?? novo.veiculoId;
    const descricao = novo.descricao;
    const status = novo.status;
    const valorInformado = novo.valor;
const valor = valorInformado == null || valorInformado === ''
  ? null
  : Number(String(valorInformado).replace(',', '.'));

    // Verifica se os dados obrigatórios foram enviados.
    if (!clienteId || !veiculoId ||
        typeof descricao !== 'string' || !descricao.trim()) {
      return erro(
        res,
        400,
        'Informe cliente, veículo e descrição'
      );
    }

    // Consulta se o veículo existe e pertence ao cliente.
    const [veiculosEncontrados] = await db.execute(
      'SELECT id FROM veiculos WHERE id = ? AND cliente_id = ?',
      [veiculoId, clienteId]
    );

    // Impede cadastrar uma ordem com veículo inválido.
    if (veiculosEncontrados.length === 0) {
      return erro(
        res,
        400,
        'Veículo inexistente ou não pertence ao cliente'
      );
    }

    // Verifica se o valor é válido, quando informado.
    if (valor !== null &&
        (typeof valor !== 'number' ||
         !Number.isFinite(valor) || valor < 0)) {
      return erro(res, 400, 'Informe um valor válido');
    }

    // INSERT cadastra a ordem no banco de dados.
    await db.execute(
      `INSERT INTO ordens_servico
       (id, cliente_id, veiculo_id, descricao, status, valor)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        novo.id,
        clienteId,
        veiculoId,
        descricao.trim(),
        status,
        valor
      ]
    );

    // HTTP 201 confirma que o cadastro foi realizado.
    return res.status(201).json({
      id: novo.id,
      cliente_id: clienteId,
      veiculo_id: veiculoId,
      descricao: descricao.trim(),
      status,
      valor
    });

  } catch (erroBanco) {

    // Exibe o erro no terminal.
    console.error(
      'Erro ao cadastrar ordem de serviço:',
      erroBanco.message
    );

    // Retorna HTTP 500 quando ocorre erro no MySQL.
    return erro(
      res,
      500,
      'Erro ao salvar ordem de serviço no MySQL'
    );
  }
}
    // Cadastro temporário de ordens de serviço.
    // push() adiciona o objeto ao array.
    itens.push(novo);

    return res.status(201).json(novo);
  });


  // ========================================
  // ROTA PUT - ATUALIZAR REGISTROS
  // ========================================

  // Exemplos:
  // PUT /clientes/123
  // PUT /veiculos/123
  //
  // O ID identifica o registro.
  // req.body contém os novos valores.

  app.put('/' + tipo + '/:id', async (req, res) => {

    // Valida os dados recebidos.
    if (
      !req.body ||
      typeof req.body !== 'object' ||
      Array.isArray(req.body)
    ) {
      return erro(res, 400, 'Dados inválidos');
    }

// ==========================================
// PUT - ATUALIZAR ORDEM DE SERVIÇO NO MYSQL
// ==========================================

// Verifica se a rota é de ordens de serviço.
if (tipo === 'ordens-servico') {

  try {

    // Busca a ordem atual pelo ID informado na URL.
    const [resultado] = await db.execute(
      'SELECT * FROM ordens_servico WHERE id = ?',
      [req.params.id]
    );

    // Retorna erro 404 caso a ordem não exista.
    if (resultado.length === 0) {
      return erro(res, 404, 'Ordem de serviço não encontrada');
    }

    // Guarda os dados atuais da ordem.
    const anterior = resultado[0];

    // Utiliza os novos valores quando informados.
    // Caso contrário, mantém os dados anteriores.
    const clienteId = req.body.cliente_id ??
                      req.body.clienteId ??
                      anterior.cliente_id;

    const veiculoId = req.body.veiculo_id ??
                      req.body.veiculoId ??
                      anterior.veiculo_id;

    const descricao = req.body.descricao ?? anterior.descricao;
    const status = req.body.status ?? anterior.status;
    const valor = req.body.valor ?? anterior.valor;

    // Verifica se a descrição é válida.
    if (typeof descricao !== 'string' || !descricao.trim()) {
      return erro(res, 400, 'Informe uma descrição válida');
    }

    // Verifica se o veículo pertence ao cliente.
    const [veiculosEncontrados] = await db.execute(
      'SELECT id FROM veiculos WHERE id = ? AND cliente_id = ?',
      [veiculoId, clienteId]
    );

    if (veiculosEncontrados.length === 0) {
      return erro(
        res,
        400,
        'Veículo inexistente ou não pertence ao cliente'
      );
    }

    // Valida o valor quando informado.
    if (
      valor !== null &&
      (isNaN(Number(valor)) || Number(valor) < 0)
    ) {
      return erro(res, 400, 'Informe um valor válido');
    }

    // UPDATE modifica a ordem no MySQL.
    await db.execute(
      `UPDATE ordens_servico
       SET cliente_id = ?, veiculo_id = ?,
           descricao = ?, status = ?, valor = ?
       WHERE id = ?`,
      [
        clienteId,
        veiculoId,
        descricao.trim(),
        status,
        valor,
        req.params.id
      ]
    );

    // Retorna a ordem com os dados atualizados.
    return res.json({
      id: req.params.id,
      cliente_id: clienteId,
      veiculo_id: veiculoId,
      descricao: descricao.trim(),
      status,
      valor
    });

  } catch (erroBanco) {

    // Exibe o erro no terminal.
    console.error(
      'Erro ao atualizar ordem de serviço:',
      erroBanco.message
    );

    // Retorna erro 500 caso ocorra falha no MySQL.
    return erro(
      res,
      500,
      'Erro ao atualizar ordem de serviço no MySQL'
    );
  }
}


    // ======================================
    // PUT - ATUALIZAR VEÍCULO NO MYSQL
    // ======================================

    if (tipo === 'veiculos') {

      try {

        // Busca o veículo antes de atualizar.
        const [resultado] = await db.execute(
          'SELECT * FROM veiculos WHERE id = ?',
          [req.params.id]
        );

        // Verifica se o veículo existe.
        if (resultado.length === 0) {
          return erro(
            res,
            404,
            'Veículo não encontrado'
          );
        }

        // Guarda os dados atuais do veículo.
        const anterior = resultado[0];

        // Mantém o valor anterior quando
        // o campo não é enviado na requisição.
        const marca = req.body.marca ?? anterior.marca;
        const modelo = req.body.modelo ?? anterior.modelo;
        // Recebe o ano enviado pelo aplicativo ou mantém o ano anterior.
// Number() converte o texto "2019" para o número 2019.
const ano = Number(req.body.ano ?? anterior.ano);
        const placa = req.body.placa ?? anterior.placa;

        // Identifica o proprietário do veículo.
        const clienteId =
          req.body.cliente_id ??
          req.body.clienteId ??
          anterior.cliente_id;

        // Valida marca e modelo.
        if (
          typeof marca !== 'string' ||
          !marca.trim() ||
          typeof modelo !== 'string' ||
          !modelo.trim()
        ) {
          return erro(
            res,
            400,
            'Informe marca e modelo válidos'
          );
        }

        // Verifica se o ano é um número inteiro válido.
        if (!Number.isInteger(ano) || ano < 1886) {
          return erro(
            res,
            400,
            'Informe um ano válido'
          );
        }

        // Verifica se o cliente existe.
        const [clientesEncontrados] = await db.execute(
          'SELECT id FROM clientes WHERE id = ?',
          [clienteId]
        );

        if (clientesEncontrados.length === 0) {
          return erro(
            res,
            400,
            'Cliente associado inexistente!'
          );
        }

        // UPDATE altera os dados do veículo no MySQL.
        await db.execute(
          `UPDATE veiculos
           SET marca = ?, modelo = ?, ano = ?,
               placa = ?, cliente_id = ?
           WHERE id = ?`,
          [
            marca.trim(),
            modelo.trim(),
            ano,
            placa,
            clienteId,
            req.params.id
          ]
        );

        // Retorna o veículo atualizado.
        return res.json({
          id: req.params.id,
          marca: marca.trim(),
          modelo: modelo.trim(),
          ano,
          placa,
          cliente_id: clienteId
        });

      } catch (erroBanco) {

        console.error(
          'Erro ao atualizar veículo:',
          erroBanco.message
        );

        return erro(
          res,
          500,
          'Erro ao atualizar veículo no MySQL'
        );
      }
    }


    // ======================================
    // PUT - ATUALIZAR CLIENTE NO MYSQL
    // ======================================

    if (tipo === 'clientes') {

      try {

        // Busca o cliente pelo ID.
        const [clientesEncontrados] = await db.execute(
          'SELECT * FROM clientes WHERE id = ?',
          [req.params.id]
        );

        // Verifica se o cliente existe.
        if (clientesEncontrados.length === 0) {
          return erro(
            res,
            404,
            'Cliente não encontrado'
          );
        }

        // Guarda os dados atuais.
        const anterior = clientesEncontrados[0];

        // Utiliza os novos valores quando enviados.
        const nome = req.body.nome ?? anterior.nome;
        const email = req.body.email ?? anterior.email;
        const telefone = req.body.telefone ?? anterior.telefone;

        // Impede nomes vazios.
        if (
          typeof nome !== 'string' ||
          !nome.trim()
        ) {
          return erro(
            res,
            400,
            'Informe um nome válido'
          );
        }

        // Atualiza o cliente no MySQL.
        await db.execute(
          `UPDATE clientes
           SET nome = ?, email = ?, telefone = ?
           WHERE id = ?`,
          [
            nome.trim(),
            email,
            telefone,
            req.params.id
          ]
        );

        // Retorna o cliente atualizado.
        return res.json({
          id: req.params.id,
          nome: nome.trim(),
          email,
          telefone
        });

      } catch (erroBanco) {

        console.error(
          'Erro ao atualizar cliente:',
          erroBanco.message
        );

        return erro(
          res,
          500,
          'Erro ao atualizar cliente no MySQL'
        );
      }
    }

    // Atualização temporária das ordens de serviço.
    // findIndex() localiza a posição do registro.
    const index = itens.findIndex(
      x => x.id === req.params.id
    );

    // Retorna 404 se não encontrar.
    if (index < 0) {
      return erro(
        res,
        404,
        nome + ' não encontrado(a)'
      );
    }

    // Junta os dados antigos com os novos.
    const atualizado = {
      ...itens[index],
      ...req.body,
      id: req.params.id
    };

    // Validação existente para veículos.
    if (
      tipo === 'veiculos' &&
      !clientes.some(c => c.id === atualizado.clienteId)
    ) {
      return erro(
        res,
        400,
        'Cliente associado inexistente!'
      );
    }

    // Validação temporária de ordens de serviço.
    if (
      tipo === 'ordens-servico' &&
      !veiculos.some(v => v.id === atualizado.veiculoId)
    ) {
      return erro(
        res,
        400,
        'Veículo associado inexistente!'
      );
    }

    // Substitui o registro antigo pelo atualizado.
    itens[index] = atualizado;

    return res.json(atualizado);
  });


  // ========================================
  // ROTA DELETE - EXCLUIR REGISTROS
  // ========================================

  // Exemplos:
  // DELETE /clientes/123
  // DELETE /veiculos/123
  //
  // HTTP 204 indica exclusão sem conteúdo.

  app.delete('/' + tipo + '/:id', async (req, res) => {

// ==========================================
// DELETE - EXCLUIR ORDEM DE SERVIÇO NO MYSQL
// ==========================================

// Verifica se estamos excluindo uma ordem de serviço.
if (tipo === 'ordens-servico') {

  try {

    // Executa o DELETE no MySQL.
    // O ? recebe o ID informado na URL.
    const [resultado] = await db.execute(
      'DELETE FROM ordens_servico WHERE id = ?',
      [req.params.id]
    );

    // affectedRows informa quantos registros foram excluídos.
    // Se for zero, a ordem não foi encontrada.
    if (resultado.affectedRows === 0) {
      return erro(
        res,
        404,
        'Ordem de serviço não encontrada'
      );
    }

    // HTTP 204 confirma a exclusão.
    // send() finaliza a resposta sem retornar JSON.
    return res.status(204).send();

  } catch (erroBanco) {

    // Mostra o erro no terminal do servidor.
    console.error(
      'Erro ao excluir ordem de serviço:',
      erroBanco.message
    );

    // Retorna HTTP 500 se ocorrer um erro no MySQL.
    return erro(
      res,
      500,
      'Erro ao excluir ordem de serviço no MySQL'
    );
  }
}


    // ======================================
    // DELETE - EXCLUIR VEÍCULO DO MYSQL
    // ======================================

    if (tipo === 'veiculos') {

      try {

        // Exclui o veículo pelo ID.
        const [resultado] = await db.execute(
          'DELETE FROM veiculos WHERE id = ?',
          [req.params.id]
        );

        // Verifica se algum registro foi excluído.
        if (resultado.affectedRows === 0) {
          return erro(
            res,
            404,
            'Veículo não encontrado'
          );
        }

        // Retorna HTTP 204 após excluir.
        return res.status(204).send();

      } catch (erroBanco) {

        // Impede exclusão quando o veículo
        // possui ordens de serviço vinculadas.
        if (erroBanco.code === 'ER_ROW_IS_REFERENCED_2') {
          return erro(
            res,
            409,
            'Veículo possui ordens de serviço'
          );
        }

        console.error(
          'Erro ao excluir veículo:',
          erroBanco.message
        );

        return erro(
          res,
          500,
          'Erro ao excluir veículo no MySQL'
        );
      }
    }


    // ======================================
    // DELETE - EXCLUIR CLIENTE DO MYSQL
    // ======================================

    if (tipo === 'clientes') {

      try {

        // Exclui o cliente pelo ID.
        const [resultado] = await db.execute(
          'DELETE FROM clientes WHERE id = ?',
          [req.params.id]
        );

        // Verifica se o cliente foi encontrado.
        if (resultado.affectedRows === 0) {
          return erro(
            res,
            404,
            'Cliente não encontrado'
          );
        }

        // Retorna HTTP 204 após a exclusão.
        return res.status(204).send();

      } catch (erroBanco) {

        // Impede excluir cliente com veículos
        // vinculados, conforme a chave estrangeira.
        if (erroBanco.code === 'ER_ROW_IS_REFERENCED_2') {
          return erro(
            res,
            409,
            'Cliente possui veículos cadastrados'
          );
        }

        console.error(
          'Erro ao excluir cliente:',
          erroBanco.message
        );

        return erro(
          res,
          500,
          'Erro ao excluir cliente no MySQL'
        );
      }
    }

    // Exclusão temporária das ordens de serviço.
    const index = itens.findIndex(
      x => x.id === req.params.id
    );

    // Se não encontrar, retorna HTTP 404.
    if (index < 0) {
      return erro(
        res,
        404,
        nome + ' não encontrado(a)'
      );
    }

    // Verificação existente para clientes.
    if (
      tipo === 'clientes' &&
      veiculos.some(v => v.clienteId === req.params.id)
    ) {
      return erro(
        res,
        409,
        'Cliente possui veículos cadastrados'
      );
    }

    // Verifica vínculos com ordens de serviço.
    if (
      tipo === 'veiculos' &&
      ordensServico.some(o => o.veiculoId === req.params.id)
    ) {
      return erro(
        res,
        409,
        'Veículo possui ordens de serviço'
      );
    }

    // splice() remove o registro do array.
    itens.splice(index, 1);

    return res.status(204).send();
  });
}


// ==========================================
// 6. ROTA AUXILIAR DE TESTE DO MYSQL
// ==========================================

// Rota utilizada para testar o cadastro de clientes.
// POST /teste-clientes-mysql
// Atenção: também insere um cliente no banco.

app.post('/teste-clientes-mysql', async (req, res) => {

  try {

    // Recebe os dados enviados no JSON.
    const { nome, email, telefone } = req.body;

    // Verifica se o nome foi informado.
    if (!nome || !String(nome).trim()) {
      return res.status(400).json({
        erro: 'Informe o nome do cliente'
      });
    }

    // Gera um identificador único.
    const id = randomUUID();

    // Comando SQL para cadastrar o cliente.
    const sql = `
      INSERT INTO clientes (id, nome, email, telefone)
      VALUES (?, ?, ?, ?)
    `;

    // Executa o INSERT no MySQL.
    await db.execute(sql, [
      id,
      nome,
      email || null,
      telefone || null
    ]);

    // Retorna o cliente cadastrado.
    res.status(201).json({
      id,
      nome,
      email,
      telefone
    });

  } catch (erro) {

    // Mostra o erro no terminal.
    console.error(
      'Erro no MySQL:',
      erro.message
    );

    // Retorna erro HTTP 500.
    res.status(500).json({
      erro: 'Não foi possível cadastrar o cliente'
    });
  }
});


// ==========================================
// 7. ROTA INICIAL DA API
// ==========================================

// GET / mostra uma mensagem e as rotas disponíveis.
app.get('/', (req, res) => {
  return res.json({
    mensagem: 'API Oficina Mecânica funcionando',
    rotas: Object.keys(tabelas)
  });
});


// ==========================================
// 8. INICIALIZAÇÃO DO SERVIDOR
// ==========================================

// Inicia a API na porta 3000.
// 0.0.0.0 permite conexões pelas interfaces
// de rede do computador.
app.listen(3000, '0.0.0.0', () => {
  console.log(
    'API rodando em http://localhost:3000'
  );
});
