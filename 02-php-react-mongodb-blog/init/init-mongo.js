// Script di inizializzazione MongoDB
// Crea database, utente e dati di esempio

db = db.getSiblingDB('blog_db');

// Crea utente per l'applicazione
db.createUser({
  user: 'blog_user',
  pwd: 'blog_pass',
  roles: [
    {
      role: 'readWrite',
      db: 'blog_db',
    },
  ],
});

print('✅ Utente blog_user creato');

// Inserisci utenti di esempio
// Password per tutti: "password123" (hashata con bcrypt)
db.users.insertMany([
  {
    _id: ObjectId('65a1b2c3d4e5f6a7b8c9d0e1'),
    email: 'autore@blog.it',
    password_hash: '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    nome: 'Marco Autore',
    bio: 'Scrittore appassionato di tecnologia e programmazione',
    avatar: 'https://i.pravatar.cc/150?img=12',
    created_at: new Date('2024-01-01'),
  },
  {
    _id: ObjectId('65a1b2c3d4e5f6a7b8c9d0e2'),
    email: 'giulia@blog.it',
    password_hash: '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    nome: 'Giulia Scrittrice',
    bio: 'Developer full-stack e tech blogger',
    avatar: 'https://i.pravatar.cc/150?img=45',
    created_at: new Date('2024-01-05'),
  },
  {
    _id: ObjectId('65a1b2c3d4e5f6a7b8c9d0e3'),
    email: 'luca@blog.it',
    password_hash: '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    nome: 'Luca Lettore',
    bio: 'Appassionato lettore e commentatore',
    avatar: 'https://i.pravatar.cc/150?img=33',
    created_at: new Date('2024-01-10'),
  },
]);

print('✅ 3 utenti inseriti');

// Inserisci articoli di esempio
db.posts.insertMany([
  {
    _id: ObjectId('65a1b2c3d4e5f6a7b8c9d1a1'),
    titolo: 'Introduzione a Docker per Principianti',
    contenuto: `Docker è una piattaforma che permette di creare, distribuire ed eseguire applicazioni in container.

## Cos'è un Container?

Un container è un'unità software standardizzata che include:
- Il codice dell'applicazione
- Le dipendenze necessarie
- Le configurazioni di runtime

## Vantaggi di Docker

- **Portabilità**: funziona ovunque
- **Isolamento**: ogni container è indipendente
- **Efficienza**: leggero rispetto alle VM

Inizia con \`docker run hello-world\` e scopri il mondo dei container!`,
    autore_id: ObjectId('65a1b2c3d4e5f6a7b8c9d0e1'),
    autore_nome: 'Marco Autore',
    autore_avatar: 'https://i.pravatar.cc/150?img=12',
    categoria: 'DevOps',
    tags: ['docker', 'containers', 'tutorial'],
    likes: 15,
    liked_by: [],
    created_at: new Date('2024-01-15T10:30:00Z'),
    updated_at: new Date('2024-01-15T10:30:00Z'),
  },
  {
    _id: ObjectId('65a1b2c3d4e5f6a7b8c9d1a2'),
    titolo: 'React Hooks: useState e useEffect Spiegati',
    contenuto: `React Hooks hanno rivoluzionato il modo di scrivere componenti.

## useState

\`\`\`javascript
const [count, setCount] = useState(0);
\`\`\`

Permette di gestire lo stato nei functional components.

## useEffect

\`\`\`javascript
useEffect(() => {
  document.title = \`Count: \${count}\`;
}, [count]);
\`\`\`

Gestisce side effects come chiamate API e manipolazione DOM.

## Conclusione

Gli Hooks rendono il codice più leggibile e riutilizzabile!`,
    autore_id: ObjectId('65a1b2c3d4e5f6a7b8c9d0e2'),
    autore_nome: 'Giulia Scrittrice',
    autore_avatar: 'https://i.pravatar.cc/150?img=45',
    categoria: 'Frontend',
    tags: ['react', 'javascript', 'hooks'],
    likes: 23,
    liked_by: [],
    created_at: new Date('2024-01-18T14:20:00Z'),
    updated_at: new Date('2024-01-18T14:20:00Z'),
  },
  {
    _id: ObjectId('65a1b2c3d4e5f6a7b8c9d1a3'),
    titolo: 'MongoDB vs MySQL: Quale Scegliere?',
    contenuto: `La scelta tra MongoDB e MySQL dipende dalle tue esigenze.

## MongoDB (NoSQL)

**Pro:**
- Flessibilità dello schema
- Ottimo per dati non strutturati
- Scalabilità orizzontale

**Contro:**
- Meno maturo per transazioni complesse
- Consuma più memoria

## MySQL (SQL)

**Pro:**
- ACID compliant
- Ottimo per relazioni complesse
- Ampiamente supportato

**Contro:**
- Schema rigido
- Scalabilità verticale

## Quando usare cosa?

- **MongoDB**: social media, cataloghi, real-time
- **MySQL**: e-commerce, banking, ERP

Non esiste una scelta migliore in assoluto, dipende dal progetto!`,
    autore_id: ObjectId('65a1b2c3d4e5f6a7b8c9d0e1'),
    autore_nome: 'Marco Autore',
    autore_avatar: 'https://i.pravatar.cc/150?img=12',
    categoria: 'Database',
    tags: ['mongodb', 'mysql', 'database'],
    likes: 31,
    liked_by: [],
    created_at: new Date('2024-01-20T09:15:00Z'),
    updated_at: new Date('2024-01-20T09:15:00Z'),
  },
  {
    _id: ObjectId('65a1b2c3d4e5f6a7b8c9d1a4'),
    titolo: 'REST API Best Practices 2024',
    contenuto: `Costruire buone API REST richiede attenzione ai dettagli.

## Principi Fondamentali

1. **Usa i verbi HTTP correttamente**
   - GET: lettura
   - POST: creazione
   - PUT: aggiornamento completo
   - PATCH: aggiornamento parziale
   - DELETE: eliminazione

2. **Nomina le risorse al plurale**
   - ✅ \`/api/users/123\`
   - ❌ \`/api/user/123\`

3. **Usa status code appropriati**
   - 200: OK
   - 201: Created
   - 400: Bad Request
   - 401: Unauthorized
   - 404: Not Found
   - 500: Server Error

4. **Versionamento**
   - \`/api/v1/users\`
   - \`/api/v2/users\`

5. **Paginazione**
   - \`/api/posts?page=2&limit=10\`

## Sicurezza

- Usa HTTPS sempre
- Implementa rate limiting
- Valida tutti gli input
- Usa JWT o OAuth2

Seguendo queste pratiche creerai API robuste e facili da usare!`,
    autore_id: ObjectId('65a1b2c3d4e5f6a7b8c9d0e2'),
    autore_nome: 'Giulia Scrittrice',
    autore_avatar: 'https://i.pravatar.cc/150?img=45',
    categoria: 'Backend',
    tags: ['api', 'rest', 'best-practices'],
    likes: 42,
    liked_by: [],
    created_at: new Date('2024-01-22T16:45:00Z'),
    updated_at: new Date('2024-01-22T16:45:00Z'),
  },
]);

print('✅ 4 articoli inseriti');

// Inserisci commenti di esempio
db.comments.insertMany([
  {
    post_id: ObjectId('65a1b2c3d4e5f6a7b8c9d1a1'),
    autore_id: ObjectId('65a1b2c3d4e5f6a7b8c9d0e3'),
    autore_nome: 'Luca Lettore',
    autore_avatar: 'https://i.pravatar.cc/150?img=33',
    testo: 'Ottimo articolo! Docker è davvero potente una volta compreso.',
    created_at: new Date('2024-01-15T12:00:00Z'),
  },
  {
    post_id: ObjectId('65a1b2c3d4e5f6a7b8c9d1a1'),
    autore_id: ObjectId('65a1b2c3d4e5f6a7b8c9d0e2'),
    autore_nome: 'Giulia Scrittrice',
    autore_avatar: 'https://i.pravatar.cc/150?img=45',
    testo: 'Spiegazione molto chiara per i principianti. Consiglio anche di guardare Docker Compose!',
    created_at: new Date('2024-01-15T14:30:00Z'),
  },
  {
    post_id: ObjectId('65a1b2c3d4e5f6a7b8c9d1a2'),
    autore_id: ObjectId('65a1b2c3d4e5f6a7b8c9d0e3'),
    autore_nome: 'Luca Lettore',
    autore_avatar: 'https://i.pravatar.cc/150?img=33',
    testo: 'Gli hooks hanno reso React molto più semplice da imparare!',
    created_at: new Date('2024-01-18T15:00:00Z'),
  },
  {
    post_id: ObjectId('65a1b2c3d4e5f6a7b8c9d1a3'),
    autore_id: ObjectId('65a1b2c3d4e5f6a7b8c9d0e2'),
    autore_nome: 'Giulia Scrittrice',
    autore_avatar: 'https://i.pravatar.cc/150?img=45',
    testo: 'Comparazione molto equilibrata. Io uso MongoDB per progetti dove lo schema evolve spesso.',
    created_at: new Date('2024-01-20T11:00:00Z'),
  },
  {
    post_id: ObjectId('65a1b2c3d4e5f6a7b8c9d1a4'),
    autore_id: ObjectId('65a1b2c3d4e5f6a7b8c9d0e1'),
    autore_nome: 'Marco Autore',
    autore_avatar: 'https://i.pravatar.cc/150?img=12',
    testo: 'Aggiungo: documentate sempre le vostre API con Swagger o OpenAPI!',
    created_at: new Date('2024-01-22T17:30:00Z'),
  },
]);

print('✅ 5 commenti inseriti');

// Crea indici per ottimizzare le query
db.users.createIndex({ email: 1 }, { unique: true });
db.posts.createIndex({ autore_id: 1 });
db.posts.createIndex({ created_at: -1 });
db.posts.createIndex({ categoria: 1 });
db.posts.createIndex({ tags: 1 });
db.comments.createIndex({ post_id: 1 });
db.comments.createIndex({ autore_id: 1 });

print('✅ Indici creati');

print('🎉 Inizializzazione MongoDB completata!');
