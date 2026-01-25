# Learn Quest Arena

Eine moderne Quiz-Lern-Anwendung für Schulen, gebaut mit React, TypeScript und Firebase.

> 🎓 **Progressive Web App** – Installierbar auf allen Geräten, funktioniert offline

## ✨ Features im Überblick

### 📚 Für Schüler

- **Adaptives Lernsystem**: Intelligentes Spaced Repetition (SRS) mit 6 Schwierigkeitsstufen
- **XP & Fortschritt**: Verdiene Erfahrungspunkte und verfolge deinen Lernfortschritt
- **Anonymer Zugang**: Keine Registrierung nötig – starte mit einem zufälligen Tiernamen
- **Quiz-Challenge**: "Wer wird Millionär"-Modus mit Jokern (Beta)
- **Dark Mode**: Augenschonend lernen, Tag und Nacht
- **Offline-Fähig**: Als PWA installierbar, funktioniert auch ohne Internet

### 👨‍🏫 Für Lehrkräfte

- **Quiz-Verwaltung**: Erstellen, Bearbeiten und Organisieren von Quizzen
- **Hierarchische Struktur**: Fächer → Klassen → Themen → Quizze
- **Multiple Choice**: Text- und Bildfragen mit bis zu 6 Antwortmöglichkeiten
- **Import/Export**: JSON & CSV für Batch-Operationen
- **Admin-Dashboard**: Statistiken, Verwaltung, QR-Codes für einfachen Zugang
- **Sichtbarkeits-Kontrolle**: Quizze ausblenden/veröffentlichen

### 🛠️ Technische Features

- **Progressive Web App (PWA)**: Installierbar, Update-Benachrichtigungen
- **Responsive Design**: Optimiert für Desktop, Tablet und Smartphone
- **Deep Linking**: Direkte Links zu spezifischen Quizzen teilbar
- **Echtzeit-Synchronisation**: Firebase Firestore für Live-Updates
- **Performance-Optimiert**: React.memo, useMemo, lazy loading
- **Accessibility**: ARIA-Labels, Keyboard-Navigation, Screen Reader Support

## 🚀 Tech Stack

- **Frontend**: React 19, TypeScript, Vite
- **Styling**: Tailwind CSS 4
- **Backend**: Firebase (Firestore, Authentication, Hosting)
- **Icons**: Lucide React
- **Routing**: React Router DOM 7
- **Notifications**: Sonner (Toast-System)
- **PWA**: vite-plugin-pwa mit Workbox

## 📖 Benutzerhandbuch

### Für Schüler

1. **Quiz starten**: Navigiere durch Fach → Klasse → Thema und wähle ein Quiz
2. **Username wählen**: Beim ersten Mal wird ein zufälliger Tiername generiert (z.B. "Mutiger Tiger")
3. **Quiz spielen**: Beantworte Fragen, sammle XP und verbessere deinen Score
4. **Fortschritt tracken**: Gehe zu "Mein Fortschritt" um deine Statistiken zu sehen
5. **Wiederholen**: Das SRS-System zeigt dir, welche Fragen wiederholt werden sollten

**Tipp**: Installiere die App als PWA (Icon in der Browser-Leiste) für die beste Erfahrung!

### Für Lehrkräfte

1. **Login**: Klicke auf das Admin-Icon und melde dich mit deinem Firebase-Account an
2. **Quiz erstellen**:
   - Manuell über den Quiz-Wizard
   - Import via JSON/CSV
   - Bestehende Quizze duplizieren und anpassen
3. **Organisieren**: Erstelle Fächer, Klassen und Themen zur Strukturierung
4. **Teilen**: Nutze QR-Codes oder direkte Links zum Teilen spezifischer Quizze
5. **Verwalten**: Bearbeite, verschiebe oder lösche Quizze im Admin-Bereich

## 🏗️ Datenstruktur

### Firestore Collections

#### subjects (Legacy - eingebettete Struktur)

```bash
subjects/{subjectId}
  ├── name: string
  ├── order: number
  └── classes: [
        {
          id, name, level,
          topics: [
            {
              id, name,
              quizzes: [{ id, uuid, title, shortTitle, questions, hidden }]
            }
          ]
        }
      ]
```

#### quizzes (Neu - eigenständige Collection)

```bash
quizzes/{quizId}
  ├── id: string (UUID)
  ├── title: string
  ├── shortTitle: string
  ├── questions: Question[]
  ├── hidden: boolean
  ├── createdAt: timestamp
  ├── updatedAt: timestamp
  ├── authorId: string (Firebase Auth UID)
  ├── authorEmail: string
  ├── subjectId: string
  ├── subjectName: string
  ├── classId: string
  ├── className: string
  ├── topicId: string
  └── topicName: string
```

#### users

```bash
users/{username}
  └── progress/{quizId}
        ├── questions: { [questionId]: QuestionSRSData }
        ├── totalTries: number
        ├── completed: boolean
        └── lastUpdated: timestamp
```

### Migration

Um bestehende Quizze zu migrieren:

- Node.js 18+ und Bun ([bun.sh](https://bun.sh/))
- Firebase-Projekt (kostenloser Spark-Plan ausreichend)
- Git

1. Im Admin-Bereich einloggen

### Schritt 2: Abhängigkeiten installieren

```bash
bun install
3. "Migration starten" klicken


### Schritt 7: Entwicklungsserver starten

```bash
# Entwicklungsserver mit Hot Reload
bun run dev

# App ist verfügbar unter http://localhost:5173
- Node.js 18+ und npm
- Firebase-Projekt (kostenloser Spark-Plan ausreichend)

### Weitere Commands

```bash
# Produktions-Build erstellen
bun run build

# Build lokal testen
bun run preview

# Linting
bun run lint
```bash
git clone <repository-url>

1. **Firebase CLI installieren** (falls noch nicht geschehen)

```bash
# Du kannst weiterhin npm global für Tools wie firebase-tools verwenden:

firebase login
### Schritt 2: Abhängigkeiten installieren


3. **Build erstellen**

```bash
bun run build

**Hinweis zur Bun-Umstellung:**
- Die bun.lockb ist jetzt maßgeblich.
- node_modules wird von Bun verwaltet, du brauchst keine package-lock.json oder yarn.lock mehr.

### Schritt 3: Firebase konfigurieren

### Andere Hosting-Optionen

Die App ist eine statische SPA und kann auf jedem Static-Hosting-Provider deployed werden:
- **Vercel**: `vercel --prod`
- **Netlify**: Drag & Drop des `dist` Ordners
- **GitHub Pages**: Via GitHub Actions

⚠️ **Wichtig**: Bei SPA-Hosting müssen alle Routes auf `index.html` umgeleitet werden (für Client-Side-Routing)

---

**ℹ️ Bun-Umstellung:**
Alle npm-Befehle wurden durch Bun ersetzt. Für globale Tools wie firebase-tools kannst du weiterhin npm verwenden. Bei Problemen mit Abhängigkeiten prüfe die Bun-Kompatibilität unter https://bun.sh/docs/compatibility.
3. **Umgebungsvariablen setzen**: Kopiere `.env.example` zu `.env.local`

```bash
cp .env.example .env.local
```

1. **Firebase-Credentials eintragen**: Fülle `.env.local` mit deinen Firebase-Daten aus

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### Schritt 4: Firebase-Dienste aktivieren

1. **Authentication**: E-Mail/Passwort-Provider aktivieren
2. **Firestore Database**: Im Production-Modus starten
3. **Storage**: Für Bild-Uploads aktivieren (optional)
4. **Hosting**: Für Deployment aktivieren (optional)

### Schritt 5: Security Rules & Indexes deployen

```bash
# Firestore Rules deployen
firebase deploy --only firestore:rules

# Firestore Indexes deployen
firebase deploy --only firestore:indexes
```

### Schritt 6: Admin-User erstellen

1. Gehe zu Firebase Console → Authentication → Users
2. Füge manuell einen User hinzu (E-Mail + Passwort)
3. Dieser Account kann sich im Admin-Bereich anmelden

### Schritt 7: Entwicklungsserver starten

```bash
# Entwicklungsserver mit Hot Reload
npm run dev

# App ist verfügbar unter http://localhost:5173
```

### Weitere Commands

```bash
# Produktions-Build erstellen
npm run build

# Build lokal testen
npm run preview

# Linting
npm run lint
```

## 🚀 Deployment

### Firebase Hosting

1. **Firebase CLI installieren** (falls noch nicht geschehen)

```bash
npm install -g firebase-tools
firebase login
```

1. **Projekt initialisieren**

```bash
firebase init
# Wähle: Hosting, Firestore, (optional) Storage
```

1. **Build erstellen**

```bash
npm run build
```

1. **Deployen**

```bash
# Alles deployen
firebase deploy

# Nur Hosting
firebase deploy --only hosting

# Nur Firestore Rules
firebase deploy --only firestore
```

### Andere Hosting-Optionen

Die App ist eine statische SPA und kann auf jedem Static-Hosting-Provider deployed werden:

- **Vercel**: `vercel --prod`
- **Netlify**: Drag & Drop des `dist` Ordners
- **GitHub Pages**: Via GitHub Actions

⚠️ **Wichtig**: Bei SPA-Hosting müssen alle Routes auf `index.html` umgeleitet werden (für Client-Side-Routing)

## 🔐 Sicherheit

### Firestore Security Rules

Die `firestore.rules` Datei enthält strenge Sicherheitsregeln:

- **Quizzes**: Nur authentifizierte Admins können schreiben
- **User Progress**: Nur validierte Usernamen erlaubt, schreibgeschützt pro User
- **Input-Validierung**: Schutz vor Injections und Manipulationen

### Empfohlene Maßnahmen

- ✅ `.env.local` niemals committen (ist in `.gitignore`)
- ✅ Firebase API-Keys in Environment Variables
- ✅ Admin-Accounts mit starken Passwörtern
- ✅ Regelmäßige Firebase Security Rules Review
- ✅ 2FA für Firebase Console-Zugang aktivieren

Siehe [SECURITY_SUMMARY.md](SECURITY_SUMMARY.md) für Details.

## 📊 Performance

Die App ist auf Performance optimiert:

- React.memo für teure Komponenten
- useMemo für schwere Berechnungen
- Lazy Loading für Bilder
- Code Splitting per Route
- PWA-Caching für statische Assets

Siehe [PERFORMANCE_REVIEW.md](PERFORMANCE_REVIEW.md) und [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md).

## 🎨 Animationen

Subtile Animationen für bessere UX:

- Count-up Animationen für Scores/XP
- Staggered entrance animations
- Smooth transitions

Siehe [ANIMATIONS_GUIDE.md](ANIMATIONS_GUIDE.md) für Implementierungsdetails.

## 🔮 Zukunft & Ideen

Interessiert an möglichen Features? Check [FEATURE_IDEAS.md](FEATURE_IDEAS.md) für eine umfangreiche Sammlung theoretischer Verbesserungsvorschläge.

## 📁 Projektstruktur

```bash
learn-quest-arena/
├── src/
│   ├── components/        # React-Komponenten
│   │   ├── admin/        # Admin-spezifische Komponenten
│   │   ├── quiz/         # Quiz-Player & Ansichten
│   │   ├── user/         # User-Fortschritt & Profile
│   │   ├── modals/       # Dialoge & Wizards
│   │   ├── shared/       # Wiederverwendbare Komponenten
│   │   └── ...
│   ├── hooks/            # Custom React Hooks
│   ├── utils/            # Hilfsfunktionen & Helpers
│   ├── types/            # TypeScript Type Definitions
│   ├── firebaseConfig.ts # Firebase Initialisierung
│   └── App.tsx           # Haupt-App-Komponente
├── public/               # Statische Assets
├── firebase.json         # Firebase Konfiguration
├── firestore.rules       # Firestore Security Rules
├── firestore.indexes.json # Firestore Composite Indexes
└── ...
```

## 🤝 Beitragen

Dieses Projekt ist für Bildungseinrichtungen konzipiert. Verbesserungsvorschläge und Bug-Reports sind willkommen!

### Development Guidelines

- TypeScript strict mode aktiviert
- ESLint-Regeln beachten
- Komponenten dokumentieren
- Performance im Blick behalten

## 📄 Lizenz

[Lizenzinformationen hier einfügen]

## 🙏 Danksagungen

- Firebase für das Backend
- React Team für das Framework
- Tailwind CSS für das Styling
- Lucide für die Icons
