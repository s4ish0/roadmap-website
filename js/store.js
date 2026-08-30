// js/store.js
// Central place for every read/write against Firestore, plus the
// localStorage-based "session" (just an anonymized student code —
// there is no Firebase Auth in this project, per the study design).

import { db } from "./firebase-config.js";
import {
  doc, getDoc, setDoc, updateDoc,
  collection, addDoc, getDocs, query, where, orderBy, serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";
import { LESSONS } from "./data.js";

const LESSON_COUNT = LESSONS.length;
const LOCAL_KEY = "codepath_student_id";
const PASS_THRESHOLD = 70; // percent required to pass a lesson assessment

/* ---------------------------------------------------------- session --- */

export function getStudentId() {
  return localStorage.getItem(LOCAL_KEY);
}
export function setStudentId(id) {
  localStorage.setItem(LOCAL_KEY, id);
}
export function clearStudentId() {
  localStorage.removeItem(LOCAL_KEY);
}

/* --------------------------------------------------------- students --- */

function blankLessonStatus() {
  const status = {};
  for (const l of LESSONS) {
    status[l.id] = { qaPassed: false, qaBest: 0, programmingPassed: false, programmingBest: 0 };
  }
  return status;
}

/**
 * Creates the student document the first time this code/section combo is
 * seen, or simply returns the existing one (so a student who clears their
 * browser can re-enter their code and resume instead of overwriting data).
 */
export async function createOrGetStudent(profile) {
  const ref = doc(db, "students", profile.studentId);
  const snap = await getDoc(ref);
  if (snap.exists()) {
    return { id: snap.id, ...snap.data() };
  }
  const data = {
    studentId: profile.studentId,
    section: profile.section,
    sex: profile.sex,
    gradeSection: profile.gradeSection,
    priorExposure: profile.priorExposure,
    createdAt: serverTimestamp(),
    preTest: null,
    postTest: null,
    unlockedLesson: 1,
    lessonStatus: blankLessonStatus(),
    surveyCompleted: false
  };
  await setDoc(ref, data);
  return { id: profile.studentId, ...data };
}

export async function fetchStudent(studentId) {
  if (!studentId) return null;
  const snap = await getDoc(doc(db, "students", studentId));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

/* ---------------------------------------------------------- pre/post --- */

export async function savePreTest(studentId, result) {
  await updateDoc(doc(db, "students", studentId), {
    preTest: { ...result, timestamp: serverTimestamp() }
  });
}

export async function savePostTest(studentId, result) {
  await updateDoc(doc(db, "students", studentId), {
    postTest: { ...result, timestamp: serverTimestamp() }
  });
}

/* --------------------------------------------------------- attempts --- */

export async function fetchAttempts(studentId, lesson, type) {
  const q = query(
    collection(db, "attempts"),
    where("studentId", "==", studentId),
    where("lesson", "==", lesson),
    where("type", "==", type)
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function fetchAllAttemptsForStudent(studentId) {
  const q = query(collection(db, "attempts"), where("studentId", "==", studentId));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

/**
 * Records one assessment attempt, updates the student's lessonStatus,
 * and — if both the Q&A and Programming assessments for this lesson are
 * now passed — unlocks the next node on the roadmap (or the post-test,
 * once the final lesson is cleared).
 */
export async function recordAttempt(student, lesson, type, result) {
  const priorAttempts = await fetchAttempts(student.id, lesson, type);
  const attemptNumber = priorAttempts.length + 1;
  const passed = result.percent >= PASS_THRESHOLD;

  await addDoc(collection(db, "attempts"), {
    studentId: student.id,
    lesson,
    type,
    attemptNumber,
    timestamp: serverTimestamp(),
    score: result.score,
    total: result.total,
    percent: result.percent,
    passed
  });

  const status = { ...(student.lessonStatus || blankLessonStatus()) };
  const current = status[lesson] || { qaPassed: false, qaBest: 0, programmingPassed: false, programmingBest: 0 };
  if (type === "qa") {
    current.qaBest = Math.max(current.qaBest || 0, result.percent);
    if (passed) current.qaPassed = true;
  } else {
    current.programmingBest = Math.max(current.programmingBest || 0, result.percent);
    if (passed) current.programmingPassed = true;
  }
  status[lesson] = current;

  let unlockedLesson = student.unlockedLesson || 1;
  if (current.qaPassed && current.programmingPassed && lesson === unlockedLesson) {
    unlockedLesson = Math.min(lesson + 1, LESSON_COUNT + 1);
  }

  await updateDoc(doc(db, "students", student.id), {
    lessonStatus: status,
    unlockedLesson
  });

  return { attemptNumber, passed, status, unlockedLesson };
}

/* ------------------------------------------------------------ survey --- */

export async function saveSurvey(studentId, responses) {
  await setDoc(doc(db, "surveyResponses", studentId), {
    studentId,
    responses,
    timestamp: serverTimestamp()
  });
  await updateDoc(doc(db, "students", studentId), { surveyCompleted: true });
}

/* ------------------------------------------------------- admin export --- */

export async function fetchAllStudents() {
  const snap = await getDocs(collection(db, "students"));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function fetchAllAttempts() {
  const snap = await getDocs(collection(db, "attempts"));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function fetchAllSurveys() {
  const snap = await getDocs(collection(db, "surveyResponses"));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export const CONFIG = { LESSON_COUNT, PASS_THRESHOLD };
