const express = require('express');
const cors = require('cors');
const { randomUUID } = require('crypto');
const db = require('./db');
const app = express();
app.use(cors());
app.use(express.json());
let clientes = [], veiculos = [], ordensServico = [];
const tabelas = { clientes, veiculos, 'ordens-servico': ordensServico };
const nomes = { clientes: 'Cliente', veiculos: 'Veículo', 'ordens-servico': 'Ordem de serviço' };
function erro(res, codigo, mensagem) { return res.status(codigo).json({ erro: mensagem }); }
for (const tipo of Object.keys(tabelas)) {
  const itens = tabelas[tipo];
  const nome = nomes[tipo];
  
  app.get('/' + tipo, async (req, res) => {
    if (tipo === 'clientes') {
      try {
        const [resultado] = await db.execute(
          'SELECT * FROM clientes'
        );

        return res.json(resultado);
      } catch (erroBanco) {
        console.error('Erro ao listar clientes:', erroBanco.message);
        return erro(res, 500, 'Erro ao buscar clientes no MySQL');
      }
    }

    if (tipo === 'veiculos') {
  try {
    const [resultado] = await db.execute(
      'SELECT * FROM veiculos'
    );

    return res.json(resultado);

  } catch (erroBanco) {
    console.error('Erro ao listar veículos:', erroBanco.message);
    return erro(res, 500, 'Erro ao buscar veículos no MySQL');
  }
}

return res.json(itens);
  });

  
app.get('/' + tipo + '/:id', async (req, res) => {

  if (tipo === 'veiculos') {
  try {
    const [resultado] = await db.execute(
      'SELECT * FROM veiculos WHERE id = ?',
      [req.params.id]
    );

    if (resultado.length === 0) {
      return erro(res, 404, 'Veículo não encontrado');
    }

    return res.json(resultado[0]);

  } catch (erroBanco) {
    console.error('Erro ao buscar veículo:', erroBanco.message);
    return erro(res, 500, 'Erro ao consultar veículo no MySQL');
  }
}

  if (tipo === 'clientes') {
    try {
      const [resultado] = await db.execute(
        'SELECT * FROM clientes WHERE id = ?',
        [req.params.id]
      );

      if (resultado.length === 0) {
        return erro(res, 404, 'Cliente não encontrado');
      }

      return res.json(resultado[0]);

    } catch (erroBanco) {
      console.error('Erro ao buscar cliente:', erroBanco.message);
      return erro(res, 500, 'Erro ao consultar MySQL');
    }
  }

  const item = itens.find(x => x.id === req.params.id);

  return item
    ? res.json(item)
    : erro(res, 404, nome + ' não encontrado(a)');
});

  app.post('/' + tipo, async (req, res) => {
    if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) return erro(res, 400, 'Dados inválidos');
    if (tipo === 'clientes' && !String(req.body.nome || '').trim()) return erro(res, 400, 'Informe o nome');
    if (tipo === 'ordens-servico' && !veiculos.some(v => v.id === req.body.veiculoId)) return erro(res, 400, 'Veículo associado inexistente!');
    
    const novo = {
      ...req.body,
      ...(tipo === 'ordens-servico'
        ? { status: req.body.status || 'Aberta' }
        : {}),
      id: randomUUID()
    };

    if (tipo === 'clientes') {
      try {
        const sql = `
          INSERT INTO clientes (id, nome, email, telefone)
          VALUES (?, ?, ?, ?)
        `;

        await db.execute(sql, [
          novo.id,
          novo.nome.trim(),
          novo.email || null,
          novo.telefone || null
        ]);

        return res.status(201).json(novo);

      } catch (erroBanco) {
        console.error('Erro ao cadastrar cliente:', erroBanco.message);
        return erro(res, 500, 'Erro ao salvar cliente no MySQL');
      }
    }

    if (tipo === 'veiculos') {
  try {
    const { marca, modelo, ano, placa } = novo;
    const clienteId = novo.clienteId ?? novo.cliente_id;

    if (!marca || !modelo || !clienteId) {
      return erro(res, 400, 'Informe marca, modelo e cliente');
    }

    const [clientesEncontrados] = await db.execute(
      'SELECT id FROM clientes WHERE id = ?',
      [clienteId]
    );

    if (clientesEncontrados.length === 0) {
      return erro(res, 400, 'Cliente associado inexistente!');
    }

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

    return res.status(201).json({
      id: novo.id,
      marca,
      modelo,
      ano: ano ?? null,
      placa: placa ?? null,
      cliente_id: clienteId
    });

  } catch (erroBanco) {
    console.error('Erro ao cadastrar veículo:', erroBanco.message);
    return erro(res, 500, 'Erro ao salvar veículo no MySQL');
  }
}
    itens.push(novo);
    return res.status(201).json(novo);

  });

  app.put('/' + tipo + '/:id', async (req, res) => {

    if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) {
      return erro(res, 400, 'Dados inválidos');
    }
    if (tipo === 'veiculos') {
  try {
    const [resultado] = await db.execute(
      'SELECT * FROM veiculos WHERE id = ?',
      [req.params.id]
    );

    if (resultado.length === 0) {
      return erro(res, 404, 'Veículo não encontrado');
    }

    const anterior = resultado[0];

    const marca = req.body.marca ?? anterior.marca;
    const modelo = req.body.modelo ?? anterior.modelo;
    const ano = req.body.ano ?? anterior.ano;
    const placa = req.body.placa ?? anterior.placa;
    const clienteId = req.body.cliente_id ??
                      req.body.clienteId ??
                      anterior.cliente_id;

    if (typeof marca !== 'string' || !marca.trim() ||
        typeof modelo !== 'string' || !modelo.trim()) {
      return erro(res, 400, 'Informe marca e modelo válidos');
    }

    if (!Number.isInteger(ano) || ano < 1886) {
      return erro(res, 400, 'Informe um ano válido');
    }

    const [clientesEncontrados] = await db.execute(
      'SELECT id FROM clientes WHERE id = ?',
      [clienteId]
    );

    if (clientesEncontrados.length === 0) {
      return erro(res, 400, 'Cliente associado inexistente!');
    }

    await db.execute(
      `UPDATE veiculos
       SET marca = ?, modelo = ?, ano = ?, placa = ?, cliente_id = ?
       WHERE id = ?`,
      [marca.trim(), modelo.trim(), ano, placa, clienteId, req.params.id]
    );

    return res.json({
      id: req.params.id,
      marca: marca.trim(),
      modelo: modelo.trim(),
      ano,
      placa,
      cliente_id: clienteId
    });

  } catch (erroBanco) {
    console.error('Erro ao atualizar veículo:', erroBanco.message);
    return erro(res, 500, 'Erro ao atualizar veículo no MySQL');
  }
}
    if (tipo === 'clientes') {
      try {
        const [clientesEncontrados] = await db.execute(
          'SELECT * FROM clientes WHERE id = ?',
          [req.params.id]
        );

        if (clientesEncontrados.length === 0) {
          return erro(res, 404, 'Cliente não encontrado');
        }

        const anterior = clientesEncontrados[0];

        const nome = req.body.nome ?? anterior.nome;
        const email = req.body.email ?? anterior.email;
        const telefone = req.body.telefone ?? anterior.telefone;

        if (typeof nome !== 'string' || !nome.trim()) {
          return erro(res, 400, 'Informe um nome válido');
        }

        await db.execute(
          'UPDATE clientes SET nome = ?, email = ?, telefone = ? WHERE id = ?',
          [nome.trim(), email, telefone, req.params.id]
        );

        return res.json({
          id: req.params.id,
          nome: nome.trim(),
          email,
          telefone
        });

      } catch (erroBanco) {
        console.error('Erro ao atualizar cliente:', erroBanco.message);
        return erro(res, 500, 'Erro ao atualizar cliente no MySQL');
      }
    }

    const index = itens.findIndex(x => x.id === req.params.id);

    if (index < 0) {
      return erro(res, 404, nome + ' não encontrado(a)');
    }

    const atualizado = { ...itens[index], ...req.body, id: req.params.id };

    if (tipo === 'veiculos' && !clientes.some(c => c.id === atualizado.clienteId)) {
      return erro(res, 400, 'Cliente associado inexistente!');
    }

    if (tipo === 'ordens-servico' && !veiculos.some(v => v.id === atualizado.veiculoId)) {
      return erro(res, 400, 'Veículo associado inexistente!');
    }

    itens[index] = atualizado;
    return res.json(atualizado);
  });

  app.delete('/' + tipo + '/:id', async (req, res) => {
    if (tipo === 'veiculos') {
  try {
    const [resultado] = await db.execute(
      'DELETE FROM veiculos WHERE id = ?',
      [req.params.id]
    );

    if (resultado.affectedRows === 0) {
      return erro(res, 404, 'Veículo não encontrado');
    }

    return res.status(204).send();

  } catch (erroBanco) {
    if (erroBanco.code === 'ER_ROW_IS_REFERENCED_2') {
      return erro(res, 409, 'Veículo possui ordens de serviço');
    }

    console.error('Erro ao excluir veículo:', erroBanco.message);
    return erro(res, 500, 'Erro ao excluir veículo no MySQL');
  }
}

    if (tipo === 'clientes') {
      try {
        const [resultado] = await db.execute(
          'DELETE FROM clientes WHERE id = ?',
          [req.params.id]
        );

        if (resultado.affectedRows === 0) {
          return erro(res, 404, 'Cliente não encontrado');
        }

        return res.status(204).send();

      } catch (erroBanco) {
        if (erroBanco.code === 'ER_ROW_IS_REFERENCED_2') {
          return erro(res, 409, 'Cliente possui veículos cadastrados');
        }

        console.error('Erro ao excluir cliente:', erroBanco.message);
        return erro(res, 500, 'Erro ao excluir cliente no MySQL');
      }
    }

    const index = itens.findIndex(x => x.id === req.params.id);
    if (index < 0) return erro(res, 404, nome + ' não encontrado(a)');
    if (tipo === 'clientes' && veiculos.some(v => v.clienteId === req.params.id)) return erro(res, 409, 'Cliente possui veículos cadastrados');
    if (tipo === 'veiculos' && ordensServico.some(o => o.veiculoId === req.params.id)) return erro(res, 409, 'Veículo possui ordens de serviço');
    itens.splice(index, 1); return res.status(204).send();
  });
}

app.post('/teste-clientes-mysql', async (req, res) => {
  try {
    const { nome, email, telefone } = req.body;

    if (!nome || !String(nome).trim()) {
      return res.status(400).json({
        erro: 'Informe o nome do cliente'
      });
    }

    const id = randomUUID();

    const sql = `
      INSERT INTO clientes (id, nome, email, telefone)
      VALUES (?, ?, ?, ?)
    `;

    await db.execute(sql, [
      id,
      nome,
      email || null,
      telefone || null
    ]);

    res.status(201).json({
      id,
      nome,
      email,
      telefone
    });

  } catch (erro) {
    console.error('Erro no MySQL:', erro.message);

    res.status(500).json({
      erro: 'Não foi possível cadastrar o cliente'
    });
  }
});

app.get('/', (req, res) => res.json({ mensagem: 'API Oficina Mecânica funcionando', rotas: Object.keys(tabelas) }));
app.listen(3000, '0.0.0.0', () => console.log('API rodando em http://localhost:3000'));
