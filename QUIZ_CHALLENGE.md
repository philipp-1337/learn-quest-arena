# Quiz-Challenge Modus

## Übersicht

Der Quiz-Challenge Modus ist eine neue Spielvariante, die dem bekannten TV-Format "Wer wird Millionär?" nachempfunden ist. Aus urheberrechtlichen Gründen wurde ein eigener Name verwendet.

**Wichtig:** Admins erstellen keine neuen Fragen für Challenges. Stattdessen wählen sie aus dem Pool der bereits vorhandenen Quiz-Fragen aus.

## Features

### 15 Gewinnstufen

Das Spiel umfasst 15 aufsteigende Levels mit folgenden Geldbeträgen:

1. 50 €
2. 100 €
3. 200 €
4. 300 €
5. 500 €
6. 1.000 €
7. 2.000 €
8. 4.000 €
9. **8.000 €** (erste Sicherheitsstufe)
10. 16.000 €
11. 32.000 €
12. 64.000 €
13. **125.000 €** (zweite Sicherheitsstufe)
14. 500.000 €
15. **1.000.000 €** (Hauptgewinn)

### Sicherheitsstufen

- **Level 9 (8.000 €)**: Erste Sicherheitsstufe
- **Level 13 (125.000 €)**: Zweite Sicherheitsstufe

Wenn der Spieler eine Sicherheitsstufe erreicht hat und danach eine falsche Antwort gibt, fällt er auf diese Sicherheitsstufe zurück und erhält den entsprechenden Gewinn. Ohne erreichte Sicherheitsstufe endet das Spiel mit 0 €.

### Spielablauf

1. **Levelbasierte Fragen**: Für jedes Level werden Fragen aus einem separaten Fragenkatalog geladen
2. **Steigende Schwierigkeit**: Die Fragen werden durch die Kategorien/Levels schwerer
3. **Eine Chance pro Level**: Bei einer falschen Antwort endet das Spiel
4. **Fortschritt-Tracking**: Der Fortschritt wird pro Benutzer gespeichert (optional)

## Technische Implementierung

### Neue Datenstrukturen

#### QuizChallenge Type
```typescript
interface QuizChallengeLevel {
  level: number;
  prize: number;
  isSafetyLevel: boolean;
  questionIds: string[];  // References to questions by ID
}

interface QuizChallenge {
  id: string;
  title: string;
  levels: QuizChallengeLevel[];
  hidden?: boolean;
}
```

**Wichtig**: Challenges speichern nur Referenzen (`questionIds`) zu Fragen, nicht die vollständigen Fragen. Dies:
- Vermeidet Datenduplikation
- Ermöglicht zentrale Verwaltung von Fragen
- Aktualisierungen an Fragen wirken sich automatisch auf Challenges aus

#### User Progress
```typescript
interface UserQuizChallengeProgress {
  username: string;
  challengeId: string;
  currentLevel: number;
  highestLevel: number;
  highestPrize: number;
  safetyPrize: number;
  completed: boolean;
  lastUpdated: number;
}
```

### Komponenten

#### QuizChallengePlayer
- Hauptkomponente für das Quiz-Challenge-Spielerlebnis
- Verwaltet den Spielzustand (aktuelles Level, Gewinn, etc.)
- Zeigt Gewinnstufen-Leiter an
- Behandelt richtige und falsche Antworten

#### QuizChallengeManager
- Admin-Interface zur Verwaltung der Quiz-Challenges
- Ermöglicht das Erstellen von Challenges
- **Fragen-Selektor** zeigt alle verfügbaren Fragen aus dem Quiz-Pool
- Erlaubt Auswahl von Fragen pro Level (mit Checkboxen)
- Visualisiert die Gewinnstufen
- Speichert nur Fragen-IDs (keine Duplikation)

### Firestore Collections

#### quizChallenges
Speichert die Quiz-Challenge-Definitionen mit Referenzen zu Fragen.

```javascript
{
  id: "challenge1",
  title: "Wissens-Challenge 2024",
  levels: [
    {
      level: 1,
      prize: 50,
      isSafetyLevel: false,
      questionIds: ["quiz123_q0", "quiz456_q2", "quiz789_q1"]
    },
    // ... weitere Levels
  ],
  hidden: false
}
```

**Hinweis**: `questionIds` enthält IDs im Format `${quiz.id}_q${index}` die auf Fragen in der subjects-Collection verweisen.

#### quizChallengeProgress
Speichert den Fortschritt der Benutzer.

```javascript
{
  username: "MaxMustermann",
  challengeId: "challenge1",
  currentLevel: 5,
  highestLevel: 5,
  highestPrize: 500,
  safetyPrize: 0,
  completed: false,
  lastUpdated: 1703434800000
}
```

## Verwendung

### Für Administratoren

1. **Admin-Bereich öffnen**: Klicke auf das Zahnrad-Symbol und melde dich an
2. **Quiz-Challenge Tab wählen**: Im Admin-Bereich zum "Quiz-Challenge" Tab wechseln
3. **Neue Challenge erstellen**: 
   - Auf "Neue Challenge" klicken
   - Namen eingeben (z.B. "Wissens-Challenge 2024")
   - Challenge wird mit 15 leeren Levels erstellt
4. **Fragen pro Level auswählen**: 
   - Ein Level auswählen (1-15)
   - "Fragen auswählen" klicken
   - Aus dem Pool vorhandener Fragen mit Checkboxen auswählen
   - "Auswahl speichern" klicken

**Fragen-Pool**: Alle Fragen aus den bestehenden Standard-Quizzes stehen zur Auswahl. Der Fragen-Selektor zeigt:
- Die Frage selbst
- Aus welchem Quiz/Thema sie stammt
- Checkbox zum Auswählen

**Empfehlung**: Wähle 5-10 Fragen pro Level, damit Spieler bei mehreren Durchgängen unterschiedliche Fragen erhalten.

### Für Spieler

1. **Startseite öffnen**: Auf der Hauptseite wird die Quiz-Challenge prominent angezeigt
2. **Challenge auswählen**: Auf eine verfügbare Challenge klicken
3. **Spielen**: 
   - Fragen werden nacheinander präsentiert
   - Antwort auswählen
   - Bei richtiger Antwort: Weiter zum nächsten Level
   - Bei falscher Antwort: Spiel endet, Gewinn wird angezeigt
4. **Fortschritt**: Bei eingeloggten Benutzern wird der Fortschritt gespeichert

## UI-Elemente

### Gewinnstufen-Anzeige
- Aktuelle Stufe: **Blau hervorgehoben** mit Ring-Effekt
- Erreichte Stufen: Grün
- Zukünftige Stufen: Grau
- Sicherheitsstufen: Gelber Ring um die Stufe

### Spiel-Ende-Bildschirm
- **Gewonnen** (1.000.000 €): Trophäe + Glückwunsch-Nachricht
- **Verloren**: Zeigt erreichten Gewinn und Level an
- Optionen: "Nochmal spielen", "Zurück", "Startseite"

## Best Practices

### Fragen erstellen
- **Erstelle zuerst Standard-Quizzes** im "Standard Quiz" Tab des Admin-Bereichs
- Diese Fragen stehen dann automatisch im Quiz-Challenge Pool zur Verfügung
- Kategorisiere Fragen nach Schwierigkeit in verschiedenen Quizzes:
  - **Einfache Fragen**: Für Levels 1-3
  - **Mittelschwere Fragen**: Für Levels 4-6
  - **Schwierige Fragen**: Für Levels 7-9
  - **Sehr schwierige Fragen**: Für Levels 10-12
  - **Expertenfragen**: Für Levels 13-15

### Kategorien
Empfohlene Kategorien für ausgewogene Challenges:
- Allgemeinwissen
- Geschichte
- Geographie
- Naturwissenschaften
- Kunst & Kultur
- Sport
- Politik & Wirtschaft

### Antwortmöglichkeiten
- Stelle sicher, dass alle 4 Antworten plausibel sind
- Vermeide offensichtlich falsche Antworten bei höheren Levels
- Achte auf ähnliche Schwierigkeit der Distraktoren

## Erweiterungsmöglichkeiten

Zukünftige Features könnten beinhalten:
- **Joker-System**: 50:50, Publikumsjoker, Telefonjoker
- **Zeitlimit**: Optionale Zeitbegrenzung pro Frage
- **Mehrspieler-Modus**: Mehrere Spieler treten gegeneinander an
- **Rangliste**: Bestenliste der erfolgreichsten Spieler
- **Themenchallenge**: Spezielle Challenges zu bestimmten Themen
- **Schwierigkeitsgrad**: Unterschiedliche Challenge-Varianten (leicht, mittel, schwer)

## Sicherheit & Datenschutz

- Fortschrittsdaten werden nur für eingeloggte Benutzer gespeichert
- Gast-Modus verfügbar ohne Datenspeicherung
- Alle Daten in Firebase mit entsprechenden Security Rules geschützt
- Benutzer können ihren Fortschritt jederzeit zurücksetzen

## Fehlerbehebung

### Challenge wird nicht angezeigt
- Prüfe ob die Challenge als `hidden: false` markiert ist
- Stelle sicher, dass **mindestens ein Level Fragen-IDs enthält**
- Überprüfe die Firebase-Verbindung

### Fragen werden nicht geladen
- **Stelle sicher, dass Standard-Quizzes mit Fragen existieren**
- Überprüfe die Firestore-Regeln
- Prüfe ob die Fragen-IDs im Format `${quiz.id}_q${index}` korrekt sind
- Prüfe die Browser-Konsole auf Fehler

### Fragen-Pool ist leer
- **Erstelle zuerst Standard-Quizzes** im "Standard Quiz" Tab
- Jedes Quiz mit Fragen erscheint automatisch im Pool
- Lade die Seite neu, falls kürzlich Quizzes hinzugefügt wurden

### Fortschritt wird nicht gespeichert
- Benutzer muss eingeloggt sein (nicht "Gast")
- Firebase-Verbindung muss aktiv sein
- Prüfe die Firestore Security Rules für `quizChallengeProgress`

## Lizenz

Dieses Feature wurde speziell entwickelt, um urheberrechtliche Probleme zu vermeiden. Es ist nicht als Kopie von "Wer wird Millionär?" gedacht, sondern als eigenständiges Quiz-Format mit ähnlicher Spielmechanik.
