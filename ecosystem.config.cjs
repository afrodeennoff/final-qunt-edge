module.exports = {
  apps: [
    {
      name: "qunt-edge",
      cwd: process.env.APP_DIR || __dirname,
      script: "bun",
      args: "run start",
      interpreter: "none",
      exec_mode: "fork",
      instances: 1,
      autorestart: true,
      max_restarts: 10,
      restart_delay: 3000,
      watch: false,
      env: {
        NODE_ENV: "production",
        PORT: "3000",
        HOSTNAME: "0.0.0.0",
      },
    },
  ],
};
