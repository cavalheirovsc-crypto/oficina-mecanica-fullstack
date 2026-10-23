import { View, Text, ScrollView, Pressable } from 'react-native';
import { Link, Stack } from 'expo-router';
import { secoes, Tipo } from '../src/config';
export default function Inicio() {
  return <ScrollView className="flex-1 bg-slate-100"><Stack.Screen options={{ title: 'Oficina Pro' }} />
    <View className="bg-slate-900 px-6 pt-10 pb-12"><Text className="text-amber-400 text-sm font-bold tracking-widest">PAINEL DE CONTROLE</Text><Text className="text-white text-3xl font-extrabold mt-3">Oficina Mecânica</Text><Text className="text-slate-300 mt-2">Gerencie clientes, veículos e serviços em um só lugar.</Text></View>
    <View className="px-5 -mt-6">{(Object.keys(secoes) as Tipo[]).map(tipo => <Link key={tipo} href={{ pathname: '/[tipo]', params: { tipo } }} asChild><Pressable className="bg-white rounded-2xl p-6 mb-4 border border-slate-200 shadow-sm"><Text className="text-3xl mb-2">{secoes[tipo].emoji}</Text><Text className="text-xl font-bold text-slate-900">{secoes[tipo].titulo}</Text><Text className="text-slate-500 mt-2">Abrir lista e gerenciar cadastros →</Text></Pressable></Link>)}</View>
  </ScrollView>;
}
