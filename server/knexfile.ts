const knexConfig = {
  development: {
    client: 'pg',
    connection: {
      host: 'db',
      port: 5432,
      user: 'borys',
      password: 'password',
      database: 'courses_side',
    },
  },
};

export default knexConfig;
