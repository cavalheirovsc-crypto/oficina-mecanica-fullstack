
import { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  Alert,
  ActivityIndicator
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { api } from './api';
import { secoes, Tipo } from './config';

// Formulário utilizado para cadastrar e editar registros.
export default function Formulario({
  tipo,
  id,
  clienteId,
  veiculoId
}: {
  tipo: Tipo;
  id?: string;
  clienteId?: string;
  veiculoId?: string;
}) {
  const router = useRouter();

  // Guarda os dados digitados e os relacionamentos.
  const [valores, setValores] = useState<Record<string, string>>(
    tipo === 'veiculos' && clienteId
      ? { cliente_id: clienteId }
      : tipo === 'ordens-servico' && clienteId && veiculoId
      ? {
          clienteId: clienteId,
          veiculoId: veiculoId
        }
      : {}
  );

  const [salvando, setSalvando] = useState(false);
  const [carregando, setCarregando] = useState(!!id);
  const [erro, setErro] = useState('');
  const [nomeProprietario, setNomeProprietario] = useState('');

  // Dados utilizados para identificar cliente e veículo.
  const [placaBusca, setPlacaBusca] = useState('');
  const [veiculoEncontrado, setVeiculoEncontrado] = useState<any>(null);
  const [clienteEncontrado, setClienteEncontrado] = useState<any>(null);

  // Identifica automaticamente o veículo selecionado
  // quando a ordem é aberta pelo perfil do cliente.
  useEffect(() => {
    if (
      tipo !== 'ordens-servico' ||
      !clienteId ||
      !veiculoId ||
      id
    ) {
      return;
    }

    let ativo = true;

    async function carregarVeiculoSelecionado() {
      setErro('');

      try {
        const [cliente, veiculo] = await Promise.all([
          api(`/clientes/${clienteId}`),
          api(`/veiculos/${veiculoId}`)
        ]);

        // Confirma que o veículo pertence ao cliente.
        if (
          String(veiculo.cliente_id ?? veiculo.clienteId) !==
          String(clienteId)
        ) {
          throw new Error(
            'Este veículo não pertence ao cliente selecionado.'
          );
        }

        if (ativo) {
          setClienteEncontrado(cliente);
          setVeiculoEncontrado(veiculo);
          setPlacaBusca(String(veiculo.placa ?? ''));

          setValores(v => ({
            ...v,
            clienteId: String(clienteId),
            veiculoId: String(veiculoId)
          }));
        }
      } catch (e: any) {
        if (ativo) {
          setValores(v => ({
            ...v,
            clienteId: '',
            veiculoId: ''
          }));

          setErro(e.message);
        }
      }
    }

    carregarVeiculoSelecionado();

    return () => {
      ativo = false;
    };
  }, [tipo, clienteId, veiculoId, id]);

  // Busca o nome do proprietário no cadastro de veículos.
  useEffect(() => {
    if (tipo !== 'veiculos' || !clienteId || id) return;

    let ativo = true;

    api(`/clientes/${clienteId}`)
      .then(cliente => {
        if (ativo) setNomeProprietario(cliente.nome);
      })
      .catch((e: any) => {
        if (ativo) setErro(e.message);
      });

    return () => {
      ativo = false;
    };
  }, [tipo, clienteId, id]);

  // Carrega os dados existentes quando estamos editando.
  useEffect(() => {
    if (!id) return;

    let ativo = true;

    async function carregar() {
      setCarregando(true);
      setErro('');

      try {
        const registro = await api(`/${tipo}/${id}`);

        const dados: Record<string, string> =
          Object.fromEntries(
            Object.entries(registro).map(([chave, valor]) => [
              chave,
              String(valor ?? '')
            ])
          );

        if (tipo === 'ordens-servico') {
          const clienteIdRegistro =
            registro.cliente_id ?? registro.clienteId;

          const veiculoIdRegistro =
            registro.veiculo_id ?? registro.veiculoId;

          dados.clienteId = String(clienteIdRegistro ?? '');
          dados.veiculoId = String(veiculoIdRegistro ?? '');

          const [cliente, veiculo] = await Promise.all([
            clienteIdRegistro
              ? api(`/clientes/${clienteIdRegistro}`)
              : Promise.resolve(null),

            veiculoIdRegistro
              ? api(`/veiculos/${veiculoIdRegistro}`)
              : Promise.resolve(null)
          ]);

          if (ativo) {
            setClienteEncontrado(cliente);
            setVeiculoEncontrado(veiculo);
            setPlacaBusca(String(veiculo?.placa ?? ''));
          }
        }

        if (ativo) {
          setValores(dados);
        }
      } catch (e: any) {
        if (ativo) setErro(e.message);
      } finally {
        if (ativo) setCarregando(false);
      }
    }

    carregar();

    return () => {
      ativo = false;
    };
  }, [tipo, id]);

  // Busca um veículo pela placa quando a ordem
  // é criada pelo menu geral de ordens de serviço.
  async function buscarPlaca() {
    setErro('');
    setVeiculoEncontrado(null);
    setClienteEncontrado(null);

    setValores(v => ({
      ...v,
      clienteId: '',
      veiculoId: ''
    }));

    try {
      const placa = placaBusca
        .trim()
        .toUpperCase()
        .replace(/[-\s]/g, '');

      if (!placa) {
        setErro('Digite a placa do veículo.');
        return;
      }

      const veiculos = await api('/veiculos');

      const encontrados = veiculos.filter((v: any) =>
        String(v.placa ?? '')
          .toUpperCase()
          .replace(/[-\s]/g, '') === placa
      );

      if (encontrados.length !== 1) {
        setErro(
          encontrados.length
            ? 'Placa duplicada. Verifique o cadastro.'
            : 'Placa não encontrada.'
        );
        return;
      }

      const veiculo = encontrados[0];

      const clienteIdEncontrado =
        veiculo.cliente_id ?? veiculo.clienteId;

      if (!clienteIdEncontrado) {
        setErro('Este veículo não possui cliente associado.');
        return;
      }

      const cliente = await api(
        `/clientes/${clienteIdEncontrado}`
      );

      setValores(v => ({
        ...v,
        clienteId: String(clienteIdEncontrado),
        veiculoId: String(veiculo.id)
      }));

      setVeiculoEncontrado(veiculo);
      setClienteEncontrado(cliente);

      Alert.alert(
        'Veículo encontrado',
        'Placa: ' + veiculo.placa
      );
    } catch (e: any) {
      setErro(e.message);
    }
  }

  // Salva os dados no backend.
  async function salvar() {
    setErro('');

    // Uma ordem precisa de cliente e veículo associados.
    if (
      tipo === 'ordens-servico' &&
      (!valores.clienteId || !valores.veiculoId)
    ) {
      setErro(
        'É necessário identificar um cliente e um veículo antes de salvar.'
      );
      return;
    }

    setSalvando(true);

    try {
      const dados = Object.fromEntries(
        secoes[tipo].campos.map(([chave]) => [
          chave,

          // Status padrão quando nenhuma opção foi selecionada.
          tipo === 'ordens-servico' && chave === 'status'
            ? (valores[chave] || 'Pendente')
            : (valores[chave] ?? '')
        ])
      );

      await api(
        id ? `/${tipo}/${id}` : `/${tipo}`,
        id ? 'PUT' : 'POST',
        dados
      );

      Alert.alert(
        'Sucesso',
        id ? 'Registro atualizado' : 'Registro cadastrado'
      );

      // Retorna ao perfil do cliente após cadastrar veículo.
      if (tipo === 'veiculos' && clienteId && !id) {
        router.replace({
          pathname: '/[tipo]/[id]',
          params: {
            tipo: 'clientes',
            id: clienteId
          }
        });
      } else {
        router.replace({
          pathname: '/[tipo]',
          params: { tipo }
        });
      }
    } catch (e: any) {
      setErro(e.message);
    } finally {
      setSalvando(false);
    }
  }

  return (
    <ScrollView className="flex-1 px-5 pt-6">
      <Stack.Screen
        options={{
          title: id
            ? 'Editar ' + secoes[tipo].singular
            : 'Cadastrar ' + secoes[tipo].singular
        }}
      />

      <Text className="text-slate-900 text-2xl font-extrabold mb-2">
        {id ? 'Editar cadastro' : 'Novo cadastro'}
      </Text>

      <Text className="text-slate-500 mb-6">
        Preencha os dados abaixo.
      </Text>

      {/* Proprietário identificado no cadastro de veículo. */}
      {tipo === 'veiculos' && clienteId && (
        <View className="bg-green-50 border border-green-300 rounded-xl p-4 mb-5">
          <Text className="text-green-700 font-bold">
            ✓ Proprietário: {nomeProprietario || 'Carregando...'}
          </Text>
        </View>
      )}

      {carregando ? (
        <ActivityIndicator />
      ) : (
        <>
          {/* Busca manual pela placa. */}
          {tipo === 'ordens-servico' && !veiculoId && (
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

          {/* Cliente e veículo identificados. */}
          {tipo === 'ordens-servico' &&
            clienteEncontrado &&
            veiculoEncontrado && (
              <View className="bg-green-50 border border-green-300 rounded-xl p-4 mb-4">
                <Text className="text-green-700 font-bold mb-2">
                  ✓ Cliente e veículo identificados
                </Text>

                <Text>
                  Cliente: {clienteEncontrado.nome}
                </Text>

                <Text>
                  Veículo: {veiculoEncontrado.marca}{' '}
                  {veiculoEncontrado.modelo}
                </Text>

                <Text>
                  Placa: {veiculoEncontrado.placa}
                </Text>

                <Text>
                  Ano: {veiculoEncontrado.ano}
                </Text>
              </View>
            )}

          {/* Cria os campos do formulário. */}
          {secoes[tipo].campos
            .filter(([chave]) =>
              !(
                tipo === 'ordens-servico' &&
                (chave === 'clienteId' || chave === 'veiculoId')
              ) &&
              !(
                tipo === 'veiculos' &&
                !!clienteId &&
                chave === 'cliente_id'
              )
            )
            .map(([chave, rotulo]) => (
              <View key={chave} className="mb-4">
                <Text className="text-slate-700 font-semibold mb-2">
                  {rotulo}
                </Text>

                {/* Seletor de status para ordens de serviço. */}
                {tipo === 'ordens-servico' && chave === 'status' ? (
                  <View className="flex-row flex-wrap gap-2">
                    {[
                      'Pendente',
                      'Em andamento',
                      'Concluída'
                    ].map(opcao => (
                      <Pressable
                        key={opcao}
                        onPress={() =>
                          setValores(v => ({
                            ...v,
                            status: opcao
                          }))
                        }
                        className={`rounded-xl px-4 py-3 border ${
                          (valores.status || 'Pendente') === opcao
                            ? 'bg-blue-600 border-blue-600'
                            : 'bg-white border-slate-300'
                        }`}
                      >
                        <Text
                          className={
                            (valores.status || 'Pendente') === opcao
                              ? 'text-white font-bold'
                              : 'text-slate-700'
                          }
                        >
                          {opcao}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                ) : (
                  <TextInput
                    className="bg-white border border-slate-300 rounded-xl px-4 py-4 text-slate-900"
                    placeholder={rotulo}
                    placeholderTextColor="#94a3b8"
                    value={valores[chave] || ''}
                    onChangeText={texto =>
                      setValores(v => ({
                        ...v,
                        [chave]: texto
                      }))
                    }
                    autoCapitalize={
                      chave === 'email' ? 'none' : 'sentences'
                    }
                  />
                )}
              </View>
            ))}

          {/* Mensagem de erro. */}
          {!!erro && (
            <Text className="text-red-600 mb-4">
              {erro}
            </Text>
          )}

          {/* Botão para salvar o cadastro. */}
          <Pressable
            onPress={salvar}
            disabled={salvando}
            className="bg-amber-500 rounded-xl p-4 mb-12"
          >
            {salvando ? (
              <ActivityIndicator />
            ) : (
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
