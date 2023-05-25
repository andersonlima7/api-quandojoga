import { exec } from 'child_process';

exec('yarn populate', (error, stdout, stderr) => {
  if (error) {
    console.error(`Erro ao executar o comando: ${error.message}`);
    return;
  }
  if (stderr) {
    console.error(`Erro de saída do comando: ${stderr}`);
    return;
  }
  console.log(`Saída do comando: ${stdout}`);
});
