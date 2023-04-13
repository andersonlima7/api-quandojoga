import { spawn } from 'child_process';

// Run the crawler.
const pythonProcess = spawn('python', ['./services/crawler.py']);

pythonProcess.stdout.on('data', data => {
  console.log(`stdout: ${data}`);
});

pythonProcess.stderr.on('data', data => {
  console.error(`stderr: ${data}`);
});

pythonProcess.on('close', code => {
  console.log(`child process exited with code ${code}`);
});
