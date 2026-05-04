module.exports = {
  apps: [
    {
      name: "suivi-sportif-api",
      script: "dist/server.js",
      instances: 1,
      exec_mode: "fork",
      watch: false,
      env: {
        NODE_ENV: "production",
      },
    },
  ],

  deploy: {
    production: {
      user: "SSH_USERNAME",
      host: "SSH_HOSTMACHINE",
      ref: "origin/main",
      repo: "GIT_REPOSITORY",
      path: "DESTINATION_PATH",
      "pre-deploy-local": "",
      "post-deploy":
        "npm install && npm run build -w server && pm2 reload server/ecosystem.config.cjs --env production",
      "pre-setup": "",
    },
  },
};
