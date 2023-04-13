import { exec } from 'child_process';

// Run the crawler.

exec('pip install -r ./requirements.txt', (err, stdout, stderr) => {
  if (err) {
    console.error(`Erro ao instalar as dependências do Python: ${err}`);
    return;
  }
  console.log(`Dependências do Python instaladas com sucesso: ${stdout}`);
});

exec('python ./services/crawler.py', (error, stdout, stderr) => {
  if (error) {
    console.error(`Erro ao executar o script Python: ${error}`);
    return;
  }
  console.log(`Saída do script Python: ${stdout}`);
});
