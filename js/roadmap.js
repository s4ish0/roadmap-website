// js/roadmap.js
import { $, renderTopbar, escapeHtml } from "./util.js";
import { LESSONS } from "./data.js";
import { getStudentId, fetchStudent, CONFIG } from "./store.js";

const root = $("#roadmap-root");
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
  if (!student.preTest) { window.location.href = "./pretest.html"; return; }
  render(student);
}

function nodeState(kind, args) {
  // returns { locked, current, done }
  if (kind === "lesson") {
    const { id, unlocked } = args;
    if (id < unlocked) return { locked: false, current: false, done: true };
    if (id === unlocked && unlocked <= CONFIG.LESSON_COUNT) return { locked: false, current: true, done: false };
    return { locked: true, current: false, done: false };
  }
  if (kind === "posttest") {
    const { unlocked, postTest } = args;
    if (postTest) return { locked: false, current: false, done: true };
    if (unlocked > CONFIG.LESSON_COUNT) return { locked: false, current: true, done: false };
    return { locked: true, current: false, done: false };
  }
  if (kind === "survey") {
    const { postTest, surveyCompleted } = args;
    if (surveyCompleted) return { locked: false, current: false, done: true };
    if (postTest) return { locked: false, current: true, done: false };
    return { locked: true, current: false, done: false };
  }
}

function renderNode({ href, tag, title, sub, state, badges }) {
  const cls = ["node"];
  if (state.locked) cls.push("locked");
  if (state.current) cls.push("current");
  if (state.done) cls.push("done");

  const inner = `
    <span class="tag">${escapeHtml(tag)}</span>
    <div class="node-title">${state.locked ? "🔒 " : ""}${escapeHtml(title)}</div>
    <div class="node-sub">${escapeHtml(sub)}</div>
    ${badges || ""}
  `;

  return state.locked
    ? `<div class="${cls.join(" ")}"><div class="node-box">${inner}</div></div>`
    : `<div class="${cls.join(" ")}"><a class="node-box" href="${href}">${inner}</a></div>`;
}

function statusBadges(status) {
  if (!status) return "";
  const qa = status.qaPassed
    ? `<span class="badge pass">Q&amp;A ✓ ${status.qaBest}%</span>`
    : status.qaBest ? `<span class="badge fail">Q&amp;A ${status.qaBest}%</span>` : "";
  const prog = status.programmingPassed
    ? `<span class="badge pass">Code ✓ ${status.programmingBest}%</span>`
    : status.programmingBest ? `<span class="badge fail">Code ${status.programmingBest}%</span>` : "";
  if (!qa && !prog) return "";
  return `<div>${qa} ${prog}</div>`;
}

function render(student) {
  const unlocked = student.unlockedLesson || 1;
  const spineLit = unlocked > 1 || student.postTest;

  let nodesHtml = "";

  LESSONS.forEach(lesson => {
    const state = nodeState("lesson", { id: lesson.id, unlocked });
    nodesHtml += renderNode({
      href: `./lesson.html?id=${lesson.id}`,
      tag: lesson.tag,
      title: lesson.title,
      sub: lesson.summary,
      state,
      badges: statusBadges(student.lessonStatus?.[lesson.id])
    });
  });

  const postState = nodeState("posttest", { unlocked, postTest: student.postTest });
  nodesHtml += renderNode({
    href: "./posttest.html",
    tag: "Final Assessment",
    title: "Post-Test",
    sub: "Same coverage as the pre-test — measures your growth.",
    state: postState,
    badges: student.postTest ? `<div><span class="badge pass">Scored ${student.postTest.percent}%</span></div>` : ""
  });

  const surveyState = nodeState("survey", { postTest: student.postTest, surveyCompleted: student.surveyCompleted });
  nodesHtml += renderNode({
    href: "./survey.html",
    tag: "Last step",
    title: "Usability Survey",
    sub: "A short questionnaire about your experience using this site.",
    state: surveyState,
    badges: student.surveyCompleted ? `<div><span class="badge pass">Completed</span></div>` : ""
  });

  root.innerHTML = `
    <div class="page-head">
      <span class="eyebrow">Your roadmap</span>
      <h1>Java Fundamentals</h1>
      <p class="lede">Work through each lesson in order. A lesson unlocks once you pass both
      of the previous lesson's assessments with a score of ${70}% or higher.</p>
      ${student.preTest ? `<div class="banner info">Pre-test score on file: <strong>${student.preTest.percent}%</strong></div>` : ""}
      ${student.surveyCompleted ? `<div class="banner info">You've completed the full study flow. Thank you! 🎉</div>` : ""}
    </div>
    <div class="roadmap">
      <div class="spine ${spineLit ? "lit" : ""}"></div>
      ${nodesHtml}
    </div>
  `;
}
