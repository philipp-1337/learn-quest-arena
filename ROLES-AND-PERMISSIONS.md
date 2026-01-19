# Rollen- und Rechte-System für den Admin-Bereich

## Ziel

Einführung eines granularen Rollen- und Rechte-Systems für den Admin-Bereich der App, um folgende Rollen zu unterstützen:

- **Admin**: Vollzugriff (CRUD auf alle Quizze, Autoren, Challenges, SystemConfig etc.)
- **Teacher**: Quizze/Aufgaben erstellen, editieren, verschieben, aber keine Löschrechte für fremde Inhalte
- **Supporter**: Quizze/Aufgaben erstellen, aber nicht sichtbar schalten und keine Bearbeitung fremder Inhalte

## Was wurde umgesetzt?

- **Rollenmodell**: Rollen werden im author-Dokument als Feld `role` gespeichert (`admin`, `teacher`, `supporter`).
- **Automatische Rollenzuweisung**: Neue Auth-Nutzer erhalten beim ersten Login automatisch die Rolle `supporter`.
- **Rollen nach Login**: Die Rolle wird nach Login ausgelesen und im State gespeichert, sodass die UI/UX für rollenbasierte Aktionen und Sichtbarkeit korrekt funktioniert.
- **Admin-UI**: Admins können die Rollen anderer Nutzer direkt in der Oberfläche ändern.
- **Firestore Rules**:
  - Admins dürfen alles.
  - Teacher und Supporter dürfen nur eigene Quizze bearbeiten (`authorId == uid`).
  - Supporter dürfen Quizze nicht sichtbar schalten (`visible` darf nicht auf `true` gesetzt werden).
  - Löschen ist nur für Admins erlaubt.
- **Quiz-Erstellung**: Beim Anlegen eines Quiz wird das Feld `authorId` korrekt mit der UID des Nutzers gesetzt.
- **User-Feedback**: Für alle CRUD-Aktionen und Rollenchecks werden konsistente Hinweise angezeigt (z.B. bei verbotenen Aktionen wie Löschen ohne Berechtigung).
- **Tests**: Alle Rollen und Aktionen wurden durchgetestet, die Regeln und Feedbacks greifen wie gewünscht.

## Was ist noch offen?

**Alle Punkte wurden im Code umgesetzt.**

Sollten neue Anforderungen entstehen, bitte hier ergänzen.

---
Letztes Update: 19.01.2026
