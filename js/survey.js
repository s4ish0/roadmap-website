// js/survey.js
import { $, $all, renderTopbar, escapeHtml } from "./util.js";
import { SURVEY_ITEMS, LIKERT_LABELS } from "./data.js";
import { getStudentId, fetchStudent, saveSurvey } from "./store.js";

const root = $("#survey-root");
const studentId = getStudentId();
renderTopbar(studentId);

if (!studentId) {
  window.location.href = "./index.html";
} else {
  init();
}

async function init() {
  const student = await fetchStudent(studentId);
  if (!student) { window.location.href = "./index.html"; return; }
  if (!student.postTest) {
    root.innerHTML = `<div class="banner warn">Finish the post-test first.
      <a href="./roadmap.html">Back to the roadmap</a>.</div>`;
    return;
  }
  if (student.surveyCompleted) {
    showThankYou(true);
    return;
  }
  render();
}

function render() {
  root.innerHTML = `
    <div class="page-head">
      <span class="eyebrow">Last step</span>
      <h1>How was your experience?</h1>
      <p class="lede">This short, anonymous survey helps the researchers understand how
      usable and effective this website was for learning. There are no right or wrong answers.</p>
    </div>
    <form id="survey-form" class="card">
      ${SURVEY_ITEMS.map((item, i) => `
        <div class="question-block">
          <div class="q-index">Statement ${i + 1} of ${SURVEY_ITEMS.length}</div>
          <h3>${escapeHtml(item)}</h3>
          <div class="likert-row" style="flex-direction:row; flex-wrap:wrap; gap:10px;" data-item="${i}">
            ${LIKERT_LABELS.map((label, li) => `
              <label class="radio-option" style="flex:1 1 150px;">
                <input type="radio" name="s${i}" value="${li + 1}" required>
                <span>${escapeHtml(label)}</span>
              </label>
            `).join("")}
          </div>
        </div>
      `).join("")}
      <div id="survey-error" class="banner error" style="display:none;">Please answer every statement.</div>
      <div class="btn-row">
        <button type="submit" class="btn amber block">Submit Survey</button>
      </div>
    </form>
  `;

  $all(".radio-option input", root).forEach(input => {
    input.addEventListener("change", () => {
      $all(".radio-option", input.closest(".likert-row")).forEach(l => l.classList.remove("selected"));
      input.closest(".radio-option").classList.add("selected");
    });
  });

  $("#survey-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const responses = SURVEY_ITEMS.map((item, i) => {
      const checked = root.querySelector(`input[name="s${i}"]:checked`);
      return { item, value: checked ? Number(checked.value) : null };
    });
    if (responses.some(r => r.value === null)) {
      $("#survey-error").style.display = "block";
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    const submitBtn = e.target.querySelector("button[type=submit]");
    submitBtn.disabled = true;
    submitBtn.textContent = "Saving…";
    try {
      await saveSurvey(studentId, responses);
      showThankYou(false);
    } catch (err) {
      console.error(err);
      submitBtn.disabled = false;
      submitBtn.textContent = "Submit Survey";
      $("#survey-error").textContent = "Couldn't save your survey — check your connection and try again.";
      $("#survey-error").style.display = "block";
    }
  });
}

function showThankYou(alreadyDone) {
  root.innerHTML = `
    <div class="card result-panel">
      <div class="eyebrow">${alreadyDone ? "Already completed" : "All done"}</div>
      <h1>Thank you! 🎉</h1>
      <p>You've completed the pre-test, all five lessons, the post-test, and this survey.
      Your responses are helping this research study evaluate a roadmap-guided way of
      teaching programming fundamentals.</p>
      <div class="btn-row" style="justify-content:center;">
        <a class="btn amber" href="./roadmap.html">Back to your roadmap</a>
      </div>
    </div>
  `;
}
