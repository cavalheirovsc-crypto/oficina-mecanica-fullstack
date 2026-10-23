import { Text } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import Formulario from '../../../src/Formulario';
import { valido } from '../../../src/config';
export default function Editar(){const {tipo,id}=useLocalSearchParams<{tipo:string;id:string}>();return valido(tipo)?<Formulario tipo={tipo} id={id}/>:<Text>Seção inválida</Text>}
