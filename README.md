# Learn Quest Arena

Eine Quiz-Lern-Anwendung für Schulen, gebaut mit React, TypeScript und Firebase.

## Funktionen

- **Quiz-System**: Erstellen und Spielen von Quizzen mit verschiedenen Fragetypen (Text und Bilder)
- **Hierarchische Struktur**: Fächer → Klassen → Themen → Quizze
- **Fortschrittsverfolgung**: Speichert den Lernfortschritt für jeden Benutzer
- **Spaced Repetition**: Intelligentes Wiederholungssystem für effektives Lernen
- **Quiz-Challenge**: Beta-Feature im Stil von "Wer wird Millionär"
- **Admin-Bereich**: Verwaltung von Quizzen durch authentifizierte Lehrkräfte

## Datenstruktur

### Firestore Collections

#### subjects (Legacy - eingebettete Struktur)
```
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
```
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
```
users/{username}
  └── progress/{quizId}
        ├── questions: { [questionId]: QuestionSRSData }
        ├── totalTries: number
        ├── completed: boolean
        └── lastUpdated: timestamp
```

### Migration

Die Anwendung unterstützt sowohl die alte eingebettete Struktur als auch die neue eigenständige Quiz-Collection. Neue Quizze werden automatisch in beide Strukturen geschrieben (Dual-Write).

Um bestehende Quizze zu migrieren:
1. Im Admin-Bereich einloggen
2. Zum Tab "Migration" wechseln
3. "Migration starten" klicken

## Entwicklung

```bash
# Abhängigkeiten installieren
npm install

# Entwicklungsserver starten
npm run dev

# Produktions-Build erstellen
npm run build

# Linting
npm run lint
```

## Firebase Setup

1. Firebase-Projekt erstellen
2. `src/firebaseConfig.ts` mit deiner Firebase-Konfiguration anpassen
3. Firestore Security Rules aus `firestore.rules` deployen
4. Firebase Authentication aktivieren (E-Mail/Passwort)

## Routing

Direkte Quiz-Links im Format:
- `/quiz/{subject}/{class}/{topic}/{quiz}`

Firebase Hosting Rewrites in `firebase.json` sind bereits konfiguriert.

