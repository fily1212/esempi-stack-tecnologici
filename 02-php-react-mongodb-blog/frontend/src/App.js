import React, { useState, useEffect, createContext, useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8002/api';

// Context per autenticazione
const AuthContext = createContext();

const useAuth = () => useContext(AuthContext);

// Provider autenticazione
function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    if (token) {
      const userData = localStorage.getItem('user');
      if (userData) setUser(JSON.parse(userData));
    }
  }, [token]);

  const login = (token, userData) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setToken(token);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Navbar Component
function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="navbar">
      <div className="container navbar-content">
        <h1 onClick={() => navigate('/')}>📝 Blog</h1>
        <div className="navbar-links">
          {user ? (
            <>
              <span>Ciao, {user.nome}!</span>
              <button className="btn btn-primary" onClick={() => navigate('/new-post')}>
                Nuovo Post
              </button>
              <button className="btn btn-outline" onClick={logout}>Esci</button>
            </>
          ) : (
            <>
              <button className="btn btn-outline" onClick={() => navigate('/login')}>Login</button>
              <button className="btn btn-primary" onClick={() => navigate('/register')}>Registrati</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// Login Component
function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const res = await fetch(`${API_URL}/auth.php?action=login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (res.ok) {
        login(data.token, data.user);
        navigate('/');
      } else {
        setError(data.error || 'Errore durante il login');
      }
    } catch (err) {
      setError('Errore di connessione');
    }
  };

  return (
    <div className="form-container">
      <h2>Login</h2>
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div className="form-group">
          <label>Password</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        <button type="submit" className="btn btn-primary">Accedi</button>
      </form>
      <p style={{marginTop: '1rem'}}>Account demo: autore@blog.it / password123</p>
    </div>
  );
}

// Register Component
function Register() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [bio, setBio] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const res = await fetch(`${API_URL}/auth.php?action=register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, email, password, bio })
      });

      const data = await res.json();

      if (res.ok) {
        login(data.token, data.user);
        navigate('/');
      } else {
        setError(data.error || 'Errore durante la registrazione');
      }
    } catch (err) {
      setError('Errore di connessione');
    }
  };

  return (
    <div className="form-container">
      <h2>Registrati</h2>
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Nome</label>
          <input value={nome} onChange={(e) => setNome(e.target.value)} required />
        </div>
        <div className="form-group">
          <label>Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div className="form-group">
          <label>Password</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
        </div>
        <div className="form-group">
          <label>Bio (opzionale)</label>
          <input value={bio} onChange={(e) => setBio(e.target.value)} />
        </div>
        <button type="submit" className="btn btn-primary">Registrati</button>
      </form>
    </div>
  );
}

// Posts List Component
function PostsList() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${API_URL}/posts.php`)
      .then(res => res.json())
      .then(data => {
        setPosts(data.posts || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading">Caricamento...</div>;

  return (
    <div className="container">
      <h2 style={{marginTop: '2rem'}}>Ultimi Articoli</h2>
      <div className="posts-grid">
        {posts.map(post => (
          <div key={post.id} className="post-card" onClick={() => navigate(`/post/${post.id}`)}>
            <div className="post-header">
              <img src={post.autore_avatar} alt={post.autore_nome} className="avatar" />
              <div>
                <strong>{post.autore_nome}</strong>
                <div style={{fontSize: '0.9rem', color: '#666'}}>
                  {new Date(post.created_at.$date || post.created_at).toLocaleDateString('it-IT')}
                </div>
              </div>
            </div>
            <h3>{post.titolo}</h3>
            <p style={{color: '#666', marginTop: '0.5rem'}}>
              {post.contenuto.substring(0, 150)}...
            </p>
            <div className="post-meta">
              <span className="badge">{post.categoria}</span>
              <span>❤️ {post.likes}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Post Detail Component
function PostDetail() {
  const { id } = useParams();
  const { token, user } = useAuth();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([
      fetch(`${API_URL}/posts.php?id=${id}`).then(r => r.json()),
      fetch(`${API_URL}/comments.php?post_id=${id}`).then(r => r.json())
    ]).then(([postData, commentsData]) => {
      setPost(postData.post);
      setComments(commentsData.comments || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id]);

  const handleLike = async () => {
    if (!token) {
      alert('Devi essere autenticato per mettere like');
      return;
    }

    try {
      const res = await fetch(`${API_URL}/posts.php?id=${id}&action=like`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        setPost(prev => ({
          ...prev,
          likes: prev.likes + (prev.liked_by?.includes(user.id) ? -1 : 1)
        }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!token) {
      alert('Devi essere autenticato');
      return;
    }

    try {
      const res = await fetch(`${API_URL}/comments.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ post_id: id, testo: newComment })
      });

      const data = await res.json();

      if (res.ok) {
        setComments([...comments, data.comment]);
        setNewComment('');
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="loading">Caricamento...</div>;
  if (!post) return <div className="error">Post non trovato</div>;

  return (
    <div className="post-detail">
      <button className="btn btn-outline" onClick={() => navigate('/')}>← Indietro</button>

      <div className="post-header" style={{marginTop: '1rem'}}>
        <img src={post.autore_avatar} alt={post.autore_nome} className="avatar" />
        <div>
          <strong>{post.autore_nome}</strong>
          <div style={{fontSize: '0.9rem', color: '#666'}}>
            {new Date(post.created_at.$date || post.created_at).toLocaleDateString('it-IT')}
          </div>
        </div>
      </div>

      <h1 style={{marginTop: '1rem'}}>{post.titolo}</h1>

      <div style={{marginTop: '1rem'}}>
        <span className="badge">{post.categoria}</span>
        <button className="btn btn-outline" style={{marginLeft: '1rem'}} onClick={handleLike}>
          ❤️ {post.likes} Like
        </button>
      </div>

      <div className="post-content">
        <ReactMarkdown>{post.contenuto}</ReactMarkdown>
      </div>

      <div className="comments-section">
        <h3>Commenti ({comments.length})</h3>

        {token && (
          <form onSubmit={handleAddComment} style={{marginTop: '1rem'}}>
            <div className="form-group">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Scrivi un commento..."
                rows={3}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary">Pubblica Commento</button>
          </form>
        )}

        <div style={{marginTop: '2rem'}}>
          {comments.map(comment => (
            <div key={comment.id} className="comment">
              <img src={comment.autore_avatar} alt={comment.autore_nome} className="avatar" />
              <div>
                <strong>{comment.autore_nome}</strong>
                <div style={{fontSize: '0.9rem', color: '#666'}}>
                  {new Date(comment.created_at.$date || comment.created_at).toLocaleDateString('it-IT')}
                </div>
                <p style={{marginTop: '0.5rem'}}>{comment.testo}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// New Post Component
function NewPost() {
  const [titolo, setTitolo] = useState('');
  const [contenuto, setContenuto] = useState('');
  const [categoria, setCategoria] = useState('Generale');
  const [error, setError] = useState('');
  const { token } = useAuth();
  const navigate = useNavigate();

  if (!token) return <Navigate to="/login" />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const res = await fetch(`${API_URL}/posts.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ titolo, contenuto, categoria })
      });

      const data = await res.json();

      if (res.ok) {
        navigate(`/post/${data.post.id}`);
      } else {
        setError(data.error || 'Errore durante la creazione del post');
      }
    } catch (err) {
      setError('Errore di connessione');
    }
  };

  return (
    <div className="form-container" style={{maxWidth: '800px'}}>
      <h2>Nuovo Articolo</h2>
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Titolo</label>
          <input value={titolo} onChange={(e) => setTitolo(e.target.value)} required />
        </div>
        <div className="form-group">
          <label>Categoria</label>
          <select value={categoria} onChange={(e) => setCategoria(e.target.value)} style={{width: '100%', padding: '0.7rem'}}>
            <option>Generale</option>
            <option>Frontend</option>
            <option>Backend</option>
            <option>DevOps</option>
            <option>Database</option>
          </select>
        </div>
        <div className="form-group">
          <label>Contenuto (Markdown supportato)</label>
          <textarea value={contenuto} onChange={(e) => setContenuto(e.target.value)} required rows={15} />
        </div>
        <button type="submit" className="btn btn-primary">Pubblica Articolo</button>
      </form>
    </div>
  );
}

// Main App
function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<PostsList />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/post/:id" element={<PostDetail />} />
          <Route path="/new-post" element={<NewPost />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
