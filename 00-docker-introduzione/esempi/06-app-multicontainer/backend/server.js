/**
 * Backend API - Node.js + Express + MongoDB
 * Dimostra comunicazione tra container via Docker Network
 */

const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Connessione MongoDB usando il NOME del servizio
const MONGO_URL = process.env.MONGO_URL || 'mongodb://database:27017/todoapp';
const PORT = process.env.PORT || 3000;

let db;
let todosCollection;

// Connetti a MongoDB
async function connectDB() {
  try {
    const client = await MongoClient.connect(MONGO_URL);
    db = client.db();
    todosCollection = db.collection('todos');

    console.log('✅ Connesso a MongoDB usando URL:', MONGO_URL);
    console.log('📡 Il backend comunica con il database tramite nome servizio "database"');
  } catch (error) {
    console.error('❌ Errore connessione MongoDB:', error);
    process.exit(1);
  }
}

// ===== ROUTES =====

// GET / - Homepage API
app.get('/', (req, res) => {
  res.json({
    message: 'Backend API Multi-Container',
    architecture: {
      frontend: 'Nginx (localhost:8080)',
      backend: 'Node.js + Express (localhost:3000)',
      database: 'MongoDB (database:27017)'
    },
    endpoints: {
      'GET /todos': 'Lista tutti i task',
      'POST /todos': 'Crea nuovo task',
      'DELETE /todos/:id': 'Elimina task'
    }
  });
});

// GET /todos - Lista tutti i task
app.get('/todos', async (req, res) => {
  try {
    const todos = await todosCollection.find({}).toArray();
    res.json({
      todos,
      count: todos.length,
      message: 'Dati caricati da MongoDB'
    });
  } catch (error) {
    console.error('Errore GET /todos:', error);
    res.status(500).json({ error: 'Errore nel recupero dei task' });
  }
});

// POST /todos - Crea nuovo task
app.post('/todos', async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || text.trim() === '') {
      return res.status(400).json({ error: 'Il testo è obbligatorio' });
    }

    const result = await todosCollection.insertOne({
      text: text.trim(),
      completed: false,
      createdAt: new Date()
    });

    const newTodo = await todosCollection.findOne({ _id: result.insertedId });

    console.log('✅ Nuovo task salvato in MongoDB:', newTodo);

    res.status(201).json({
      message: 'Task creato',
      todo: newTodo
    });
  } catch (error) {
    console.error('Errore POST /todos:', error);
    res.status(500).json({ error: 'Errore nella creazione del task' });
  }
});

// DELETE /todos/:id - Elimina task
app.delete('/todos/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'ID non valido' });
    }

    const result = await todosCollection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Task non trovato' });
    }

    console.log('✅ Task eliminato da MongoDB:', id);

    res.json({ message: 'Task eliminato' });
  } catch (error) {
    console.error('Errore DELETE /todos:', error);
    res.status(500).json({ error: 'Errore nell\'eliminazione del task' });
  }
});

// Avvia server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Backend API avviato su porta ${PORT}`);
    console.log(`🔗 Frontend può chiamare: http://localhost:${PORT}`);
  });
});

// Gestione shutdown
process.on('SIGTERM', () => {
  console.log('Chiusura server...');
  process.exit(0);
});
