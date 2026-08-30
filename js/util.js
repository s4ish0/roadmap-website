// js/util.js

export function $(sel, root = document) { return root.querySelector(sel); }
export function $all(sel, root = document) { return [...root.querySelectorAll(sel)]; }

export function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, c => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[c]));
}

/** Grades an array of multiple-choice questions against selected option indices. */
export function gradeMCQuestions(questions, selectedIndices) {
  let score = 0;
  questions.forEach((q, i) => {
    if (selectedIndices[i] === q.correct) score++;
  });
  const total = questions.length;
  const percent = total === 0 ? 0 : Math.round((score / total) * 100);
  return { score, total, percent };
}

/** Grades fill-in-the-blank code tasks. answers = { taskIndex: { blankId: value } } */
export function gradeCodeTasks(tasks, answers) {
  let score = 0, total = 0;
  tasks.forEach((task, ti) => {
    task.blanks.forEach(blank => {
      total++;
      const given = (answers[ti]?.[blank.id] || "").trim().toLowerCase();
      const ok = blank.accepted.some(a => a.trim().toLowerCase() === given);
      if (ok) score++;
    });
  });
  const percent = total === 0 ? 0 : Math.round((score / total) * 100);
  return { score, total, percent };
}

/** Renders a template with {{blankId}} markers into HTML containing <input> fields. */
export function renderCodeTemplate(template, taskIndex) {
  let count = 0;
  const html = escapeHtml(template).replace(/\{\{(\w+)\}\}/g, (_, id) => {
    count++;
    return `<input type="text" class="blank-input" data-task="${taskIndex}" data-blank="${id}" autocomplete="off" spellcheck="false" style="width:${Math.max(3, id.length)}ch">`;
  });
  return html;
}

export function toCSV(rows) {
  if (!rows.length) return "";
  const headers = Object.keys(rows[0]);
  const escape = v => {
    if (v === null || v === undefined) return "";
    const s = typeof v === "object" ? JSON.stringify(v) : String(v);
    return `"${s.replace(/"/g, '""')}"`;
  };
  const lines = [headers.join(",")];
  for (const row of rows) {
    lines.push(headers.map(h => escape(row[h])).join(","));
  }
  return lines.join("\n");
}

export function downloadCSV(filename, csvString) {
  const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function formatTimestamp(ts) {
  if (!ts) return "";
  if (ts.toDate) return ts.toDate().toLocaleString();
  return String(ts);
}

/** Renders the shared top navigation bar into #topbar. */
export function renderTopbar(studentId) {
  const el = document.getElementById("topbar");
  if (!el) return;
  el.innerHTML = `
    <a class="brand" href="./roadmap.html"><span class="dot"></span>CodePath</a>
    <nav>
      <a href="./roadmap.html">Roadmap</a>
      <a href="./admin.html">Researcher View</a>
      ${studentId ? `<span class="student-chip">${escapeHtml(studentId)}</span>` : ""}
    </nav>
  `;
}
