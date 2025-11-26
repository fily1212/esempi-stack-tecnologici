# 04 - E-commerce Giochi Indie 🎮

**Stack:** Java Spring Boot 3 + Vue 3 + MySQL

Piattaforma e-commerce per la vendita di giochi indie con gestione catalogo, carrello e admin panel.

---

## 🎯 Caratteristiche

- ✅ **Autenticazione JWT** - Login con ruoli (USER/ADMIN)
- ✅ **Catalogo Giochi** - Browse, ricerca e filtri
- ✅ **Dettaglio Prodotto** - Scheda completa con immagini
- ✅ **Carrello** - Gestione articoli
- ✅ **Checkout** - Creazione ordini
- ✅ **Admin Panel** - CRUD giochi (solo ADMIN)
- ✅ **Gestione Ordini** - Storico acquisti

---

## 📚 Stack Tecnologico

### Backend
- **Java 17** - Linguaggio
- **Spring Boot 3.2** - Framework
- **Spring Security** - Autenticazione e autorizzazione
- **Spring Data JPA** - ORM
- **JWT (jjwt)** - Token autenticazione
- **MySQL 8.0** - Database
- **Maven** - Build tool

### Frontend
- **Vue 3** - Framework reattivo
- **Vue Router** - Navigazione SPA
- **Pinia** - State management
- **Axios** - HTTP client
- **Vite** - Build tool veloce

### DevOps
- **Docker** - Containerizzazione
- **Docker Compose** - Orchestrazione

---

## 🚀 Avvio Rapido

```bash
cd 04-java-vue-mysql-ecommerce

docker-compose up --build
```

- **Frontend:** http://localhost:3004
- **API Backend:** http://localhost:8004
- **MySQL:** localhost:3309

### Credenziali Demo
| Email | Password | Ruolo |
|-------|----------|-------|
| `user@shop.it` | `password123` | USER |
| `admin@shop.it` | `password123` | ADMIN |

---

## 📁 Struttura Progetto

```
04-java-vue-mysql-ecommerce/
├── backend/
│   ├── Dockerfile
│   ├── pom.xml                         # Maven dependencies
│   └── src/main/
│       ├── java/com/example/shop/
│       │   ├── ShopApplication.java    # Main class
│       │   ├── controller/             # REST Controllers
│       │   │   ├── AuthController.java
│       │   │   ├── GameController.java
│       │   │   └── OrderController.java
│       │   ├── model/                  # JPA Entities
│       │   │   ├── User.java
│       │   │   ├── Game.java
│       │   │   ├── Order.java
│       │   │   └── OrderItem.java
│       │   ├── repository/             # JPA Repositories
│       │   │   ├── UserRepository.java
│       │   │   ├── GameRepository.java
│       │   │   └── OrderRepository.java
│       │   ├── service/                # Business Logic
│       │   │   ├── AuthService.java
│       │   │   ├── GameService.java
│       │   │   └── OrderService.java
│       │   └── security/               # JWT & Security Config
│       │       ├── JwtUtil.java
│       │       ├── JwtAuthFilter.java
│       │       └── SecurityConfig.java
│       └── resources/
│           └── application.properties  # Spring config
├── frontend/
│   ├── Dockerfile
│   ├── package.json
│   ├── vite.config.js
│   └── src/
│       ├── main.js                     # Entry point
│       ├── App.vue                     # Root component
│       ├── router/
│       │   └── index.js                # Vue Router config
│       ├── stores/                     # Pinia stores
│       │   ├── auth.js
│       │   └── cart.js
│       ├── services/
│       │   └── api.js                  # Axios instance
│       ├── views/                      # Page components
│       │   ├── Home.vue
│       │   ├── GameDetail.vue
│       │   ├── Cart.vue
│       │   ├── Checkout.vue
│       │   ├── Login.vue
│       │   └── Admin.vue
│       └── components/                 # Reusable components
│           ├── Navbar.vue
│           ├── GameCard.vue
│           └── AdminGameForm.vue
├── init/
│   └── init.sql                        # Schema + seed data
├── docker-compose.yml
└── README.md
```

---

## 🗄️ Schema Database

### Tabella `users`
- `id` (BIGINT, PK)
- `email` (VARCHAR, UNIQUE)
- `password` (VARCHAR) - BCrypt hash
- `nome` (VARCHAR)
- `role` (ENUM: USER, ADMIN)

### Tabella `games`
- `id` (BIGINT, PK)
- `titolo` (VARCHAR)
- `descrizione` (TEXT)
- `prezzo` (DECIMAL)
- `sviluppatore` (VARCHAR)
- `genere` (VARCHAR)
- `immagine_url` (VARCHAR)
- `in_stock` (BOOLEAN)

### Tabella `orders`
- `id` (BIGINT, PK)
- `user_id` (BIGINT, FK → users)
- `totale` (DECIMAL)
- `stato` (VARCHAR: PENDING, COMPLETED, CANCELLED)
- `created_at` (TIMESTAMP)

### Tabella `order_items`
- `id` (BIGINT, PK)
- `order_id` (BIGINT, FK → orders)
- `game_id` (BIGINT, FK → games)
- `quantita` (INT)
- `prezzo` (DECIMAL)

---

## 🔌 API Endpoints Principali

### Autenticazione
- **POST** `/api/auth/register` - Registrazione
- **POST** `/api/auth/login` - Login (restituisce JWT)

### Giochi (pubblico)
- **GET** `/api/games` - Lista giochi
- **GET** `/api/games/{id}` - Dettaglio gioco
- **GET** `/api/games/search?q=...` - Ricerca

### Giochi (admin)
- **POST** `/api/games` - Crea gioco [ADMIN]
- **PUT** `/api/games/{id}` - Aggiorna gioco [ADMIN]
- **DELETE** `/api/games/{id}` - Elimina gioco [ADMIN]

### Ordini
- **POST** `/api/orders` - Crea ordine [AUTH]
- **GET** `/api/orders/my` - I miei ordini [AUTH]
- **GET** `/api/orders/{id}` - Dettaglio ordine [AUTH]

---

## 🔐 Sicurezza Spring Security

### Configurazione (SecurityConfig.java)
```java
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf().disable()
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers("/api/games/**").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/admin/**").hasRole("ADMIN")
                .anyRequest().authenticated()
            )
            .sessionManagement()
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            .and()
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
```

### JWT Filter (JwtAuthFilter.java)
- Estrae token dall'header `Authorization: Bearer <token>`
- Valida token con `JwtUtil`
- Imposta `SecurityContext` con authorities

---

## 🎨 Frontend Vue 3

### Pinia Store (auth.js)
```javascript
import { defineStore } from 'pinia';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: localStorage.getItem('token')
  }),

  actions: {
    async login(email, password) {
      const res = await axios.post('/api/auth/login', { email, password });
      this.token = res.data.token;
      this.user = res.data.user;
      localStorage.setItem('token', this.token);
    },

    logout() {
      this.user = null;
      this.token = null;
      localStorage.removeItem('token');
    }
  },

  getters: {
    isAdmin: (state) => state.user?.role === 'ADMIN',
    isAuthenticated: (state) => !!state.token
  }
});
```

### Axios Interceptor (services/api.js)
```javascript
import axios from 'axios';
import { useAuthStore } from '@/stores/auth';

const api = axios.create({
  baseURL: 'http://localhost:8004/api'
});

// Intercetta richieste per aggiungere JWT
api.interceptors.request.use(config => {
  const authStore = useAuthStore();
  if (authStore.token) {
    config.headers.Authorization = `Bearer ${authStore.token}`;
  }
  return config;
});

export default api;
```

---

## 📖 Concetti Didattici

Questo esempio dimostra:

1. **Spring Boot Architecture** - Layer pattern (Controller → Service → Repository)
2. **Spring Security** - Configurazione JWT stateless
3. **JPA & Hibernate** - ORM con relazioni (OneToMany, ManyToOne)
4. **DTO Pattern** - Separazione tra entities e response objects
5. **Vue Composition API** - Setup script e reattività
6. **Pinia** - State management moderno per Vue 3
7. **Role-Based Access Control** - Differenziazione USER/ADMIN
8. **RESTful API Design** - Best practices per endpoints

---

## 🛠️ Sviluppo Locale

### Backend (senza Docker)
```bash
cd backend
./mvnw spring-boot:run
```

### Frontend (senza Docker)
```bash
cd frontend
npm install
npm run dev
```

---

## 🧪 Testing

### Backend
```bash
cd backend
./mvnw test
```

### Frontend
```bash
cd frontend
npm run test
```

---

## 🐛 Troubleshooting

### Java non trovato nel Dockerfile
Assicurati di usare l'immagine base corretta:
```dockerfile
FROM eclipse-temurin:17-jdk-alpine
```

### CORS errors
Aggiungi `@CrossOrigin` nei controller o configura globalmente in `WebConfig`

### MySQL connection refused
Verifica che il servizio `db` sia healthy prima di avviare il backend

---

## 🎓 Esercizi Suggeriti

1. **Aggiungere recensioni** - Sistema rating e commenti per giochi
2. **Implementare ricerca avanzata** - Filtri per genere, prezzo, sviluppatore
3. **Aggiungere wishlist** - Lista desideri personale
4. **Implementare pagamenti** - Integrazione Stripe/PayPal simulata
5. **Aggiungere notifiche** - WebSocket per aggiornamenti real-time
6. **Dashboard analytics** - Grafici vendite per admin

---

## 📝 Note per Studenti

- **Spring Boot** semplifica enormemente la configurazione rispetto a Spring tradizionale
- **JPA** astrae le query SQL, ma è importante capire cosa genera sotto
- **Vue 3 Composition API** è più modulare rispetto all'Options API
- **Pinia** è il successor ufficiale di Vuex, più type-safe
- In produzione usa **H2** per test, **PostgreSQL** per produzione
- **BCrypt** è lo standard industry per password hashing

---

## 📚 Risorse Utili

- [Spring Boot Docs](https://spring.io/projects/spring-boot)
- [Vue 3 Docs](https://vuejs.org/)
- [Pinia Docs](https://pinia.vuejs.org/)
- [Spring Security JWT Guide](https://www.baeldung.com/spring-security-oauth-jwt)

---

**Buono studio! 🎮🚀**
