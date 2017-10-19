module.exports = {
  /**
   * Application configuration section
   * http://pm2.keymetrics.io/docs/usage/application-declaration/
   */
  apps: [

    // First application
    {
      name: 'answer-promotion-front',
      script: 'serve',
      env: {
        COMMON_VARIABLE: 'true',
        PM2_SERVE_PATH: './build',
        PM2_SERVE_PORT: 8080,
      },
      env_production: {
        NODE_ENV: 'production',
      },
    },
  ],

  /**
   * Deployment section
   * http://pm2.keymetrics.io/docs/usage/deployment/
   */
  deploy: {
    production: {
      user: 'deploy',
      host: '192.168.1.250',
      ref: 'origin/master',
      repo: 'git@gitlab.com:thesalt/answer-promotion-back.git',
      path: '/home/deploy/projects/answer-promotion-back',
      'post-deploy': 'yarn install && pm2 reload ecosystem.config.js --env production',
    },
    dev: {
      user: 'deploy',
      host: '192.168.1.250',
      ref: 'origin/master',
      repo: 'git@gitlab.com:thesalt/answer-promotion-back.git',
      path: '/home/deploy/projects/answer-promotion-back',
      'post-deploy': 'yarn install && pm2 reload ecosystem.config.js --env dev',
      env: {
        NODE_ENV: 'dev',
      },
    },
  },
};
