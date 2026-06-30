module.exports = {
  apps: [
    {
      name: "date-maple-api",
      script: "./server.js",
      cwd: "/opt/Date_Maple_Catering_Service/backend",

      instances: 1,
      exec_mode: "fork",

      watch: false,
      autorestart: true,
      max_memory_restart: "500M",

      env: {
        NODE_ENV: "production",
        PORT: 5000
      }
    }
  ]
};