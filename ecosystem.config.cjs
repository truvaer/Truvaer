/**
 * PM2 Zero-Downtime Cluster Configuration
 * Truvaer Aviation Enterprise Platform
 * For AWS EC2 and Azure Ubuntu Virtual Machines
 *
 * Key Zero-Downtime Features:
 * - wait_ready: true -> PM2 keeps existing worker serving users until new worker calls process.send('ready')
 * - listen_timeout: 10000 -> Max 10s wait for worker initialization
 * - kill_timeout: 6000 -> Allows 6s for in-flight requests to complete before terminating old worker
 * - exec_mode: 'cluster' -> Uses CPU cores for parallel handling
 */

module.exports = {
  apps: [
    {
      name: 'truvaer-app',
      script: 'server.js',
      instances: 'max', // Utilizes all available CPU cores
      exec_mode: 'cluster',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      
      // Zero-downtime rolling reload settings
      wait_ready: true,
      listen_timeout: 10000,
      kill_timeout: 6000,
      shutdown_with_message: true,

      env: {
        NODE_ENV: 'development',
        PORT: 3000,
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      error_file: './logs/pm2-err.log',
      out_file: './logs/pm2-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
    },
  ],
};
