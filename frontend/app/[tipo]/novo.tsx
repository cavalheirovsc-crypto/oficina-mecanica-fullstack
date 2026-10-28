
import { Text } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import Formulario from '../../src/Formulario';
import { valido } from '../../src/config';

export default function Novo() {
  // Recebe o tipo de cadastro e o cliente selecionado.
  const { tipo, clienteId } = useLocalSearchParams<{
    tipo: string;
    clienteId?: string;
  }>();

  if (!valido(tipo)) return <Text>Seção inválida</Text>;

  // Envia o cliente ao formulário de veículo.
  return (
    <Formulario
      tipo={tipo}
      clienteId={tipo === 'veiculos' ? clienteId : undefined}
    />
  );
}
