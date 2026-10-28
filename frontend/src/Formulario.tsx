
import { useEffect, useState } from 'react';
import {
  View, Text, TextInput, ScrollView,
  Pressable, Alert, ActivityIndicator
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { api } from './api';
import { secoes, Tipo } from './config';

// Formulário para cadastrar e editar registros.
export default function Formulario({ tipo, id }: { tipo: Tipo; id?: string }) {
  const router = useRouter();

  const [valores, setValores] = useState<Record<string, string>>({});
  const [salvando, setSalvando] = useState(false);
  const [carregando, setCarregando] = useState(!!id);
  const [erro, setErro] = useState('');

  // Dados utilizados na busca pela placa.
  const [placaBusca, setPlacaBusca] = useState('');
  const [veiculoEncontrado, setVeiculoEncontrado] = useState<any>(null);
  const [clienteEncontrado, setClienteEncontrado] = useState<any>(null);

  // Carrega os dados existentes ao editar.
  useEffect(() => {
    if (!id) return;

    let ativo = true;

    async function carregar() {
      setCarregando(true);
      setErro('');

      try {
        const registro = await api(`/${tipo}/${id}`);

        // Converte os dados recebidos para os campos do formulário.
        const dados = Object.fromEntries(
          Object.entries(registro).map(([chave, valor]) => [
            chave, String(valor ?? '')
          ])
        );

        if (tipo === 'ordens-servico') {
          const clienteId = registro.cliente_id ?? registro.clienteId;
          const veiculoId = registro.veiculo_id ?? registro.veiculoId;

          dados.clienteId = String(clienteId ?? '');
          dados.veiculoId = String(veiculoId ?? '');

          // Identifica automaticamente o cliente e o veículo atuais.
          const [cliente, veiculo] = await Promise.all([
            clienteId ? api(`/clientes/${clienteId}`) : Promise.resolve(null),
            veiculoId ? api(`/veiculos/${veiculoId}`) : Promise.resolve(null)
          ]);

          if (ativo) {
            setClienteEncontrado(cliente);
            setVeiculoEncontrado(veiculo);
            setPlacaBusca(String(veiculo?.placa ?? ''));
          }
        }

        if (ativo) setValores(dados);
      } catch (e: any) {
        if (ativo) setErro(e.message);
      } finally {
        if (ativo) setCarregando(false);
      }
    }

    carregar();
    return () => { ativo = false; };
  }, [tipo, id]);

  // Busca o veículo pela placa e identifica seu proprietário.
  async function buscarPlaca() {
    setErro('');

    // Evita manter um veículo anterior quando a busca falhar.
    setVeiculoEncontrado(null);
    setClienteEncontrado(null);
    setValores(v => ({ ...v, clienteId: '', veiculoId: '' }));

    try {
      const placa = placaBusca.trim().toUpperCase().replace(/[-\s]/g, '');

      if (!placa) {
        setErro('Digite a placa do veículo.');
        return;
      }

      const veiculos = await api('/veiculos');

      const encontrados = veiculos.filter((v: any) =>
        String(v.placa ?? '').toUpperCase().replace(/[-\s]/g, '') === placa
      );

      if (encontrados.length !== 1) {
        setErro(encontrados.length
          ? 'Placa duplicada. Verifique o cadastro.'
          : 'Placa não encontrada.');
        return;
      }

      const veiculo = encontrados[0];
      const clienteId = veiculo.cliente_id ?? veiculo.clienteId;

      if (!clienteId) {
        setErro('Este veículo não possui cliente associado.');
        return;
      }

      const cliente = await api(`/clientes/${clienteId}`);

      // Guarda os IDs internamente, sem exibi-los.
      setValores(v => ({
        ...v,
        clienteId: String(clienteId),
        veiculoId: String(veiculo.id)
      }));

      setVeiculoEncontrado(veiculo);
      setClienteEncontrado(cliente);

      Alert.alert('Veículo encontrado', 'Placa: ' + veiculo.placa);
    } catch (e: any) {
      setErro(e.message);
    }
  }

  // Salva o cadastro ou a edição.
  async function salvar() {
    setErro('');

    // Uma ordem precisa estar vinculada a um cliente e veículo.
    if (tipo === 'ordens-servico' &&
        (!valores.clienteId || !valores.veiculoId)) {
      setErro('Busque uma placa válida antes de salvar.');
      return;
    }

    setSalvando(true);

    try {
      const dados = Object.fromEntries(
        secoes[tipo].campos.map(([chave]) => [
          chave, valores[chave] ?? ''
        ])
      );

      await api(
        id ? `/${tipo}/${id}` : `/${tipo}`,
        id ? 'PUT' : 'POST',
        dados
      );

      Alert.alert('Sucesso', id ? 'Registro atualizado' : 'Registro cadastrado');
      router.replace({ pathname: '/[tipo]', params: { tipo } });
    } catch (e: any) {
      setErro(e.message);
    } finally {
      setSalvando(false);
    }
  }

  return (
    <ScrollView className="flex-1 px-5 pt-6">
      <Stack.Screen options={{
        title: id
          ? 'Editar ' + secoes[tipo].singular
          : 'Cadastrar ' + secoes[tipo].singular
      }} />

      <Text className="text-slate-900 text-2xl font-extrabold mb-2">
        {id ? 'Editar cadastro' : 'Novo cadastro'}
      </Text>

      <Text className="text-slate-500 mb-6">
        Preencha os dados abaixo.
      </Text>

      {carregando ? (
        <ActivityIndicator />
      ) : (
        <>
          {/* Busca pela placa nas ordens de serviço. */}
          {tipo === 'ordens-servico' && (
            <View className="mb-4">
              <Text className="text-slate-700 font-semibold mb-2">
                Buscar veículo pela placa
              </Text>

              <TextInput
                className="bg-white border border-slate-300 rounded-xl px-4 py-4 text-slate-900"
                placeholder="Ex: URI3H54"
                placeholderTextColor="#94a3b8"
                value={placaBusca}
                onChangeText={texto => {
                  setPlacaBusca(texto);
                  setVeiculoEncontrado(null);
                  setClienteEncontrado(null);
                  setValores(v => ({
                    ...v,
                    clienteId: '',
                    veiculoId: ''
                  }));
                }}
                autoCapitalize="characters"
              />

              <Pressable
                onPress={buscarPlaca}
                className="bg-blue-600 rounded-xl p-4 mt-3"
              >
                <Text className="text-white text-center font-bold">
                  Buscar placa
                </Text>
              </Pressable>
            </View>
          )}

          {/* Exibe os dados legíveis, sem os IDs. */}
          {tipo === 'ordens-servico' &&
            clienteEncontrado && veiculoEncontrado && (
              <View className="bg-green-50 border border-green-300 rounded-xl p-4 mb-4">
                <Text className="text-green-700 font-bold mb-2">
                  ✓ Cliente e veículo identificados
                </Text>
                <Text>Cliente: {clienteEncontrado.nome}</Text>
                <Text>
                  Veículo: {veiculoEncontrado.marca} {veiculoEncontrado.modelo}
                </Text>
                <Text>Placa: {veiculoEncontrado.placa}</Text>
                <Text>Ano: {veiculoEncontrado.ano}</Text>
              </View>
            )}

          {/* Os IDs ficam ocultos tanto no cadastro quanto na edição de ordens. */}
          {secoes[tipo].campos
            .filter(([chave]) =>
              !(tipo === 'ordens-servico' &&
                (chave === 'clienteId' || chave === 'veiculoId'))
            )
            .map(([chave, rotulo]) => (
              <View key={chave} className="mb-4">
                <Text className="text-slate-700 font-semibold mb-2">
                  {rotulo}
                </Text>

                <TextInput
                  className="bg-white border border-slate-300 rounded-xl px-4 py-4 text-slate-900"
                  placeholder={rotulo}
                  placeholderTextColor="#94a3b8"
                  value={valores[chave] || ''}
                  onChangeText={t =>
                    setValores(v => ({ ...v, [chave]: t }))
                  }
                  autoCapitalize={chave === 'email' ? 'none' : 'sentences'}
                />
              </View>
            ))}

          {!!erro && (
            <Text className="text-red-600 mb-4">{erro}</Text>
          )}

          <Pressable
            onPress={salvar}
            disabled={salvando}
            className="bg-amber-500 rounded-xl p-4 mb-12"
          >
            {salvando ? <ActivityIndicator /> : (
              <Text className="text-center text-slate-950 font-extrabold">
                Salvar
              </Text>
            )}
          </Pressable>
        </>
      )}
    </ScrollView>
  );
}
