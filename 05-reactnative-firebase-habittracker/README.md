# 05 - Habit Tracker Mobile 📱

**Stack:** React Native (Expo) + Firebase (Auth + Firestore)

App mobile per tracciare abitudini quotidiane con streak counter, statistiche e notifiche.

---

## 🎯 Caratteristiche

- ✅ **Autenticazione Firebase** - Login rapido con email/password
- ✅ **CRUD Abitudini** - Crea, modifica, elimina abitudini
- ✅ **Check-in Giornaliero** - Segna abitudine completata
- ✅ **Streak Counter** - Conta giorni consecutivi
- ✅ **Calendario Visuale** - Vista mensile dei progressi
- ✅ **Statistiche** - Percentuali successo settimanali/mensili
- ✅ **Notifiche Push** - Promemoria giornalieri (opzionale)

---

## 📚 Stack Tecnologico

### Frontend Mobile
- **React Native** - Framework mobile cross-platform
- **Expo** - Toolchain per sviluppo rapido
- **React Navigation** - Navigazione tra schermate
- **AsyncStorage** - Cache locale
- **Expo Notifications** - Notifiche push

### Backend (Firebase)
- **Firebase Authentication** - Autenticazione utenti
- **Cloud Firestore** - Database NoSQL real-time
- **Firebase Security Rules** - Autorizzazione
- **Firebase Cloud Messaging** - Notifiche push (opzionale)

---

## 🚀 Setup Progetto

### 1. Installa Expo CLI
```bash
npm install -g expo-cli
```

### 2. Crea progetto Firebase
1. Vai su [Firebase Console](https://console.firebase.google.com/)
2. Crea nuovo progetto "HabitTracker"
3. Abilita **Authentication** (Email/Password)
4. Crea database **Firestore**
5. Ottieni configurazione web (apiKey, projectId, etc.)

### 3. Configura il progetto
```bash
cd 05-reactnative-firebase-habittracker

# Installa dipendenze
npm install

# Copia config Firebase
cp firebaseConfig.example.js firebaseConfig.js
# Modifica firebaseConfig.js con le tue credenziali

# Avvia su Expo Go
expo start
```

### 4. Testa su device
- Installa **Expo Go** su iOS/Android
- Scannerizza QR code mostrato nel terminale

---

## 📁 Struttura Progetto

```
05-reactnative-firebase-habittracker/
├── App.js                       # Entry point
├── app.json                     # Expo config
├── package.json
├── firebaseConfig.js            # Firebase credentials (gitignored)
├── firebaseConfig.example.js    # Template config
└── src/
    ├── screens/
    │   ├── LoginScreen.js       # Schermata login/register
    │   ├── HomeScreen.js        # Lista abitudini
    │   ├── HabitDetailScreen.js # Dettaglio e calendario
    │   ├── AddHabitScreen.js    # Form nuova abitudine
    │   └── StatsScreen.js       # Statistiche globali
    ├── components/
    │   ├── HabitCard.js         # Card singola abitudine
    │   ├── CalendarView.js      # Calendario mensile
    │   ├── StreakBadge.js       # Badge giorni consecutivi
    │   └── ProgressChart.js     # Grafico progressi
    ├── services/
    │   ├── auth.js              # Firebase Auth wrapper
    │   ├── habits.js            # CRUD abitudini
    │   └── checkins.js          # Gestione check-in
    └── utils/
        ├── dateHelpers.js       # Helper per date
        └── notifications.js     # Setup notifiche
```

---

## 🗄️ Schema Firestore

### Collection `users`
```javascript
{
  uid: "string",
  email: "string",
  displayName: "string",
  createdAt: Timestamp
}
```

### Collection `habits` (subcollection di users)
```javascript
users/{userId}/habits/{habitId}
{
  title: "string",
  description: "string",
  frequency: "daily" | "weekly",
  targetDays: ["mon", "tue", ...],  // Per abitudini settimanali
  color: "#hexcolor",
  icon: "emoji",
  createdAt: Timestamp
}
```

### Collection `checkins` (subcollection di habits)
```javascript
users/{userId}/habits/{habitId}/checkins/{date}
{
  date: "YYYY-MM-DD",
  completed: true,
  timestamp: Timestamp,
  note: "string (optional)"
}
```

---

## 🔐 Firebase Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Gli utenti possono leggere/scrivere solo i propri dati
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;

      match /habits/{habitId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;

        match /checkins/{checkinId} {
          allow read, write: if request.auth != null && request.auth.uid == userId;
        }
      }
    }
  }
}
```

---

## 💻 Codice Esempio

### firebaseConfig.js
```javascript
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
```

### services/habits.js
```javascript
import { db } from '../firebaseConfig';
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc } from 'firebase/firestore';

export const createHabit = async (userId, habitData) => {
  const habitsRef = collection(db, `users/${userId}/habits`);
  return await addDoc(habitsRef, {
    ...habitData,
    createdAt: new Date()
  });
};

export const getHabits = async (userId) => {
  const habitsRef = collection(db, `users/${userId}/habits`);
  const snapshot = await getDocs(habitsRef);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const updateHabit = async (userId, habitId, updates) => {
  const habitRef = doc(db, `users/${userId}/habits/${habitId}`);
  return await updateDoc(habitRef, updates);
};

export const deleteHabit = async (userId, habitId) => {
  const habitRef = doc(db, `users/${userId}/habits/${habitId}`);
  return await deleteDoc(habitRef);
};
```

### services/checkins.js
```javascript
import { db } from '../firebaseConfig';
import { doc, setDoc, getDoc } from 'firebase/firestore';

export const checkInHabit = async (userId, habitId, date) => {
  const checkinRef = doc(db, `users/${userId}/habits/${habitId}/checkins/${date}`);

  return await setDoc(checkinRef, {
    date,
    completed: true,
    timestamp: new Date()
  });
};

export const getCheckin = async (userId, habitId, date) => {
  const checkinRef = doc(db, `users/${userId}/habits/${habitId}/checkins/${date}`);
  const snapshot = await getDoc(checkinRef);
  return snapshot.exists() ? snapshot.data() : null;
};

export const calculateStreak = async (userId, habitId) => {
  // Logica per calcolare streak giorni consecutivi
  // Leggi checkins in ordine decrescente e conta finché non trovi un giorno mancante
};
```

---

## 📖 Concetti Didattici

Questo esempio dimostra:

1. **React Native** - Sviluppo mobile cross-platform
2. **Expo Workflow** - Toolchain semplificato vs bare React Native
3. **Firebase Auth** - Autenticazione serverless
4. **Firestore** - Database NoSQL real-time
5. **Subcollections** - Struttura dati gerarchica
6. **AsyncStorage** - Cache locale per offline-first
7. **React Navigation** - Stack e Tab navigation
8. **Hooks personalizzati** - useAuth, useHabits

---

## 🎨 UI/UX Tips

- **Colori per abitudini** - Permetti scelta colore personalizzato
- **Emoji picker** - Per rendere abitudini riconoscibili visivamente
- **Swipe gestures** - Swipe per check-in rapido
- **Animazioni** - Celebra streak milestones (7, 30, 100 giorni)
- **Dark mode** - Supporto tema scuro
- **Haptic feedback** - Feedback tattile su check-in

---

## 🔔 Notifiche Push

### Setup Expo Notifications
```bash
expo install expo-notifications
```

### Richiedi permessi e schedula
```javascript
import * as Notifications from 'expo-notifications';

// Richiedi permessi
const { status } = await Notifications.requestPermissionsAsync();

// Schedula notifica giornaliera
await Notifications.scheduleNotificationAsync({
  content: {
    title: "Time to track your habits! 🎯",
    body: "Don't break your streak!",
  },
  trigger: {
    hour: 9,
    minute: 0,
    repeats: true,
  },
});
```

---

## 🧪 Testing

### Unit Testing
```bash
npm install --save-dev jest @testing-library/react-native
npm test
```

### Testing su Device
```bash
# Build standalone app (iOS)
eas build --platform ios

# Build standalone app (Android)
eas build --platform android
```

---

## 🐛 Troubleshooting

### Firebase non inizializza
- Verifica che `firebaseConfig.js` contenga credenziali corrette
- Controlla che Authentication e Firestore siano abilitati nella console

### Expo Go non si connette
- Assicurati che phone e computer siano sulla stessa rete WiFi
- Prova con tunnel mode: `expo start --tunnel`

### Errori security rules
- Testa le rules nella console Firebase (Rules playground)
- Verifica che `request.auth.uid` corrisponda al `userId` nei percorsi

---

## 🎓 Esercizi Suggeriti

1. **Aggiungere categorie** - Salute, Produttività, Fitness, etc.
2. **Implementare reminder personalizzati** - Orari diversi per habit
3. **Aggiungere social features** - Condividi streak con amici
4. **Implementare sfide** - 30-day challenges
5. **Aggiungere journaling** - Note giornaliere per ogni check-in
6. **Dashboard analytics** - Grafici trend nel tempo

---

## 📝 Note per Studenti

- **React Native != React Web**: alcuni hook e componenti sono diversi
- **Expo Go limiti**: alcune librerie native richiedono bare workflow
- **Firebase gratuito**: Generous free tier per progetti piccoli
- **Firestore real-time**: Listener automatici per sync
- **AsyncStorage vs Firestore**: Cache locale per offline, Firestore per sync
- **Notifiche locali** vs **push remote**: Expo gestisce entrambe

---

## 📚 Risorse Utili

- [React Native Docs](https://reactnative.dev/)
- [Expo Docs](https://docs.expo.dev/)
- [Firebase Docs](https://firebase.google.com/docs)
- [React Navigation](https://reactnavigation.org/)

---

**Buono studio! 📱🎯**
