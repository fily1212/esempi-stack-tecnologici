import { useState, useEffect } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8003';

export default function Home() {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState('admin@secretsanta.it');
  const [password, setPassword] = useState('password123');
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
      loadEvents(savedToken);
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('token', data.access_token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setToken(data.access_token);
        setUser(data.user);
        loadEvents(data.access_token);
      } else {
        alert(data.detail || 'Errore login');
      }
    } catch (err) {
      alert('Errore connessione');
    }
  };

  const loadEvents = async (tkn) => {
    try {
      const res = await fetch(`${API_URL}/events`, {
        headers: { 'Authorization': `Bearer ${tkn}` }
      });
      const data = await res.json();
      setEvents(data.events || []);
    } catch (err) {
      console.error(err);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    setEvents([]);
  };

  if (!token) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <h1 style={styles.title}>🎅 Secret Santa Generator</h1>
          <p style={styles.subtitle}>Organizza il tuo scambio di regali!</p>
          <form onSubmit={handleLogin}>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={styles.input}
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
              required
            />
            <button type="submit" style={styles.button}>Accedi</button>
          </form>
          <p style={styles.hint}>Account demo: admin@secretsanta.it / password123</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1>🎅 Secret Santa</h1>
        <div>
          <span>Ciao, {user.nome}!</span>
          <button onClick={logout} style={{...styles.button, marginLeft: '1rem'}}>Esci</button>
        </div>
      </div>

      <div style={styles.content}>
        <h2>I Miei Eventi</h2>
        {events.length === 0 ? (
          <p style={styles.empty}>Nessun evento creato. Usa l'API per crearne uno!</p>
        ) : (
          <div style={styles.grid}>
            {events.map(event => (
              <div key={event.id} style={styles.eventCard}>
                <h3>{event.nome}</h3>
                <p>{event.descrizione}</p>
                <p><strong>Budget:</strong> €{event.budget_suggerito}</p>
                <p><strong>Data:</strong> {event.data_scambio}</p>
                <p><strong>Estratto:</strong> {event.estratto ? '✅ Sì' : '❌ No'}</p>
              </div>
            ))}
          </div>
        )}

        <div style={styles.infoBox}>
          <h3>📝 Come usare questa app:</h3>
          <ol>
            <li>Usa le API per creare eventi e aggiungere partecipanti</li>
            <li>Effettua l'estrazione Secret Santa tramite POST /events/ID/draw</li>
            <li>I partecipanti possono vedere la loro assegnazione via email</li>
          </ol>
          <p><strong>API Docs:</strong> <a href={`${API_URL}/docs`} target="_blank" rel="noopener">FastAPI Swagger UI</a></p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    padding: '2rem',
  },
  card: {
    maxWidth: '400px',
    margin: '5rem auto',
    background: 'white',
    padding: '2rem',
    borderRadius: '10px',
    boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
  },
  title: {
    textAlign: 'center',
    marginBottom: '0.5rem',
    color: '#333',
  },
  subtitle: {
    textAlign: 'center',
    color: '#666',
    marginBottom: '2rem',
  },
  input: {
    width: '100%',
    padding: '0.75rem',
    marginBottom: '1rem',
    border: '1px solid #ddd',
    borderRadius: '5px',
    fontSize: '1rem',
  },
  button: {
    width: '100%',
    padding: '0.75rem',
    background: '#667eea',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    fontSize: '1rem',
    cursor: 'pointer',
  },
  hint: {
    textAlign: 'center',
    fontSize: '0.9rem',
    color: '#666',
    marginTop: '1rem',
  },
  header: {
    background: 'white',
    padding: '1rem 2rem',
    borderRadius: '10px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2rem',
  },
  content: {
    background: 'white',
    padding: '2rem',
    borderRadius: '10px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '1rem',
    marginTop: '1rem',
  },
  eventCard: {
    border: '1px solid #ddd',
    padding: '1rem',
    borderRadius: '8px',
  },
  empty: {
    textAlign: 'center',
    color: '#999',
    padding: '2rem',
  },
  infoBox: {
    marginTop: '2rem',
    padding: '1.5rem',
    background: '#f0f9ff',
    borderRadius: '8px',
    borderLeft: '4px solid #667eea',
  },
};
