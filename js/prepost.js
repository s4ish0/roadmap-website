// js/prepost.js
// Shared logic for pretest.html and posttest.html. Both tests draw from
// the same question bank (PRE_POST_QUESTIONS) so scores are comparable.

import { $, $all, renderTopbar, gradeMCQuestions, escapeHtml } from "./util.js";
import { PRE_POST_QUESTIONS, AREAS } from "./data.js";
import { getStudentId, fetchStudent, savePreTest, savePostTest, CONFIG } from "./store.js";

export async function initPrePostTest(mode) {
  const root = $("#test-root");
  const studentId = getStudentId();
  renderTopbar(studentId);

  if (!studentId) {
    window.location.href = "./index.html";
    return;
  }

  const student = await fetchStudent(studentId);
  if (!student) {
    window.location.href = "./index.html";
    return;
  }

  if (mode === "pre") {
    if (student.preTest) { window.location.href = "./roadmap.html"; return; }
  } else {
    if (student.postTest) { window.location.href = "./survey.html"; return; }
    if ((student.unlockedLesson || 1) <= CONFIG.LESSON_COUNT) {
      root.innerHTML = `
        <div class="banner warn">You need to finish and pass all ${CONFIG.LESSON_COUNT} lessons
        before taking the post-test. <a href="./roadmap.html">Back to the roadmap</a>.</div>`;
      return;
    }
  }

  renderForm(root, mode, student);
}

function renderForm(root, mode, student) {
  const title = mode === "pre" ? "Baseline Pre-Test" : "Post-Test";
  const blurb = mode === "pre"
    ? "This short test measures what you already know before any lessons. There's no penalty for not knowing an answer yet — just do your best."
    : "This is the same-coverage test you took before Lesson 1. It measures how much you've learned.";

  const questionsHtml = PRE_POST_QUESTIONS.map((q, i) => `
    <div class="question-block">
      <div class="q-index">Question ${i + 1} of ${PRE_POST_QUESTIONS.length} · ${AREAS[q.area]}</div>
      <h3>${escapeHtml(q.q)}</h3>
      <div class="radio-group" data-qi="${i}">
        ${q.options.map((opt, oi) => `
          <label class="radio-option">
            <input type="radio" name="q${i}" value="${oi}" required>
            <span>${escapeHtml(opt)}</span>
          </label>
        `).join("")}
      </div>
    </div>
  `).join("");

  root.innerHTML = `
    <div class="page-head">
      <span class="eyebrow">${mode === "pre" ? "Before Lesson 1" : "After Lesson 5"}</span>
      <h1>${title}</h1>
      <p class="lede">${blurb}</p>
    </div>
    <form id="test-form" class="card">
      ${questionsHtml}
      <div id="test-error" class="banner error" style="display:none;">Please answer every question before submitting.</div>
      <div class="btn-row">
        <button type="submit" class="btn amber block">Submit ${title}</button>
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

  $("#test-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const answers = PRE_POST_QUESTIONS.map((_, i) => {
      const checked = root.querySelector(`input[name="q${i}"]:checked`);
      return checked ? Number(checked.value) : -1;
    });

    if (answers.includes(-1)) {
      $("#test-error").style.display = "block";
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    $("#test-error").style.display = "none";

    const submitBtn = e.target.querySelector("button[type=submit]");
    submitBtn.disabled = true;
    submitBtn.textContent = "Saving…";

    const result = gradeMCQuestions(PRE_POST_QUESTIONS, answers);

    try {
      if (mode === "pre") {
        await savePreTest(student.id, result);
      } else {
        await savePostTest(student.id, result);
      }
      showResult(root, mode, result);
    } catch (err) {
      console.error(err);
      submitBtn.disabled = false;
      submitBtn.textContent = `Submit ${title}`;
      $("#test-error").textContent = "Couldn't save your result — check your connection and try again.";
      $("#test-error").style.display = "block";
    }
  });
}

function showResult(root, mode, result) {
  root.innerHTML = `
    <div class="card result-panel">
      <div class="eyebrow">${mode === "pre" ? "Pre-Test" : "Post-Test"} recorded</div>
      <div class="result-score">${result.percent}%</div>
      <p>You answered ${result.score} out of ${result.total} correctly. This score has been
      saved for the research study.</p>
      <div class="btn-row" style="justify-content:center;">
        ${mode === "pre"
          ? `<a class="btn amber" href="./roadmap.html">Start Lesson 1</a>`
          : `<a class="btn amber" href="./survey.html">Continue to the short survey</a>`}
      </div>
    </div>
  `;
}
