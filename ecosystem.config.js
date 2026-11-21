module.exports = {
  apps: [
    {
      name: 'socialman',
      script: 'npm',
      args: 'start',
      cwd: '/var/www/socialman-app',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
    },
    {
      name: 'socialman-worker',
      script: 'node_modules/.bin/tsx',
      args: 'scripts/cron-worker.ts',
      cwd: '/var/www/socialman-app',
      env: {
        NODE_ENV: 'production',
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '300M',
    },
  ],
};
