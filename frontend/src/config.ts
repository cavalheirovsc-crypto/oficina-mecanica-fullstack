export const secoes = {
  clientes: { titulo: 'Clientes', singular: 'Cliente', emoji: '👥', campos: [ ['nome','Nome completo'], ['email','E-mail'], ['telefone','Telefone'] ] },
  veiculos: { titulo: 'Veículos', singular: 'Veículo', emoji: '🚙', campos: [ ['marca','Marca'], ['modelo','Modelo'], ['placa','Placa'], ['ano','Ano'], ['cliente_id','ID do cliente'] ] },
  'ordens-servico': {
  titulo: 'Ordens de serviço',
  singular: 'Ordem de serviço',
  emoji: '🔧',
  campos: [
    ['clienteId', 'ID do cliente'], // Cliente responsável pelo serviço
    ['veiculoId', 'ID do veículo'], // Veículo que receberá o serviço
    ['descricao', 'Descrição do serviço'], // Serviço solicitado
    ['status', 'Status'], // Situação da ordem
    ['valor', 'Valor (R$)'] // Preço do serviço
  ]
},
} as const;
export type Tipo = keyof typeof secoes;
export function valido(tipo: string): tipo is Tipo { return tipo in secoes; }
export function resumo(tipo: Tipo, item: any) {
  if (tipo === 'clientes') return item.nome || 'Sem nome';
  if (tipo === 'veiculos') return `${item.marca || ''} ${item.modelo || ''}`.trim() || 'Veículo';
  return item.descricao || 'Ordem de serviço';
}
