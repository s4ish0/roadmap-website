// js/assessment.js
import { $, $all, renderTopbar, escapeHtml, gradeMCQuestions, gradeCodeTasks, renderCodeTemplate } from "./util.js";
import { LESSONS } from "./data.js";
import { getStudentId, fetchStudent, recordAttempt } from "./store.js";

const root = $("#assessment-root");
const studentId = getStudentId();
renderTopbar(studentId);

if (!studentId) {
  window.location.href = "./index.html";
} else {
  init();
}

async function init() {
  const params = new URLSearchParams(window.location.search);
  const lessonId = Number(params.get("lesson"));
  const type = params.get("type"); // "qa" | "programming"

  const lesson = LESSONS.find(l => l.id === lessonId);
  if (!lesson || !["qa", "programming"].includes(type)) {
    window.location.href = "./roadmap.html";
    return;
  }

  const student = await fetchStudent(studentId);
  if (!student) { window.location.href = "./index.html"; return; }
  if (!student.preTest) { window.location.href = "./pretest.html"; return; }

  const unlocked = student.unlockedLesson || 1;
  if (lessonId > unlocked) {
    root.innerHTML = `<div class="banner warn">This lesson is still locked.
      <a href="./roadmap.html">Back to the roadmap</a>.</div>`;
    return;
  }

  if (type === "qa") renderQA(lesson, student);
  else renderProgramming(lesson, student);
}

/* ---------------------------------------------------------------- QA --- */

function renderQA(lesson, student) {
  const qs = lesson.qaQuestions;
  root.innerHTML = `
    <div class="page-head">
      <span class="eyebrow">${escapeHtml(lesson.tag)} · Q&amp;A Assessment</span>
      <h1>${escapeHtml(lesson.title)} — Check your understanding</h1>
      <p class="lede">Answer all questions, then submit. You need 70% to pass.</p>
    </div>
    <form id="qa-form" class="card">
      ${qs.map((q, i) => `
        <div class="question-block">
          <div class="q-index">Question ${i + 1} of ${qs.length}</div>
          <h3>${escapeHtml(q.q)}</h3>
          <div class="radio-group">
            ${q.options.map((opt, oi) => `
              <label class="radio-option">
                <input type="radio" name="q${i}" value="${oi}" required>
                <span>${escapeHtml(opt)}</span>
              </label>
            `).join("")}
          </div>
        </div>
      `).join("")}
      <div id="qa-error" class="banner error" style="display:none;">Please answer every question.</div>
      <div class="btn-row">
        <button type="submit" class="btn amber block">Submit Q&amp;A Assessment</button>
      </div>
    </form>
    <div id="result-root"></div>
  `;

  $all(".radio-option input", root).forEach(input => {
    input.addEventListener("change", () => {
      $all(".radio-option", input.closest(".radio-group")).forEach(l => l.classList.remove("selected"));
      input.closest(".radio-option").classList.add("selected");
    });
  });

  $("#qa-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const answers = qs.map((_, i) => {
      const checked = root.querySelector(`input[name="q${i}"]:checked`);
      return checked ? Number(checked.value) : -1;
    });
    if (answers.includes(-1)) {
      $("#qa-error").style.display = "block";
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    const result = gradeMCQuestions(qs, answers);
    await submitResult(e, lesson, student, "qa", result);
  });
}

/* --------------------------------------------------------- programming --- */

function renderProgramming(lesson, student) {
  const tasks = lesson.codeTasks;
  root.innerHTML = `
    <div class="page-head">
      <span class="eyebrow">${escapeHtml(lesson.tag)} · Programming Assessment</span>
      <h1>${escapeHtml(lesson.title)} — Write the code</h1>
      <p class="lede">Complete each snippet by filling in the blanks. You need 70% to pass.</p>
    </div>
    <form id="code-form" class="card">
      ${tasks.map((task, ti) => `
        <div class="question-block">
          <div class="q-index">Task ${ti + 1} of ${tasks.length}</div>
          <h3>${escapeHtml(task.instructions)}</h3>
          <div class="code-panel">${renderCodeTemplate(task.template, ti)}</div>
        </div>
      `).join("")}
      <div id="code-error" class="banner error" style="display:none;">Please fill in every blank before submitting.</div>
      <div class="btn-row">
        <button type="submit" class="btn amber block">Submit Programming Assessment</button>
      </div>
    </form>
    <div id="result-root"></div>
  `;

  $("#code-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const inputs = $all(".blank-input", root);
    const answers = {};
    let hasEmpty = false;
    inputs.forEach(inp => {
      const ti = inp.dataset.task, bid = inp.dataset.blank;
      if (!answers[ti]) answers[ti] = {};
      answers[ti][bid] = inp.value;
      if (!inp.value.trim()) hasEmpty = true;
    });
    if (hasEmpty) {
      $("#code-error").style.display = "block";
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    const result = gradeCodeTasks(tasks, answers);
    await submitResult(e, lesson, student, "programming", result);
  });
}

/* ------------------------------------------------------------- shared --- */

async function submitResult(e, lesson, student, type, result) {
  const submitBtn = e.target.querySelector("button[type=submit]");
  submitBtn.disabled = true;
  submitBtn.textContent = "Saving…";

  try {
    const outcome = await recordAttempt(student, lesson.id, type, result);
    showResult(lesson, type, result, outcome);
  } catch (err) {
    console.error(err);
    submitBtn.disabled = false;
    submitBtn.textContent = "Submit";
    const errBox = $(type === "qa" ? "#qa-error" : "#code-error");
    errBox.textContent = "Couldn't save your attempt — check your connection and try again.";
    errBox.style.display = "block";
  }
}

function showResult(lesson, type, result, outcome) {
  const form = $(type === "qa" ? "#qa-form" : "#code-form");
  form.style.display = "none";

  const typeLabel = type === "qa" ? "Q&A" : "Programming";
  const resultRoot = $("#result-root");

  if (outcome.passed) {
    const bothPassed = outcome.status[lesson.id].qaPassed && outcome.status[lesson.id].programmingPassed;
    resultRoot.innerHTML = `
      <div class="card result-panel">
        <div class="eyebrow">${typeLabel} Assessment · Attempt ${outcome.attemptNumber}</div>
        <div class="result-score pass">${result.percent}%</div>
        <p>Nice work — you passed! (${result.score}/${result.total} correct)</p>
        ${bothPassed
          ? `<p>You've completed both assessments for this lesson. ${
              outcome.unlockedLesson > lesson.id
                ? "The next step on your roadmap is now unlocked."
                : ""
            }</p>`
          : `<p>Now complete the other assessment for this lesson to unlock the next one.</p>`}
        <div class="btn-row" style="justify-content:center;">
          <a class="btn amber" href="./roadmap.html">Back to roadmap</a>
          <a class="btn secondary" href="./lesson.html?id=${lesson.id}">Back to lesson</a>
        </div>
      </div>
    `;
  } else {
    resultRoot.innerHTML = `
      <div class="card result-panel">
        <div class="eyebrow">${typeLabel} Assessment · Attempt ${outcome.attemptNumber}</div>
        <div class="result-score fail">${result.percent}%</div>
        <p>You needed 70% to pass (${result.score}/${result.total} correct). Let's review the
        lesson before trying again.</p>
        <div class="btn-row" style="justify-content:center;">
          <a class="btn amber" href="./lesson.html?id=${lesson.id}&retry=${type}">Review the lesson</a>
        </div>
      </div>
    `;
  }
  window.scrollTo({ top: 0, behavior: "smooth" });
}
