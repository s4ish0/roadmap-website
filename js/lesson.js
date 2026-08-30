// js/lesson.js
import { $, renderTopbar, escapeHtml } from "./util.js";
import { LESSONS } from "./data.js";
import { getStudentId, fetchStudent } from "./store.js";

const root = $("#lesson-root");
const studentId = getStudentId();
renderTopbar(studentId);

if (!studentId) {
  window.location.href = "./index.html";
} else {
  init();
}

async function init() {
  const params = new URLSearchParams(window.location.search);
  const id = Number(params.get("id"));
  const retry = params.get("retry"); // "qa" | "programming" | null

  const lesson = LESSONS.find(l => l.id === id);
  if (!lesson) { window.location.href = "./roadmap.html"; return; }

  const student = await fetchStudent(studentId);
  if (!student) { window.location.href = "./index.html"; return; }
  if (!student.preTest) { window.location.href = "./pretest.html"; return; }

  const unlocked = student.unlockedLesson || 1;
  if (id > unlocked) {
    root.innerHTML = `<div class="banner warn">This lesson is still locked. Complete the
      lessons before it first. <a href="./roadmap.html">Back to the roadmap</a>.</div>`;
    return;
  }

  render(lesson, student, retry);
}

function render(lesson, student, retry) {
  const status = student.lessonStatus?.[lesson.id] || { qaPassed: false, qaBest: 0, programmingPassed: false, programmingBest: 0 };

  const retryBanner = retry
    ? `<div class="banner warn">You didn't quite reach 70% on the ${retry === "qa" ? "Q&amp;A" : "Programming"}
       assessment. Review the lesson below, then try again when you're ready.</div>`
    : "";

  const resourcesHtml = lesson.resources.map(r => `
    <li><a href="${r.url}" target="_blank" rel="noopener">
      <span>${escapeHtml(r.title)}</span><span class="go">Open ↗</span>
    </a></li>
  `).join("");

  root.innerHTML = `
    <div class="page-head">
      <span class="eyebrow">${escapeHtml(lesson.tag)}</span>
      <h1>${escapeHtml(lesson.title)}</h1>
      <p class="lede">${escapeHtml(lesson.summary)}</p>
    </div>

    ${retryBanner}

    <div class="card">
      ${lesson.content}
    </div>

    <div class="card">
      <h3>Go deeper</h3>
      <p class="hint">Optional — for more examples and practice beyond this page.</p>
      <ul class="list-links">${resourcesHtml}</ul>
    </div>

    <div class="card">
      <h3>Show what you've learned</h3>
      <p>Pass both assessments below with a score of 70% or higher to unlock the next lesson.</p>
      <div class="grid-2">
        <div class="card tight">
          <strong>1. Q&amp;A Assessment</strong>
          <p class="hint" style="margin-top:6px;">Multiple choice — remembering &amp; understanding.</p>
          ${status.qaPassed
            ? `<span class="badge pass">Passed · best ${status.qaBest}%</span>`
            : status.qaBest ? `<span class="badge fail">Last score ${status.qaBest}%</span>` : ""}
          <div class="btn-row">
            <a class="btn ${status.qaPassed ? "secondary" : "amber"} block" href="./assessment.html?lesson=${lesson.id}&type=qa">
              ${status.qaPassed ? "Retake (optional)" : status.qaBest ? "Try again" : "Start Q&A test"}
            </a>
          </div>
        </div>
        <div class="card tight">
          <strong>2. Programming Assessment</strong>
          <p class="hint" style="margin-top:6px;">Complete real code — applying &amp; creating.</p>
          ${status.programmingPassed
            ? `<span class="badge pass">Passed · best ${status.programmingBest}%</span>`
            : status.programmingBest ? `<span class="badge fail">Last score ${status.programmingBest}%</span>` : ""}
          <div class="btn-row">
            <a class="btn ${status.programmingPassed ? "secondary" : "amber"} block" href="./assessment.html?lesson=${lesson.id}&type=programming">
              ${status.programmingPassed ? "Retake (optional)" : status.programmingBest ? "Try again" : "Start programming test"}
            </a>
          </div>
        </div>
      </div>
    </div>

    <div class="btn-row">
      <a class="btn secondary" href="./roadmap.html">← Back to roadmap</a>
    </div>
  `;
}
