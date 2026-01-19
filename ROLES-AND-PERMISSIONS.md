# Rollen- und Rechte-System für den Admin-Bereich

## Ziel

Einführung eines granularen Rollen- und Rechte-Systems für den Admin-Bereich der App, um folgende Rollen zu unterstützen:

- **Admin**: Vollzugriff (CRUD auf alle Quizze, Autoren, Challenges, SystemConfig etc.)
- **Teacher**: Quizze/Aufgaben erstellen, editieren, verschieben, aber keine Löschrechte für fremde Inhalte
- **Supporter**: Quizze/Aufgaben erstellen, aber nicht sichtbar schalten und keine Bearbeitung fremder Inhalte

## Was wurde umgesetzt?

- **Rollenmodell**: Rollen werden im author-Dokument als Feld `role` gespeichert (`admin`, `teacher`, `supporter`).
- **Automatische Rollenzuweisung**: Neue Auth-Nutzer erhalten beim ersten Login automatisch die Rolle `supporter`.
- **Firestore Rules**:
  - Admins dürfen alles.
  - Teacher und Supporter dürfen nur eigene Quizze bearbeiten (`authorId == uid`).
  - Supporter dürfen Quizze nicht sichtbar schalten (`visible` darf nicht auf `true` gesetzt werden).
  - Löschen ist nur für Admins erlaubt.
- **Quiz-Erstellung**: Beim Anlegen eines Quiz wird das Feld `authorId` korrekt mit der UID des Nutzers gesetzt.
- **User-Feedback**: Bei verbotenen Aktionen (z.B. Löschen ohne Berechtigung) erscheint ein klarer Hinweis im UI.

## Was ist noch offen?

- **Frontend**: Rollen nach Login auslesen und im State speichern, UI/UX für rollenbasierte Aktionen und Sichtbarkeit.
- **Admin-UI**: Möglichkeit für Admins, Rollen anderer Nutzer zu ändern.
- **Weitere User-Feedbacks**: Für alle CRUD-Aktionen und Rollenchecks konsistente Hinweise anzeigen.
- **Tests**: Alle Rollen und Aktionen durchtesten, ob die Regeln und Feedbacks wie gewünscht greifen.

---
Letztes Update: 19.01.2026
