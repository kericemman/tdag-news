module.exports = {
  apps: [
    {
      name: "tdag-news-web",
      script: "node_modules/next/dist/bin/next",
      args: "start",
      cwd: __dirname,
      env: { NODE_ENV: "production", PORT: "3000" },
    },
    {
      name: "tdag-news-worker",
      script: "node_modules/tsx/dist/cli.mjs",
      args: "src/worker/index.ts",
      cwd: __dirname,
      env: { NODE_ENV: "production" },
    },
  ],
};
