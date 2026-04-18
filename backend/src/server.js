require('dotenv').config();
const buildApp = require('./app');

const start = async () => {
  const app = await buildApp();

  try {
    const port = Number(process.env.PORT) || 4000;
    await app.listen({ port, host: '0.0.0.0' });
    console.log(`Server running on port ${port}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();