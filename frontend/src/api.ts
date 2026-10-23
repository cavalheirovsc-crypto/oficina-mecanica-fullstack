// No celular: substitua pelo IPv4 do computador (ex.: http://192.168.1.10:3000).
// No emulador Android: use http://10.0.2.2:3000.
export const API_URL = 'http://localhost:3000';
export type Registro = { id: string; [campo: string]: any };
export async function api(caminho: string, metodo = 'GET', dados?: object): Promise<any> {
  const resposta = await fetch(`${API_URL}${caminho}`, {
    method: metodo,
    headers: { 'Content-Type': 'application/json' },
    ...(dados ? { body: JSON.stringify(dados) } : {}),
  });
  if (resposta.status === 204) return null;
  const resultado = await resposta.json();
  if (!resposta.ok) throw new Error(resultado.erro || 'Falha na requisição');
  return resultado;
}
