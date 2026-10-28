
import { useCallback, useState } from 'react';
import {
  View, Text, ScrollView, Pressable,
  Alert, ActivityIndicator, Platform
} from 'react-native';
import {
  Link, Stack, useFocusEffect,
  useLocalSearchParams, useRouter
} from 'expo-router';
import { api, Registro } from '../../../src/api';
import { secoes, valido, resumo } from '../../../src/config';

export default function Detalhes() {
  const { tipo, id } = useLocalSearchParams<{ tipo: string; id: string }>();
  const router = useRouter();

  // Dados do registro, cliente e veículo.
  const [item, setItem] = useState<Registro | null>(null);
  const [cliente, setCliente] = useState<any>(null);
  const [veiculo, setVeiculo] = useState<any>(null);

  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(true);
  // Guarda todos os veículos pertencentes ao cliente consultado.
const [veiculosCliente, setVeiculosCliente] = useState<any[]>([]);

// Guarda as ordens de serviço dos veículos do cliente.
const [ordensCliente, setOrdensCliente] = useState<any[]>([]);

  // Busca os dados atualizados ao abrir a tela.
  useFocusEffect(
    useCallback(() => {
      if (!valido(tipo)) return;

      let ativo = true;

      async function carregar() {
        setCarregando(true);
        setErro('');
        setItem(null);
        setCliente(null);
        setVeiculo(null);
        setVeiculosCliente([]);
        // Limpa o histórico antes de carregar novamente.
setOrdensCliente([]);

        try {
          const registro = await api(`/${tipo}/${id}`);
          if (!ativo) return;

          setItem(registro);

          // Busca os veículos cadastrados para este cliente.
if (tipo === 'clientes') {
// Busca os veículos e as ordens de serviço cadastradas.
const [todosVeiculos, todasOrdens] = await Promise.all([
  api('/veiculos'),
  api('/ordens-servico')
]);
  const associados = todosVeiculos.filter((v: any) =>
    String(v.cliente_id ?? v.clienteId) === String(id)
  );

if (ativo) {
  setVeiculosCliente(associados);

  // Seleciona apenas as ordens pertencentes ao cliente.
  const ordensAssociadas = todasOrdens.filter((ordem: any) =>
    String(ordem.cliente_id ?? ordem.clienteId) === String(id)
  );

  setOrdensCliente(ordensAssociadas);
}}

          // Busca o cliente e o veículo associados à ordem.
          if (tipo === 'ordens-servico') {
            const clienteId = registro.cliente_id ?? registro.clienteId;
            const veiculoId = registro.veiculo_id ?? registro.veiculoId;

            const [dadosCliente, dadosVeiculo] = await Promise.all([
              clienteId ? api(`/clientes/${clienteId}`) : Promise.resolve(null),
              veiculoId ? api(`/veiculos/${veiculoId}`) : Promise.resolve(null)
            ]);

            if (ativo) {
              setCliente(dadosCliente);
              setVeiculo(dadosVeiculo);
            }
          }
        } catch (e: any) {
          if (ativo) setErro(e.message);
        } finally {
          if (ativo) setCarregando(false);
        }
      }

      carregar();
      return () => { ativo = false; };
    }, [tipo, id])
  );

  // Mostra informações legíveis em vez dos IDs.
  function obterValor(chave: string) {
    if (!item) return '—';

    if (tipo === 'ordens-servico') {
      if (chave === 'clienteId') return cliente?.nome ?? '—';

      if (chave === 'veiculoId') {
        return veiculo
          ? `${veiculo.marca} ${veiculo.modelo} - ${veiculo.placa}`
          : '—';
      }
    }

    const campo = chave === 'clienteId' ? 'cliente_id'
      : chave === 'veiculoId' ? 'veiculo_id' : chave;

    return String(item[campo] ?? '—');
  }

  // Exclui o registro pela API.
  async function excluir() {
    try {
      await api(`/${tipo}/${id}`, 'DELETE');
      router.replace({ pathname: '/[tipo]', params: { tipo } });
    } catch (e: any) {
      if (Platform.OS === 'web') window.alert(e.message);
      else Alert.alert('Erro', e.message);
    }
  }

  // Solicita confirmação antes de excluir.
  function confirmarExclusao() {
    if (Platform.OS === 'web') {
      if (window.confirm('Deseja realmente excluir este registro?')) excluir();
    } else {
      Alert.alert('Excluir registro', 'Deseja realmente excluir?', [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Excluir', style: 'destructive', onPress: excluir }
      ]);
    }
  }

  if (!valido(tipo)) return <Text>Seção inválida</Text>;

  return (
    <ScrollView className="flex-1 px-5 pt-6">
      <Stack.Screen options={{ title: 'Consultar ' + secoes[tipo].singular }} />

      {erro ? (
        <Text className="text-red-600">{erro}</Text>
      ) : carregando || !item ? (
        <ActivityIndicator />
      ) : (
        <>
          <View className="bg-white rounded-2xl p-6 border border-slate-200 mb-5">
            <Text className="text-3xl mb-3">{secoes[tipo].emoji}</Text>

            <Text className="text-slate-900 text-2xl font-extrabold mb-4">
              {resumo(tipo, item)}
            </Text>

            {secoes[tipo].campos.map(([chave, rotulo]) => (
              <View key={chave} className="border-t border-slate-100 py-3">
                <Text className="text-slate-500 text-xs uppercase font-semibold">
                  {tipo === 'ordens-servico' && chave === 'clienteId'
                    ? 'Cliente'
                    : tipo === 'ordens-servico' && chave === 'veiculoId'
                    ? 'Veículo / Placa'
                    : rotulo}
                </Text>

                <Text className="text-slate-900 mt-1">
                  {obterValor(chave)}
                </Text>
              </View>
            ))}

            {/* O ID interno não é exibido para o funcionário. */}
          </View>
          {/* Lista os veículos pertencentes ao cliente consultado. */}
{tipo === 'clientes' && (
  <View className="bg-white rounded-2xl p-5 border border-slate-200 mb-5">

    <Text className="text-slate-900 text-xl font-extrabold mb-4">
      🚙 Veículos cadastrados
    </Text>

    {veiculosCliente.length === 0 ? (
      <Text className="text-slate-500">
        Este cliente ainda não possui veículos cadastrados.
      </Text>
    ) : (
      veiculosCliente.map((v: any) => (
        <View
          key={String(v.id)}
          className="bg-slate-50 rounded-xl p-4 mb-3"
        >
          <Text className="text-slate-900 font-bold text-lg">
            {v.marca} {v.modelo}
          </Text>

          <Text className="text-slate-600 mt-1">
            Placa: {v.placa}
          </Text>

          <Text className="text-slate-600">
            Ano: {v.ano}
          </Text>
          
{/* Histórico de serviços deste veículo. */}
<View className="border-t border-slate-200 mt-4 pt-4">
  <Text className="text-slate-900 font-bold mb-3">
    🔧 Histórico de serviços
  </Text>

  {ordensCliente.filter((ordem: any) =>
    String(ordem.veiculo_id ?? ordem.veiculoId) === String(v.id)
  ).length === 0 ? (
    <Text className="text-slate-500">
      Nenhum serviço registrado para este veículo.
    </Text>
  ) : (
    ordensCliente
      .filter((ordem: any) =>
        String(ordem.veiculo_id ?? ordem.veiculoId) === String(v.id)
      )
      .map((ordem: any) => (
        <Link
          key={String(ordem.id)}
          href={{
            pathname: '/[tipo]/[id]',
            params: {
              tipo: 'ordens-servico',
              id: String(ordem.id)
            }
          }}
          asChild
        >
          <Pressable className="bg-white border border-slate-200 rounded-xl p-3 mb-2">
            <Text className="text-slate-900 font-bold">
              {ordem.descricao}
            </Text>

            <Text className="text-slate-600 mt-1">
              Status: {ordem.status}
            </Text>

            <Text className="text-slate-600">
              Valor: R$ {Number(ordem.valor).toFixed(2).replace('.', ',')}
            </Text>

            <Text className="text-blue-600 font-semibold mt-2">
              Consultar ordem de serviço
            </Text>
          </Pressable>
        </Link>
      ))
  )}
</View>

{/* Abre uma ordem de serviço para este veículo. */}
<Link
  href={{
    pathname: '/[tipo]/novo',
    params: {
      tipo: 'ordens-servico',
      clienteId: id,
      veiculoId: String(v.id)
    }
  }}
  asChild
>
  <Pressable className="bg-amber-500 rounded-xl p-3 mt-4">
    <Text className="text-slate-950 text-center font-bold">
      + Nova ordem de serviço
    </Text>
  </Pressable>
</Link>

        </View>
      ))
    )}

  </View>
)}
{/* Permite cadastrar outro veículo para o cliente consultado. */}
{tipo === 'clientes' && (
  <Link
    href={{
      pathname: '/[tipo]/novo',
      params: { tipo: 'veiculos', clienteId: id }
    }}
    asChild
  >
    <Pressable className="bg-blue-600 rounded-xl p-4 mb-3">
      <Text className="text-white text-center font-bold">
        + Cadastrar novo veículo
      </Text>
    </Pressable>
  </Link>
)}

          <Link
            href={{ pathname: '/[tipo]/[id]/editar', params: { tipo, id } }}
            asChild
          >
            <Pressable className="bg-slate-900 rounded-xl p-4 mb-3">
              <Text className="text-white text-center font-bold">
                Editar registro
              </Text>
            </Pressable>
          </Link>

          <Pressable
            className="border border-red-300 rounded-xl p-4 mb-10"
            onPress={confirmarExclusao}
          >
            <Text className="text-red-600 text-center font-bold">
              Excluir registro
            </Text>
          </Pressable>
        </>
      )}
    </ScrollView>
  );
}
