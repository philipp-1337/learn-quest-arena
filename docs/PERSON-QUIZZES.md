# Person Quiz Feature Documentation

## 📖 Overview

The Person Quiz feature adds an engaging way for users to learn about German entrepreneurs through interactive quizzes. Each quiz contains 10 carefully curated questions about a person's background, achievements, and professional activities.

## 🎯 Featured Entrepreneurs

### 1. **Ben Erler**
- **Position:** Chairman of Young Founders Network
- **Company:** B. Erler Ventures UG (Viersen)
- **Current Location:** Darmstadt
- **Focus:** Startup ecosystem, TechTailor, EUpreneur
- **Quiz Icon:** 🚀 (Blue/Indigo gradient)

### 2. **Philipp Schmechel**
- **Companies:** Trimlog (Logistics-Tech), QiTech Recycling
- **Background:** Krefeld, Kiel, Darmstadt
- **Education:** Gymnasium am Stadtpark Krefeld
- **Interests:** Sailing, Triathlons, Sustainability
- **Organizations:** Startup Teens
- **Quiz Icon:** ⚡ (Green/Teal gradient)

### 3. **Katharina Zieße Suari**
- **Education:** LMU München
- **Background:** Kronberg → München
- **Entrepreneurship:** 2 Etsy shops (wire crystal jewelry, bags)
- **Interests:** Marketing, Branding, Videography
- **Organizations:** Young Founders Network Munich, Entrepreneurship Talent Akademie
- **Quiz Icon:** 🎨 (Pink/Purple gradient)

## 📁 File Structure

```
learn-quest-arena/
├── data/
│   └── person-quizzes.json          # Quiz data (30 questions)
├── scripts/
│   └── import-person-quizzes.ts     # Firestore import script
├── src/
│   └── features/
│       └── quiz-browse/
│           └── PersonQuizSelector.tsx  # Selection UI component
└── docs/
    └── PERSON-QUIZZES.md            # This file
```

## 🚀 Quick Start

### 1. Import Quiz Data to Firestore

```bash
# Install dependencies (if needed)
npm install

# Run import script
npm run import-quizzes
```

The script will:
- ✅ Check for existing quizzes (prevents duplicates)
- ✅ Validate quiz data structure
- ✅ Generate normalized IDs for organization
- ✅ Add metadata (timestamps, author info)
- ✅ Display detailed progress logs

### 2. Access the Person Quiz

Navigate to `/personen-quiz` in your browser to see the selection screen.

### 3. Start a Quiz

Click on any person card to begin their 10-question quiz.

## 💾 Data Structure

### JSON Format

```json
{
  "subject": "Personen Quiz",
  "class": "Gründer & Unternehmer",
  "topic": "Team 2026",
  "quizzes": [
    {
      "title": "Ben Erler Quiz",
      "shortTitle": "ben-erler",
      "questions": [
        {
          "question": "In welcher Stadt hat Ben Erler...",
          "answerType": "text",
          "answers": [
            {"type": "text", "content": "Viersen"},
            {"type": "text", "content": "Darmstadt"},
            {"type": "text", "content": "München"},
            {"type": "text", "content": "Berlin"}
          ],
          "correctAnswerIndex": 0
        }
      ]
    }
  ]
}
```

### Firestore Structure

```
/quizzes/{quizId}
  - id: "uuid-string"
  - title: "Ben Erler Quiz"
  - shortTitle: "ben-erler"
  - questions: Array<Question>
  - subjectId: "subject-personen-quiz"
  - subjectName: "Personen Quiz"
  - classId: "class-gruender-unternehmer"
  - className: "Gründer & Unternehmer"
  - topicId: "topic-team-2026"
  - topicName: "Team 2026"
  - hidden: false
  - createdAt: timestamp
  - updatedAt: timestamp
  - authorId: "admin-uid"
  - authorEmail: "admin@example.com"
```

## 🎨 UI Components

### PersonQuizSelector

**Location:** `src/features/quiz-browse/PersonQuizSelector.tsx`

**Features:**
- 📱 Fully responsive (mobile-first design)
- 🌙 Dark mode support
- ⚡ Smooth animations and transitions
- 🎯 Clear call-to-action buttons
- 📊 Quiz statistics display
- ♿ Accessible (ARIA labels, keyboard navigation)

**Props:** None (self-contained component)

**Route:** `/personen-quiz`

## 🔧 Import Script Details

### Environment Variables

Set these before running the import:

```bash
export FIREBASE_ADMIN_UID="your-admin-uid"
export FIREBASE_ADMIN_EMAIL="your-admin-email"
```

Or they default to:
- UID: `"admin"`
- Email: `"admin@learn-quest-arena.de"`

### Script Features

1. **Duplicate Detection**
   - Checks for existing quizzes by `shortTitle`
   - Skips quizzes that already exist

2. **Validation**
   - Ensures questions array is not empty
   - Validates data structure matches `QuizDocument`

3. **ID Generation**
   - Creates normalized, URL-safe IDs
   - Handles German umlauts (ä→ae, ö→oe, ü→ue, ß→ss)

4. **Logging**
   - Detailed progress output
   - Success/failure counts
   - Error messages with stack traces

### Running the Script

```bash
# Via npm script (recommended)
npm run import-quizzes

# Direct execution
npx tsx scripts/import-person-quizzes.ts

# With environment variables
FIREBASE_ADMIN_UID="abc123" FIREBASE_ADMIN_EMAIL="admin@example.com" npm run import-quizzes
```

## 🎓 Question Categories

Each person quiz includes questions about:

1. **Biographical Information**
   - Birthplace / hometown
   - Current residence
   - Education background

2. **Professional Activities**
   - Companies founded
   - Current positions
   - Professional focus areas

3. **Organizations & Networks**
   - Memberships
   - Initiatives
   - Community involvement

4. **Personal Interests**
   - Hobbies
   - Sports activities
   - Creative pursuits

5. **Entrepreneurial Journey**
   - Startup ecosystems
   - Business ventures
   - Professional achievements

## 📊 Statistics

- **Total Questions:** 30 (10 per person)
- **Answer Options:** 4 per question (multiple choice)
- **Question Types:** Text-based
- **Languages:** German (Deutsch)
- **Difficulty:** Beginner to Intermediate

## 🔗 Integration

### With Existing Features

✅ **Quiz Player** - Uses standard quiz player component
✅ **Progress Tracking** - Integrates with existing SRS system
✅ **XP System** - Awards XP for correct answers
✅ **User Profiles** - Tracks quiz completion and scores
✅ **Dark Mode** - Fully compatible
✅ **PWA** - Works offline after first load

### Navigation

From homepage:
```typescript
<Link to="/personen-quiz">
  <Users className="mr-2" />
  Personen Quiz
</Link>
```

From within component:
```typescript
const navigate = useNavigate();
navigate('/personen-quiz');
```

## 🧪 Testing

### Manual Testing Checklist

- [ ] Import script runs without errors
- [ ] All 3 quizzes appear in Firestore
- [ ] Selection screen displays correctly
- [ ] Quiz cards are responsive on mobile
- [ ] Dark mode works properly
- [ ] Clicking a card navigates to quiz player
- [ ] Questions load and display correctly
- [ ] Answers are validated properly
- [ ] Progress is tracked
- [ ] XP is awarded for correct answers

### Test Data

All quiz content is based on publicly available information about:
- Ben Erler (LinkedIn, company websites, startup databases)
- Philipp Schmechel (company info, LinkedIn, startup events)
- Katharina Zieße Suari (university listings, Etsy shops, entrepreneur networks)

## 🛠️ Customization

### Adding New Person Quizzes

1. **Update JSON file:**
   ```json
   {
     "title": "New Person Quiz",
     "shortTitle": "new-person",
     "questions": [/* 10 questions */]
   }
   ```

2. **Update PersonQuizSelector:**
   ```typescript
   const personQuizzes = [
     // ... existing
     {
       id: '4',
       name: 'New Person',
       shortTitle: 'new-person',
       description: 'Description...',
       icon: '🎯',
       color: 'from-orange-500 to-red-600',
     }
   ];
   ```

3. **Re-run import:**
   ```bash
   npm run import-quizzes
   ```

### Styling Customization

Colors are defined per person in `PersonQuizSelector.tsx`:

```typescript
color: 'from-blue-500 to-indigo-600'  // Tailwind gradient
```

Icons are emoji strings:
```typescript
icon: '🚀'  // Rocket for Ben Erler
```

## 📝 Maintenance

### Updating Questions

1. Edit `data/person-quizzes.json`
2. Delete existing quiz from Firestore (or change `shortTitle`)
3. Run import script again

### Monitoring

Check Firestore console for:
- Quiz document count
- Timestamp fields (createdAt, updatedAt)
- Question counts (should be 10 per quiz)

## 🔐 Security

### Firestore Rules

Person quizzes follow existing security rules:
- ✅ Read: Public (all users)
- ✅ Write: Admin only (authenticated users with admin role)

### Data Validation

Import script validates:
- Question array not empty
- Answer options present
- Correct answer index within bounds
- All required fields present

## 🌐 Localization

Currently German (Deutsch) only. To add translations:

1. Create localized JSON files
2. Update import script to handle locale
3. Add language switcher to UI
4. Update question display logic

## 🚨 Troubleshooting

### Import fails with "404 Not Found"
- Check Firebase configuration
- Verify Firestore is enabled
- Ensure you're authenticated

### Quizzes don't appear in UI
- Check Firestore console for documents
- Verify `hidden: false` in quiz data
- Clear browser cache
- Check network tab for API errors

### Questions display incorrectly
- Validate JSON structure
- Check question IDs are unique
- Verify answer array length (should be 4)
- Check `correctAnswerIndex` is 0-3

### Dark mode issues
- Verify Tailwind dark: classes
- Check theme provider is active
- Test in different browsers

## 📚 Additional Resources

- [Firestore Documentation](https://firebase.google.com/docs/firestore)
- [React Router Documentation](https://reactrouter.com/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)
- [TypeScript Documentation](https://www.typescriptlang.org/)

## 🤝 Contributing

To add more person quizzes:

1. Research the person thoroughly
2. Create 10 diverse questions
3. Verify facts with multiple sources
4. Follow existing JSON structure
5. Test thoroughly before merging
6. Update this documentation

## 📄 License

Same as main Learn Quest Arena project.

---

**Last Updated:** January 2026
**Version:** 1.0.0
**Maintainer:** Learn Quest Arena Team
