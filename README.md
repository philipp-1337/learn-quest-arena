# Learn Quest Arena

Ein einfaches Quiz- und Lernplattform-Projekt, entwickelt mit React, TypeScript, Vite und Firebase.

## Projektstruktur

- **src/**: Hauptquellcode, unterteilt in Features, Hooks, Utils, Types und Configs
- **public/**: Statische Assets und Manifest
- **scripts/**: Hilfsskripte zur Analyse und Strukturauflistung
- **eslint-rules/**: Eigene ESLint-Regeln

## Wichtige Konfigurationsdateien

- **firebase.json**: Firebase Hosting und Funktionen-Konfiguration
- **firestore.rules**: Sicherheitsregeln für Firestore
- **firestore.indexes.json**: Firestore Index-Konfiguration
- **vite.config.ts**: Vite Build-Konfiguration
- **tailwind.config.js**: Tailwind CSS Konfiguration
- **eslint.config.js**: ESLint Konfiguration
- **tsconfig.json**: TypeScript Projekt-Konfiguration

## Installation & Start

```bash
bun install
bun run dev
```

## Deployment

```bash
bun run build && firebase deploy
```

## Features

- Quizverwaltung und -bearbeitung
- Benutzerverwaltung
- Authentifizierung
- Fortschritts- und XP-Tracking
- Responsive UI mit Tailwind CSS

## Hinweise

- Für Firebase-Funktionen und Hosting ist ein eigenes Firebase-Projekt notwendig.
- Eigene ESLint-Regeln befinden sich im Ordner `eslint-rules/`.
