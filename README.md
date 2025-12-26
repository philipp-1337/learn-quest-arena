# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

## FIREBASE INTEGRATION INSTRUCTIONS

### Security Setup (WICHTIG!)

**Vor dem ersten Deployment:**

1. Erstelle eine `.env.local` Datei basierend auf `.env.example`
2. Füge deine echten Firebase Credentials ein
3. Stelle sicher, dass `.env.local` NICHT in Git committed wird

Siehe `SECURITY_ANALYSIS.md` für eine vollständige Sicherheitsanalyse und Empfehlungen.

### Firebase Setup

Für die Produktion mit Firebase:

1. Exportiere diesen Code in dein eigenes Projekt
2. Installiere Firebase: npm install firebase
3. Erstelle `.env.local` mit deiner Config (siehe `.env.example`)
4. Deploye Firestore Security Rules: `firebase deploy --only firestore:rules`
5. Implementiere optionale Sicherheitsmaßnahmen (siehe SECURITY_ANALYSIS.md)

Detaillierte Anleitung für Firebase-Integration:

- Authentication: signInWithEmailAndPassword für Login
- Firestore: collection/doc/getDocs für Datenzugriff
- Security Rules: Siehe `firestore.rules` für aktuelle Rules
- Storage: getStorage/uploadBytes/getDownloadURL für Bilder

ROUTING:
Für direkten Zugriff auf Quizze kannst du URL-Parameter nutzen:

- /quiz/{subjectId}/{classId}/{topicId}/{quizId}
- Die App prüft beim Start die URL und navigiert automatisch

In Firebase Hosting kannst du rewrites in firebase.json konfigurieren:
{
  "hosting": {
    "rewrites": [
      {
        "source": "/quiz/**",
        "destination": "/index.html"
      }
    ]
  }
}
*/
