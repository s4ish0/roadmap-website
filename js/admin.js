// js/admin.js
//
// A lightweight, client-side "gate" for the researcher view — NOT real
// authentication (the spec explicitly says full auth isn't required).
// Firestore security rules are the real protection layer; see README.md.
// Change this password before deploying.
const ADMIN_PASSWORD = "juanitoreyes2026";

import { $, renderTopbar, toCSV, downloadCSV, formatTimestamp } from "./util.js";
import { LESSONS } from "./data.js";
import { fetchAllStudents, fetchAllAttempts, fetchAllSurveys } from "./store.js";

renderTopbar(null);
const gate = $("#gate");
const dashboard = $("#dashboard");

$("#gate-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const val = $("#gate-password").value;
  if (val === ADMIN_PASSWORD) {
    gate.style.display = "none";
    dashboard.style.display = "block";
    loadDashboard();
  } else {
    $("#gate-error").style.display = "block";
  }
});

async function loadDashboard() {
  dashboard.innerHTML = `<div class="loading">Loading data from Firestore…</div>`;
  try {
    const [students, attempts, surveys] = await Promise.all([
      fetchAllStudents(), fetchAllAttempts(), fetchAllSurveys()
    ]);
    render(students, attempts, surveys);
  } catch (err) {
    console.error(err);
    dashboard.innerHTML = `<div class="banner error">Couldn't load data from Firestore. Check
      your Firebase config and security rules (see README.md).</div>`;
  }
}

function mean(arr) {
  if (!arr.length) return null;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

function render(students, attempts, surveys) {
  const withBoth = students.filter(s => s.preTest && s.postTest);
  const preScores = withBoth.map(s => s.preTest.percent);
  const postScores = withBoth.map(s => s.postTest.percent);
  const meanPre = mean(preScores);
  const meanPost = mean(postScores);

  dashboard.innerHTML = `
    <div class="page-head">
      <span class="eyebrow">Researcher view</span>
      <h1>Study Data</h1>
      <p class="lede">Live counts pulled directly from Firestore. Use the buttons below to
      export raw data for statistical analysis (e.g., a paired t-test on pre/post scores).</p>
    </div>

    <div class="grid-2">
      <div class="card tight">
        <div class="q-index">Participants</div>
        <div class="result-score" style="font-size:2rem;">${students.length}</div>
        <p class="hint">${withBoth.length} have completed both pre-test and post-test.</p>
      </div>
      <div class="card tight">
        <div class="q-index">Mean Pre-Test → Post-Test</div>
        <div class="result-score" style="font-size:2rem;">
          ${meanPre === null ? "—" : meanPre.toFixed(1) + "%"} → ${meanPost === null ? "—" : meanPost.toFixed(1) + "%"}
        </div>
        <p class="hint">Based on the ${withBoth.length} students with both scores recorded.</p>
      </div>
    </div>

    <div class="card">
      <h3>Export raw data (CSV)</h3>
      <p class="hint">Each button downloads one Firestore collection as a CSV file.</p>
      <div class="btn-row">
        <button class="btn teal" id="exp-students">Students &amp; Pre/Post Scores</button>
        <button class="btn teal" id="exp-attempts">Per-Lesson Attempts</button>
        <button class="btn teal" id="exp-survey">Survey Responses</button>
      </div>
    </div>

    <div class="card">
      <h3>Pass rate by lesson</h3>
      <div class="table-wrap">
        <table>
          <tr><th>Lesson</th><th>Q&amp;A attempts</th><th>Q&amp;A pass rate</th><th>Programming attempts</th><th>Programming pass rate</th></tr>
          ${LESSONS.map(l => lessonRow(l, attempts)).join("")}
        </table>
      </div>
    </div>

    <div class="card">
      <h3>Students (preview)</h3>
      <div class="table-wrap">
        <table>
          <tr><th>ID</th><th>Grade &amp; Section</th><th>Sex</th><th>Prior exposure</th><th>Pre-test</th><th>Post-test</th><th>Unlocked</th><th>Survey</th></tr>
          ${students.map(s => `
            <tr>
              <td>${s.studentId ?? s.id}</td>
              <td>${s.gradeSection ?? ""}</td>
              <td>${s.sex ?? ""}</td>
              <td>${s.priorExposure ?? ""}</td>
              <td>${s.preTest ? s.preTest.percent + "%" : "—"}</td>
              <td>${s.postTest ? s.postTest.percent + "%" : "—"}</td>
              <td>Lesson ${s.unlockedLesson ?? 1}</td>
              <td>${s.surveyCompleted ? "✓" : "—"}</td>
            </tr>
          `).join("")}
        </table>
      </div>
    </div>
  `;

  $("#exp-students").addEventListener("click", () => {
    const rows = students.map(s => ({
      studentId: s.studentId ?? s.id,
      gradeSection: s.gradeSection,
      sex: s.sex,
      priorExposure: s.priorExposure,
      preTestScore: s.preTest?.score ?? "",
      preTestTotal: s.preTest?.total ?? "",
      preTestPercent: s.preTest?.percent ?? "",
      postTestScore: s.postTest?.score ?? "",
      postTestTotal: s.postTest?.total ?? "",
      postTestPercent: s.postTest?.percent ?? "",
      unlockedLesson: s.unlockedLesson ?? 1,
      surveyCompleted: s.surveyCompleted ? "yes" : "no",
      createdAt: formatTimestamp(s.createdAt)
    }));
    downloadCSV("students.csv", toCSV(rows));
  });

  $("#exp-attempts").addEventListener("click", () => {
    const rows = attempts.map(a => ({
      studentId: a.studentId,
      lesson: a.lesson,
      lessonTitle: LESSONS.find(l => l.id === a.lesson)?.title ?? "",
      type: a.type,
      attemptNumber: a.attemptNumber,
      score: a.score,
      total: a.total,
      percent: a.percent,
      passed: a.passed ? "yes" : "no",
      timestamp: formatTimestamp(a.timestamp)
    }));
    downloadCSV("attempts.csv", toCSV(rows));
  });

  $("#exp-survey").addEventListener("click", () => {
    const rows = [];
    surveys.forEach(s => {
      (s.responses || []).forEach((r, i) => {
        rows.push({
          studentId: s.studentId,
          itemNumber: i + 1,
          item: r.item,
          value: r.value,
          timestamp: formatTimestamp(s.timestamp)
        });
      });
    });
    downloadCSV("survey_responses.csv", toCSV(rows));
  });
}

function lessonRow(lesson, attempts) {
  const qa = attempts.filter(a => a.lesson === lesson.id && a.type === "qa");
  const prog = attempts.filter(a => a.lesson === lesson.id && a.type === "programming");
  const rate = arr => arr.length ? Math.round((arr.filter(a => a.passed).length / arr.length) * 100) + "%" : "—";
  return `<tr>
    <td>${lesson.title}</td>
    <td>${qa.length}</td><td>${rate(qa)}</td>
    <td>${prog.length}</td><td>${rate(prog)}</td>
  </tr>`;
}
