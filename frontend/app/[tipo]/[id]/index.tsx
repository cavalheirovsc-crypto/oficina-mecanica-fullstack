import { useCallback, useState } from 'react';
import { View, Text, ScrollView, Pressable, Alert, ActivityIndicator, Platform } from 'react-native';
import { Link, Stack, useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { api, Registro } from '../../../src/api';
import { secoes, valido, resumo } from '../../../src/config';
export default function Detalhes(){const {tipo,id}=useLocalSearchParams<{tipo:string;id:string}>();const router=useRouter();const [item,setItem]=useState<Registro|null>(null);const [erro,setErro]=useState('');
 useFocusEffect(useCallback(()=>{if(valido(tipo))api(`/${tipo}/${id}`).then(setItem).catch(e=>setErro(e.message));},[tipo,id]));
 if(!valido(tipo))return <Text>Seção inválida</Text>;
 async function excluir() {
  try {
    await api(`/${tipo}/${id}`, 'DELETE');

    router.replace({
      pathname: '/[tipo]',
      params: { tipo }
    });

  } catch (e: any) {
    if (Platform.OS === 'web') {
      window.alert(e.message);
    } else {
      Alert.alert('Erro', e.message);
    }
  }
}

function confirmarExclusao() {
  if (Platform.OS === 'web') {
    const confirmou = window.confirm(
      'Deseja realmente excluir este registro?'
    );

    if (confirmou) {
      excluir();
    }

  } else {
    Alert.alert(
      'Excluir registro',
      'Deseja realmente excluir?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: excluir
        }
      ]
    );
  }
}
 return <ScrollView className="flex-1 px-5 pt-6"><Stack.Screen options={{title:'Consultar '+secoes[tipo].singular}} />{erro?<Text className="text-red-600">{erro}</Text>:!item?<ActivityIndicator/>:<>
 <View className="bg-white rounded-2xl p-6 border border-slate-200 mb-5"><Text className="text-3xl mb-3">{secoes[tipo].emoji}</Text><Text className="text-slate-900 text-2xl font-extrabold mb-4">{resumo(tipo,item)}</Text>{secoes[tipo].campos.map(([chave,rotulo])=><View key={chave} className="border-t border-slate-100 py-3"><Text className="text-slate-500 text-xs uppercase font-semibold">{rotulo}</Text><Text className="text-slate-900 mt-1">{String(item[chave]||'—')}</Text></View>)}<Text className="text-slate-400 text-xs mt-3">ID: {id}</Text></View>
 <Link href={{pathname:'/[tipo]/[id]/editar',params:{tipo,id}}} asChild><Pressable className="bg-slate-900 rounded-xl p-4 mb-3"><Text className="text-white text-center font-bold">Editar registro</Text></Pressable></Link>
 <Pressable
  className="border border-red-300 rounded-xl p-4 mb-10"
  onPress={confirmarExclusao}
><Text className="text-red-600 text-center font-bold">Excluir registro</Text></Pressable></>}</ScrollView>;
}
