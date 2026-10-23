import { useCallback, useState } from 'react';
import { View, Text, FlatList, Pressable, ActivityIndicator, Alert } from 'react-native';
import { Link, Stack, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { api, Registro } from '../../src/api';
import { secoes, valido, resumo } from '../../src/config';
export default function Lista() {
 const { tipo } = useLocalSearchParams<{ tipo: string }>();
 const [itens,setItens] = useState<Registro[]>([]); const [erro,setErro] = useState(''); const [carregando,setCarregando] = useState(true);
 useFocusEffect(useCallback(() => { if (!valido(tipo)) return; let ativo=true; setCarregando(true); api('/'+tipo).then(x=>{if(ativo)setItens(x);}).catch(e=>{if(ativo)setErro(e.message);}).finally(()=>{if(ativo)setCarregando(false);}); return ()=>{ativo=false;}; },[tipo]));
 if (!valido(tipo)) return <Text>Seção inválida.</Text>;
 return <View className="flex-1 px-5 pt-6"><Stack.Screen options={{ title: secoes[tipo].titulo }} />
 <Link href={{pathname:'/[tipo]/novo',params:{tipo}}} asChild><Pressable className="bg-amber-500 p-4 rounded-xl mb-5"><Text className="text-slate-950 text-center font-extrabold">+ Cadastrar {secoes[tipo].singular.toLowerCase()}</Text></Pressable></Link>
 {carregando ? <ActivityIndicator /> : erro ? <Text className="text-red-600">{erro}. Confira a API_URL e se o backend está ligado.</Text> :
 <FlatList
  data={itens}
  keyExtractor={(item) => item.id}
  ListEmptyComponent={
    <Text className="text-slate-500 text-center mt-12">
      Nenhum registro cadastrado ainda.
    </Text>
  }
  renderItem={({ item }) => (
    <Link
      href={{
        pathname: '/[tipo]/[id]',
        params: {
          tipo: tipo,
          id: item.id
        }
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
}
</View>;
}