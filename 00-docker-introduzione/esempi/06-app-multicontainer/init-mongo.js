// Script di inizializzazione MongoDB
// Eseguito automaticamente al primo avvio del container

db = db.getSiblingDB('todoapp');

// Crea collection
db.createCollection('todos');

// Inserisci task di esempio
db.todos.insertMany([
  {
    text: 'Benvenuto nel Docker Multi-Container Tutorial!',
    completed: false,
    createdAt: new Date()
  },
  {
    text: 'Questo task è stato creato dallo script init-mongo.js',
    completed: false,
    createdAt: new Date()
  },
  {
    text: 'Prova ad aggiungere nuovi task dal frontend',
    completed: false,
    createdAt: new Date()
  }
]);

// Crea indice per performance
db.todos.createIndex({ createdAt: -1 });

print('✅ Database todoapp inizializzato con', db.todos.countDocuments(), 'task di esempio');
