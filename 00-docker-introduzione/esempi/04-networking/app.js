/**
 * Esempio Networking Docker
 * App Node.js che comunica con Redis usando il nome del container
 */

const http = require('http');
const redis = require('redis');

// Connessione a Redis usando il NOME del servizio come hostname
// Non serve sapere l'IP! Docker risolve automaticamente "redis" → IP del container
const redisClient = redis.createClient({
  socket: {
    host: process.env.REDIS_HOST || 'redis',
    port: process.env.REDIS_PORT || 6379
  }
});

// Connetti a Redis
redisClient.connect().then(() => {
  console.log('✅ Connesso a Redis usando hostname:', process.env.REDIS_HOST || 'redis');
}).catch(err => {
  console.error('❌ Errore connessione Redis:', err);
});

// Server HTTP
const server = http.createServer(async (req, res) => {
  res.setHeader('Content-Type', 'application/json');

  const url = new URL(req.url, `http://${req.headers.host}`);
  const path = url.pathname.split('/').filter(Boolean);

  try {
    // GET /set/:key/:value - Salva valore in Redis
    if (path[0] === 'set' && path[1] && path[2]) {
      await redisClient.set(path[1], path[2]);
      res.writeHead(200);
      res.end(JSON.stringify({
        success: true,
        message: `Salvato: ${path[1]} = ${path[2]}`
      }));
    }

    // GET /get/:key - Leggi valore da Redis
    else if (path[0] === 'get' && path[1]) {
      const value = await redisClient.get(path[1]);
      res.writeHead(200);
      res.end(JSON.stringify({
        key: path[1],
        value: value || null
      }));
    }

    // GET /stats - Statistiche Redis
    else if (path[0] === 'stats') {
      const keys = await redisClient.keys('*');
      const info = await redisClient.info('server');

      res.writeHead(200);
      res.end(JSON.stringify({
        total_keys: keys.length,
        keys: keys,
        redis_info: info.split('\n').slice(0, 5).join('\n')
      }));
    }

    // Homepage
    else {
      res.writeHead(200);
      res.end(JSON.stringify({
        message: 'Docker Networking Example - App Node.js + Redis',
        endpoints: {
          set: '/set/:key/:value',
          get: '/get/:key',
          stats: '/stats'
        },
        example: {
          'Salva dato': 'curl http://localhost:3000/set/nome/Mario',
          'Leggi dato': 'curl http://localhost:3000/get/nome',
          'Statistiche': 'curl http://localhost:3000/stats'
        }
      }, null, 2));
    }

  } catch (error) {
    res.writeHead(500);
    res.end(JSON.stringify({ error: error.message }));
  }
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`🚀 Server avviato su porta ${PORT}`);
  console.log(`📡 Networking: L'app Node.js comunica con Redis tramite nome "redis"`);
  console.log(`🔗 Prova: curl http://localhost:3000`);
});

// Gestione errori
redisClient.on('error', (err) => {
  console.error('Redis Error:', err);
});

process.on('SIGTERM', async () => {
  console.log('Chiusura connessione Redis...');
  await redisClient.quit();
  process.exit(0);
});
