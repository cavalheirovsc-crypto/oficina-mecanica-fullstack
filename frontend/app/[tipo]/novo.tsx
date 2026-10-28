
import { Text } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import Formulario from '../../src/Formulario';
import { valido } from '../../src/config';

export default function Novo() {
  // Recebe os dados enviados pela tela anterior.
  const { tipo, clienteId, veiculoId } = useLocalSearchParams<{
    tipo: string;
    clienteId?: string;
    veiculoId?: string;
  }>();

  if (!valido(tipo)) {
    return <Text>Seção inválida</Text>;
  }

  return (
    <Formulario
      tipo={tipo}
      clienteId={clienteId}
      veiculoId={tipo === 'ordens-servico' ? veiculoId : undefined}
    />
  );
}
