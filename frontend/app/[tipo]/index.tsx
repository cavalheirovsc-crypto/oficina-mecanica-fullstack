
import { useCallback, useState } from 'react';
import {
  View, Text, TextInput, FlatList,
  Pressable, ActivityIndicator
} from 'react-native';
import {
  Link, Stack, useFocusEffect, useLocalSearchParams
} from 'expo-router';
import { api, Registro } from '../../src/api';
import { secoes, valido, resumo } from '../../src/config';

export default function Lista() {
  const { tipo } = useLocalSearchParams<{ tipo: string }>();

  // Guarda os registros e o texto pesquisado.
  const [itens, setItens] = useState<Registro[]>([]);
  const [busca, setBusca] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(true);

  // Atualiza a lista sempre que a tela é aberta.
  useFocusEffect(
    useCallback(() => {
      if (!valido(tipo)) return;

      let ativo = true;
      setCarregando(true);
      setErro('');

      api('/' + tipo)
        .then(dados => {
          if (ativo) setItens(dados);
        })
        .catch(e => {
          if (ativo) setErro(e.message);
        })
        .finally(() => {
          if (ativo) setCarregando(false);
        });

      return () => { ativo = false; };
    }, [tipo])
  );

  if (!valido(tipo)) return <Text>Seção inválida.</Text>;

  // Filtra clientes pelo nome, e-mail ou telefone.
  const itensFiltrados = tipo === 'clientes'
    ? itens.filter(item => {
        const pesquisa = busca.trim().toLowerCase();

        return (
          String(item.nome ?? '').toLowerCase().includes(pesquisa) ||
          String(item.email ?? '').toLowerCase().includes(pesquisa) ||
          String(item.telefone ?? '').toLowerCase().includes(pesquisa)
        );
      })
    : itens;

  return (
    <View className="flex-1 px-5 pt-6">
      <Stack.Screen options={{ title: secoes[tipo].titulo }} />

      {/* Pesquisa exibida somente na tela Clientes. */}
      {tipo === 'clientes' && (
        <View className="mb-4">
          <Text className="text-slate-700 font-semibold mb-2">
            Buscar cliente
          </Text>

          <TextInput
            className="bg-white border border-slate-300 rounded-xl px-4 py-4 text-slate-900"
            placeholder="Digite nome, e-mail ou telefone"
            placeholderTextColor="#94a3b8"
            value={busca}
            onChangeText={setBusca}
            autoCapitalize="none"
          />
        </View>
      )}

      {/* Botão para cadastrar novos registros. */}
      <Link
        href={{ pathname: '/[tipo]/novo', params: { tipo } }}
        asChild
      >
        <Pressable className="bg-amber-500 p-4 rounded-xl mb-5">
          <Text className="text-slate-950 text-center font-extrabold">
            + Cadastrar {secoes[tipo].singular.toLowerCase()}
          </Text>
        </Pressable>
      </Link>

      {/* Lista de registros, com filtro aplicado aos clientes. */}
      {carregando ? (
        <ActivityIndicator />
      ) : erro ? (
        <Text className="text-red-600">
          {erro}. Confira a API_URL e se o backend está ligado.
        </Text>
      ) : (
        <FlatList
          data={itensFiltrados}
          keyExtractor={item => String(item.id)}
          keyboardShouldPersistTaps="handled"
          ListEmptyComponent={
            <Text className="text-slate-500 text-center mt-12">
              {tipo === 'clientes' && busca.trim()
                ? 'Nenhum cliente encontrado.'
                : 'Nenhum registro cadastrado ainda.'}
            </Text>
          }
          renderItem={({ item }) => (
            <Link
              href={{
                pathname: '/[tipo]/[id]',
                params: { tipo, id: String(item.id) }
              }}
              asChild
            >
              <Pressable className="bg-white rounded-xl p-5 mb-3 border border-slate-200">
                <Text className="text-slate-900 font-bold text-lg">
                  {resumo(tipo, item)}
                </Text>

                <Text className="text-slate-500 mt-1">
                  {tipo === 'clientes'
                    ? item.email
                    : tipo === 'veiculos'
                    ? item.placa
                    : item.status}
                </Text>

                <Text className="text-amber-700 font-semibold mt-3">
                  Consultar detalhes →
                </Text>
              </Pressable>
            </Link>
          )}
        />
      )}
    </View>
  );
}
