export const secoes = {
  clientes: { titulo: 'Clientes', singular: 'Cliente', emoji: '👥', campos: [ ['nome','Nome completo'], ['email','E-mail'], ['telefone','Telefone'] ] },
  veiculos: { titulo: 'Veículos', singular: 'Veículo', emoji: '🚙', campos: [ ['marca','Marca'], ['modelo','Modelo'], ['placa','Placa'], ['ano','Ano'], ['clienteId','ID do cliente'] ] },
  'ordens-servico': { titulo: 'Ordens de serviço', singular: 'Ordem de serviço', emoji: '🔧', campos: [ ['veiculoId','ID do veículo'], ['descricao','Descrição do serviço'], ['status','Status'], ['valor','Valor (R$)'] ] },
} as const;
export type Tipo = keyof typeof secoes;
export function valido(tipo: string): tipo is Tipo { return tipo in secoes; }
export function resumo(tipo: Tipo, item: any) {
  if (tipo === 'clientes') return item.nome || 'Sem nome';
  if (tipo === 'veiculos') return `${item.marca || ''} ${item.modelo || ''}`.trim() || 'Veículo';
  return item.descricao || 'Ordem de serviço';
}
