const { execSync } = require('child_process');
const os = require('os');

if (os.platform() !== 'win32') {
  execSync('chmod -R 755 ./bin', { stdio: 'inherit' });
}
