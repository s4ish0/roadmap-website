# CodePath — Roadmap-Guided Java Fundamentals

A plain HTML/CSS/JavaScript website built as the intervention tool for the
study *"Evaluating the Impact of a Roadmap-Guided Learning Website on Core
Programming Fundamental Mastery of ICT-Programming Students in Gov. Juanito
Reyes Remulla Senior High School."*

No frontend framework, no Firebase Authentication, no Cloud Functions —
just static files plus the Firestore client SDK, exactly as scoped.

---

## 1. What's in this folder

```
index.html          Landing page + student intake form (first visit)
pretest.html         Baseline test, shown before Lesson 1
roadmap.html         The roadmap hub — shows all lessons + lock state
lesson.html          Lesson content + links to its two assessments
assessment.html      Q&A test OR programming (fill-in-the-blank) test
posttest.html        Same-coverage test, unlocked after Lesson 5
survey.html          8-item Likert usability/perception survey
admin.html           Researcher view: live stats + CSV export

css/style.css         All styling

js/firebase-config.js  ← EDIT THIS ONE FILE to connect your Firebase project
js/data.js              Lesson content, question banks, survey items
js/store.js             Every Firestore read/write, in one place
js/util.js              Small shared helpers (grading, CSV, DOM)
js/roadmap.js  js/lesson.js  js/assessment.js  js/prepost.js  js/survey.js  js/admin.js
                        Page-specific logic (one file per page)

firestore.rules         Example security rules (copy into your project)
```

Everything is vanilla JS using ES modules (`import`/`export`) — no build
step, no `npm install` required.

---

## 2. Firebase setup

1. Go to the [Firebase console](https://console.firebase.google.com/) and
   click **Add project**. Name it anything (e.g. `codepath-java-study`).
   You can decline Google Analytics — it isn't used here.
2. Inside the project, click **Build → Firestore Database → Create
   database**. Start in **production mode** (we provide our own rules —
   see step 4).
3. Click the **gear icon → Project settings → General**, scroll to
   *Your apps*, and click the **`</>`  (Web)** icon to register a web app.
   You do **not** need Firebase Hosting for this step — just registering
   the app is enough to get a config object.
4. Copy the `firebaseConfig` object Firebase shows you and paste it into
   **`js/firebase-config.js`**, replacing the placeholder values:
   ```js
   const firebaseConfig = {
     apiKey: "...",
     authDomain: "...",
     projectId: "...",
     storageBucket: "...",
     messagingSenderId: "...",
     appId: "..."
   };
   ```
5. In **Firestore Database → Rules**, paste the contents of
   `firestore.rules` (included in this folder) and click **Publish**.
   These rules let anyone create/update their *own* student document and
   append attempts/survey rows (no login required, matching the "no full
   authentication" requirement) but block deleting data or reading other
   students' documents from a stranger's browser. The `admin.html`
   researcher view still needs its own list/read rule — see the comments
   inside `firestore.rules` for the trade-off and a stricter alternative.
6. That's it — no Cloud Functions, no Authentication provider needs to be
   enabled.

### Firestore collections this site creates automatically

| Collection         | Document ID       | Holds |
|---------------------|--------------------|-------|
| `students`           | the student's code | profile, pre-test, post-test, progress |
| `attempts`            | auto-generated     | one row per lesson-assessment attempt |
| `surveyResponses`     | the student's code | the 8 Likert answers |

---

## 3. Running it locally

Browsers block ES module `import` statements from the `file://` protocol,
so you need *any* simple local web server. From this folder:

```bash
# Python 3 (already on most machines)
python3 -m http.server 5500

# or Node
npx http-server -p 5500
```

Then open `http://localhost:5500/index.html`.

## 4. Deploying it for real students

The easiest free option is **Firebase Hosting**, since you already have a
Firebase project:

```bash
npm install -g firebase-tools
firebase login
firebase init hosting   # choose this folder as the public directory
firebase deploy
```

Any other static host (GitHub Pages, Netlify, your school's web server)
also works — there is nothing server-side to run.

---

## 5. Changing the researcher-view password

Open `js/admin.js` and change the `ADMIN_PASSWORD` constant near the top
of the file. This is a convenience gate, **not** real security — the
actual protection is the Firestore rules. For a class-wide deployment,
tighten the rules in `firestore.rules` further (e.g. only allow reads
from a specific authenticated researcher account) before sharing the
link publicly.

---

## 6. Editing the content

All lesson text, external resource links, Q&A questions, programming
fill-in-the-blank tasks, the pre/post-test bank, and the survey items
live in **`js/data.js`**. Nothing else in the codebase needs to change to
add a question, tweak wording, or swap a resource link.

The passing threshold (default 70%) is set once, in `js/store.js`
(`PASS_THRESHOLD`).

---

## 7. A note on the "restudy" flow

When a student fails an assessment, the site does not hard-block a
retake — it routes them back to the lesson page with a banner asking
them to review the material first (`lesson.html?id=N&retry=qa`), which
matches the framework's conditional-progression logic while keeping the
implementation realistic for a Grade 12 team. Every attempt (pass or
fail) is still written to the `attempts` collection with its
`attemptNumber`, so the "restudy → retry" pattern is fully visible in the
exported data even though it isn't a hard technical lock.
