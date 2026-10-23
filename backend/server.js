const express = require('express');
const cors = require('cors');
const { randomUUID } = require('crypto');
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
  app.get('/' + tipo, (req, res) => res.json(itens));
  app.get('/' + tipo + '/:id', (req, res) => {
    const item = itens.find(x => x.id === req.params.id);
    return item ? res.json(item) : erro(res, 404, nome + ' não encontrado(a)');
  });
  app.post('/' + tipo, (req, res) => {
    if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) return erro(res, 400, 'Dados inválidos');
    if (tipo === 'clientes' && !String(req.body.nome || '').trim()) return erro(res, 400, 'Informe o nome');
    if (tipo === 'veiculos' && !clientes.some(c => c.id === req.body.clienteId)) return erro(res, 400, 'Cliente associado inexistente!');
    if (tipo === 'ordens-servico' && !veiculos.some(v => v.id === req.body.veiculoId)) return erro(res, 400, 'Veículo associado inexistente!');
    const novo = { ...req.body, ...(tipo === 'ordens-servico' ? { status: req.body.status || 'Aberta' } : {}), id: randomUUID() };
    itens.push(novo); return res.status(201).json(novo);
  });
  app.put('/' + tipo + '/:id', (req, res) => {
    const index = itens.findIndex(x => x.id === req.params.id);
    if (index < 0) return erro(res, 404, nome + ' não encontrado(a)');
    if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) return erro(res, 400, 'Dados inválidos');
    const atualizado = { ...itens[index], ...req.body, id: req.params.id };
    if (tipo === 'veiculos' && !clientes.some(c => c.id === atualizado.clienteId)) return erro(res, 400, 'Cliente associado inexistente!');
    if (tipo === 'ordens-servico' && !veiculos.some(v => v.id === atualizado.veiculoId)) return erro(res, 400, 'Veículo associado inexistente!');
    itens[index] = atualizado; return res.json(atualizado);
  });
  app.delete('/' + tipo + '/:id', (req, res) => {
    const index = itens.findIndex(x => x.id === req.params.id);
    if (index < 0) return erro(res, 404, nome + ' não encontrado(a)');
    if (tipo === 'clientes' && veiculos.some(v => v.clienteId === req.params.id)) return erro(res, 409, 'Cliente possui veículos cadastrados');
    if (tipo === 'veiculos' && ordensServico.some(o => o.veiculoId === req.params.id)) return erro(res, 409, 'Veículo possui ordens de serviço');
    itens.splice(index, 1); return res.status(204).send();
  });
}
app.get('/', (req, res) => res.json({ mensagem: 'API Oficina Mecânica funcionando', rotas: Object.keys(tabelas) }));
app.listen(3000, '0.0.0.0', () => console.log('API rodando em http://localhost:3000'));
