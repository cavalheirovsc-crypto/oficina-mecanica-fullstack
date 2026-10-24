
const db = require('./db');

async function testarConexao() {
  try {
    const [resultado] = await db.query('SELECT 1 AS teste');
    console.log('Conexão com MySQL funcionando!', resultado);
  } catch (erro) {
    console.log('Erro ao conectar:', erro.message);
  } finally {
    await db.end();
  }
}

testarConexao();
