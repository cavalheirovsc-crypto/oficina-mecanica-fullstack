import { Text } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import Formulario from '../../src/Formulario';
import { valido } from '../../src/config';
export default function Novo(){const {tipo}=useLocalSearchParams<{tipo:string}>();return valido(tipo)?<Formulario tipo={tipo}/>:<Text>Seção inválida</Text>}
