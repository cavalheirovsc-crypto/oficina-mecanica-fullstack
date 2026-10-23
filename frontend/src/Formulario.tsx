import { useEffect, useState } from 'react';
import { View, Text, TextInput, ScrollView, Pressable, Alert, ActivityIndicator } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { api } from './api';
import { secoes, Tipo } from './config';
export default function Formulario({tipo,id}:{tipo:Tipo;id?:string}) {
 const router=useRouter(); const [valores,setValores]=useState<Record<string,string>>({}); const [salvando,setSalvando]=useState(false); const [erro,setErro]=useState('');
 useEffect(()=>{if(id)api(`/${tipo}/${id}`).then(x=>setValores(Object.fromEntries(Object.entries(x).map(([k,v])=>[k,String(v ?? '')])))).catch(e=>setErro(e.message));},[tipo,id]);
 async function salvar(){setSalvando(true);setErro('');try{const dados=Object.fromEntries(secoes[tipo].campos.map(([chave])=>[chave,valores[chave]||'']));await api(id?`/${tipo}/${id}`:`/${tipo}`,id?'PUT':'POST',dados);Alert.alert('Sucesso',id?'Registro atualizado':'Registro cadastrado');router.replace({pathname:'/[tipo]',params:{tipo}});}catch(e:any){setErro(e.message);}finally{setSalvando(false);}}
 return <ScrollView className="flex-1 px-5 pt-6"><Stack.Screen options={{title:id?'Editar '+secoes[tipo].singular:'Cadastrar '+secoes[tipo].singular}} />
 <Text className="text-slate-900 text-2xl font-extrabold mb-2">{id?'Editar cadastro':'Novo cadastro'}</Text><Text className="text-slate-500 mb-6">Preencha os dados abaixo.</Text>
 {secoes[tipo].campos.map(([chave,rotulo])=><View key={chave} className="mb-4"><Text className="text-slate-700 font-semibold mb-2">{rotulo}</Text><TextInput className="bg-white border border-slate-300 rounded-xl px-4 py-4 text-slate-900" placeholder={rotulo} placeholderTextColor="#94a3b8" value={valores[chave]||''} onChangeText={t=>setValores(v=>({...v,[chave]:t}))} autoCapitalize={chave==='email'?'none':'sentences'} /></View>)}
 {!!erro&&<Text className="text-red-600 mb-4">{erro}</Text>}
 <Pressable onPress={salvar} disabled={salvando} className="bg-amber-500 rounded-xl p-4 mb-12">{salvando?<ActivityIndicator/>:<Text className="text-center text-slate-950 font-extrabold">Salvar</Text>}</Pressable></ScrollView>;
}
