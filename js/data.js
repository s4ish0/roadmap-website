// js/data.js
// All learning content lives here, in one place, so the research team can
// review/update it without touching page logic. Content is grouped under
// the three areas measured by the pre-test/post-test:
//   Area A — Variable declaration and data types   (Lessons 1–2)
//   Area B — Control structures                    (Lessons 3–4)
//   Area C — Functions and basic logic formulation  (Lesson 5)

export const AREAS = {
  A: "Variable Declaration & Data Types",
  B: "Control Structures",
  C: "Functions & Basic Logic Formulation"
};

export const LESSONS = [
  {
    id: 1,
    area: "A",
    title: "Variable Declaration",
    tag: "Lesson 1 · Area A",
    summary: "How Java stores a piece of information under a name you choose.",
    content: `
      <p>A <strong>variable</strong> is a labeled box in the computer's memory that holds a
      value your program can read or change while it runs. Before you can use one in Java,
      you must <em>declare</em> it: tell Java what kind of value it will hold (its
      <strong>data type</strong>) and what to call it (its <strong>identifier</strong>).</p>

      <div class="code-panel">type variableName = value;

int age = 17;
double height = 1.65;
char grade = 'A';
String section = "STEM 12-A";</div>

      <p>Every declaration has three parts: the <strong>type</strong> (e.g. <code>int</code>),
      the <strong>name</strong> you choose, and — optionally, right away — the
      <strong>value</strong> assigned with <code>=</code>. A variable can also be declared
      first and assigned later:</p>
      <div class="code-panel">int score;   // declared, no value yet
score = 85;  // assigned afterwards</div>

      <h3>Naming rules</h3>
      <ul>
        <li>Must start with a letter, <code>$</code>, or <code>_</code> — never a digit.</li>
        <li>Cannot contain spaces, and cannot be a reserved keyword (<code>class</code>,
          <code>int</code>, <code>if</code>, etc.).</li>
        <li>Java is <strong>case-sensitive</strong>: <code>score</code> and <code>Score</code>
          are different variables.</li>
        <li>By convention, variable names use <strong>camelCase</strong>:
          <code>studentAge</code>, not <code>studentage</code> or <code>student_age</code>.</li>
      </ul>

      <h3>Constants</h3>
      <p>Add the keyword <code>final</code> to a declaration to make a value that cannot be
      changed after it is set — useful for things like a passing rate or a fixed section size.</p>
      <div class="code-panel">final int PASSING_RATE = 70;</div>
    `,
    resources: [
      { title: "W3Schools — Java Variables", url: "https://www.w3schools.com/java/java_variables.asp" },
      { title: "Oracle Java Tutorials — Variables", url: "https://docs.oracle.com/javase/tutorial/java/nutsandbolts/variables.html" }
    ],
    qaQuestions: [
      {
        q: "Which line correctly declares and initializes a variable in Java?",
        options: ["int 7value = 10;", "int value = 10;", "int value == 10;", "value int = 10;"],
        correct: 1
      },
      {
        q: "Java variable names are case-sensitive. Which statement is TRUE?",
        options: [
          "score and Score refer to the same variable",
          "score and Score are two different variables",
          "Case does not matter in Java at all",
          "Only the first letter of a variable name may be capitalized"
        ],
        correct: 1
      },
      {
        q: "What keyword makes a variable's value impossible to change after it is set?",
        options: ["static", "const", "final", "fixed"],
        correct: 2
      },
      {
        q: "Which of these is an INVALID Java variable name?",
        options: ["totalScore", "_temp", "2ndPlace", "isPassed"],
        correct: 2
      }
    ],
    codeTasks: [
      {
        instructions: "Declare an int variable named age with the value 17, then declare a String variable named name with the value \"Juan\".",
        template: "public class Main {\n  public static void main(String[] args) {\n    {{b1}} age = 17;\n    {{b2}} name = \"Juan\";\n    System.out.println(name + \" is \" + age);\n  }\n}",
        blanks: [
          { id: "b1", accepted: ["int"] },
          { id: "b2", accepted: ["String"] }
        ]
      },
      {
        instructions: "Complete the constant declaration so PASSING_RATE cannot be changed later, and assign it the value 70.",
        template: "public class Main {\n  public static void main(String[] args) {\n    {{b1}} int PASSING_RATE = {{b2}};\n    System.out.println(PASSING_RATE);\n  }\n}",
        blanks: [
          { id: "b1", accepted: ["final"] },
          { id: "b2", accepted: ["70"] }
        ]
      }
    ]
  },

  {
    id: 2,
    area: "A",
    title: "Data Types",
    tag: "Lesson 2 · Area A",
    summary: "The built-in kinds of values Java can store, and when to use each.",
    content: `
      <p>Java is <strong>statically typed</strong>: every variable's type is fixed the moment
      it is declared. Java groups types into two families: the eight
      <strong>primitive types</strong>, and <strong>reference types</strong> like
      <code>String</code>.</p>

      <h3>Common primitive types</h3>
      <div class="table-wrap">
        <table>
          <tr><th>Type</th><th>Stores</th><th>Example</th></tr>
          <tr><td><code>int</code></td><td>whole numbers</td><td><code>int items = 25;</code></td></tr>
          <tr><td><code>double</code></td><td>decimal numbers</td><td><code>double gpa = 92.5;</code></td></tr>
          <tr><td><code>char</code></td><td>a single character (single quotes)</td><td><code>char grade = 'A';</code></td></tr>
          <tr><td><code>boolean</code></td><td><code>true</code> or <code>false</code> only</td><td><code>boolean passed = true;</code></td></tr>
        </table>
      </div>

      <p><code>String</code>, used for text, is technically a reference type rather than a
      primitive — but beginners usually learn it alongside the primitives because it is used
      just as often:</p>
      <div class="code-panel">String studentName = "Maria";  // double quotes, capital S</div>

      <h3>Picking the right type</h3>
      <p>Ask what kind of value you are storing: a count or index → <code>int</code>; a
      measurement or average → <code>double</code>; a yes/no flag → <code>boolean</code>; a
      single letter/symbol → <code>char</code>; words or sentences → <code>String</code>.
      Choosing the correct type prevents bugs — for example, trying to do decimal math with an
      <code>int</code> will silently drop the decimal part.</p>
    `,
    resources: [
      { title: "W3Schools — Java Data Types", url: "https://www.w3schools.com/java/java_data_types.asp" },
      { title: "Oracle Java Tutorials — Primitive Data Types", url: "https://docs.oracle.com/javase/tutorial/java/nutsandbolts/datatypes.html" }
    ],
    qaQuestions: [
      {
        q: "Which data type would you use to store a student's average grade like 91.75?",
        options: ["int", "double", "char", "boolean"],
        correct: 1
      },
      {
        q: "Which of the following is NOT a valid Java primitive/text data type as written?",
        options: ["int", "boolean", "string", "char"],
        correct: 2
      },
      {
        q: "What value(s) can a boolean variable hold?",
        options: ["Any whole number", "true or false only", "Any single character", "Any text"],
        correct: 1
      },
      {
        q: "Which declaration is written correctly?",
        options: ["char initial = \"J\";", "boolean isPassed = 1;", "double average = 88.5;", "String name = 'Ana';"],
        correct: 2
      }
    ],
    codeTasks: [
      {
        instructions: "Fill in the correct data type for each variable based on the value it holds.",
        template: "public class Main {\n  public static void main(String[] args) {\n    {{b1}} price = 49.99;\n    {{b2}} isEnrolled = true;\n    {{b3}} initial = 'M';\n  }\n}",
        blanks: [
          { id: "b1", accepted: ["double", "float"] },
          { id: "b2", accepted: ["boolean"] },
          { id: "b3", accepted: ["char"] }
        ]
      },
      {
        instructions: "Complete the String declaration for a section name, using the correct type keyword and quote style (open and close with a double quote).",
        template: "public class Main {\n  public static void main(String[] args) {\n    {{b1}} section = {{b2}}STEM 12-A{{b3}};\n    System.out.println(section);\n  }\n}",
        blanks: [
          { id: "b1", accepted: ["String"] },
          { id: "b2", accepted: ["\""] },
          { id: "b3", accepted: ["\""] }
        ]
      }
    ]
  },

  {
    id: 3,
    area: "B",
    title: "Conditional Statements",
    tag: "Lesson 3 · Area B",
    summary: "Making a program choose between different actions.",
    content: `
      <p>Conditional statements let a program run different code depending on whether a
      condition is <code>true</code> or <code>false</code>.</p>

      <div class="code-panel">int score = 82;

if (score >= 70) {
    System.out.println("Passed");
} else {
    System.out.println("Failed");
}</div>

      <p>Chain more conditions with <code>else if</code> to check several possibilities in
      order — Java stops at the first condition that is true:</p>
      <div class="code-panel">if (score >= 90) {
    System.out.println("Outstanding");
} else if (score >= 70) {
    System.out.println("Passed");
} else {
    System.out.println("Failed");
}</div>

      <h3>switch — for many exact values</h3>
      <p>When you're comparing one variable against several exact values (not ranges),
      <code>switch</code> is often clearer than a long <code>else if</code> chain:</p>
      <div class="code-panel">switch (gradeLevel) {
    case 11:
        System.out.println("Junior");
        break;
    case 12:
        System.out.println("Senior");
        break;
    default:
        System.out.println("Not Senior High");
}</div>
      <p>Don't forget <code>break;</code> at the end of each case — without it, execution
      "falls through" into the next case.</p>
    `,
    resources: [
      { title: "W3Schools — Java If ... Else", url: "https://www.w3schools.com/java/java_conditions.asp" },
      { title: "W3Schools — Java Switch", url: "https://www.w3schools.com/java/java_switch.asp" }
    ],
    qaQuestions: [
      {
        q: "In an if / else if / else chain, what happens if none of the if/else-if conditions are true?",
        options: ["The program crashes", "Every block runs", "The else block runs (if present)", "Nothing at all is checked"],
        correct: 2
      },
      {
        q: "Which structure is the best fit for checking one variable against many exact, discrete values?",
        options: ["a for loop", "switch statement", "a single if statement", "a while loop"],
        correct: 1
      },
      {
        q: "What is the purpose of 'break;' inside a switch case?",
        options: [
          "It stops the entire program",
          "It exits the switch so execution doesn't fall into the next case",
          "It restarts the switch from the top",
          "It is required only in the default case"
        ],
        correct: 1
      },
      {
        q: "Given int x = 5; which block runs? if (x > 10) {A} else if (x > 3) {B} else {C}",
        options: ["A", "B", "C", "A and B"],
        correct: 1
      }
    ],
    codeTasks: [
      {
        instructions: "Complete the if/else statement so it prints \"Passed\" when score is 70 or higher, otherwise \"Failed\".",
        template: "public class Main {\n  public static void main(String[] args) {\n    int score = 74;\n    {{b1}} (score >= 70) {\n      System.out.println(\"Passed\");\n    } {{b2}} {\n      System.out.println(\"Failed\");\n    }\n  }\n}",
        blanks: [
          { id: "b1", accepted: ["if"] },
          { id: "b2", accepted: ["else"] }
        ]
      },
      {
        instructions: "Complete the switch statement so case 12 prints \"Senior\" and any other value falls to the default.",
        template: "public class Main {\n  public static void main(String[] args) {\n    int level = 12;\n    switch (level) {\n      {{b1}} 12:\n        System.out.println(\"Senior\");\n        {{b2}};\n      default:\n        System.out.println(\"Unknown\");\n    }\n  }\n}",
        blanks: [
          { id: "b1", accepted: ["case"] },
          { id: "b2", accepted: ["break"] }
        ]
      }
    ]
  },

  {
    id: 4,
    area: "B",
    title: "Loops",
    tag: "Lesson 4 · Area B",
    summary: "Repeating a block of code without copy-pasting it.",
    content: `
      <p>Loops repeat a block of code while a condition holds. Java has three main loop
      forms:</p>

      <h3>for — when you know how many times to repeat</h3>
      <div class="code-panel">for (int i = 1; i <= 5; i++) {
    System.out.println("Lesson " + i);
}</div>
      <p>The header has three parts separated by semicolons: <strong>initialization</strong>
      (<code>int i = 1</code>), <strong>condition</strong> (<code>i &lt;= 5</code>), and
      <strong>update</strong> (<code>i++</code>).</p>

      <h3>while — when the number of repeats isn't known in advance</h3>
      <div class="code-panel">int attempts = 0;
while (attempts < 3) {
    attempts++;
}</div>

      <h3>do-while — always runs at least once</h3>
      <p>The condition is checked <em>after</em> the body runs, so a <code>do-while</code>
      loop always executes its body at least one time — useful for things like "show the menu,
      then keep repeating while the user wants more."</p>
      <div class="code-panel">int i = 0;
do {
    System.out.println(i);
    i++;
} while (i < 3);</div>

      <h3>break and continue</h3>
      <p><code>break;</code> exits the loop immediately. <code>continue;</code> skips the rest
      of the current pass and moves to the next one.</p>
    `,
    resources: [
      { title: "W3Schools — Java For Loop", url: "https://www.w3schools.com/java/java_for_loop.asp" },
      { title: "W3Schools — Java While Loop", url: "https://www.w3schools.com/java/java_while_loop.asp" }
    ],
    qaQuestions: [
      {
        q: "Which loop is guaranteed to run its body at least once, even if the condition is false from the start?",
        options: ["for", "while", "do-while", "None of these"],
        correct: 2
      },
      {
        q: "In for (int i = 0; i < 4; i++), how many times does the loop body run?",
        options: ["3", "4", "5", "It runs forever"],
        correct: 1
      },
      {
        q: "What does 'continue;' do inside a loop?",
        options: [
          "Ends the loop completely",
          "Skips the rest of the current pass and moves to the next iteration",
          "Pauses the program",
          "Restarts the program"
        ],
        correct: 1
      },
      {
        q: "Which loop type best fits: \"keep asking for input until the user enters a valid section code\" (unknown number of tries)?",
        options: ["for loop", "while loop", "switch", "if statement"],
        correct: 1
      }
    ],
    codeTasks: [
      {
        instructions: "Complete the for-loop header so it prints the numbers 1 through 5.",
        template: "public class Main {\n  public static void main(String[] args) {\n    for (int i = {{b1}}; i <= {{b2}}; i++) {\n      System.out.println(i);\n    }\n  }\n}",
        blanks: [
          { id: "b1", accepted: ["1"] },
          { id: "b2", accepted: ["5"] }
        ]
      },
      {
        instructions: "Complete the while loop so it counts attempts up to (but not including) 3.",
        template: "public class Main {\n  public static void main(String[] args) {\n    int attempts = 0;\n    {{b1}} (attempts < 3) {\n      attempts{{b2}};\n    }\n    System.out.println(attempts);\n  }\n}",
        blanks: [
          { id: "b1", accepted: ["while"] },
          { id: "b2", accepted: ["++"] }
        ]
      }
    ]
  },

  {
    id: 5,
    area: "C",
    title: "Functions & Basic Logic Formulation",
    tag: "Lesson 5 · Area C",
    summary: "Packaging steps into a reusable method, and planning logic before coding.",
    content: `
      <p>A <strong>method</strong> (Java's term for a function) is a named, reusable block of
      code that performs a task. Instead of repeating the same lines everywhere they're
      needed, you write them once and <em>call</em> the method whenever it's needed.</p>

      <div class="code-panel">public static int addNumbers(int a, int b) {
    int sum = a + b;
    return sum;
}

public static void main(String[] args) {
    int total = addNumbers(5, 7);
    System.out.println(total); // 12
}</div>

      <p>A method declaration has: an access/behavior modifier (<code>public static</code>), a
      <strong>return type</strong> (<code>int</code>, or <code>void</code> if it returns
      nothing), a <strong>name</strong>, and a list of <strong>parameters</strong> in
      parentheses — the inputs the method needs to do its job. <code>return</code> sends a
      value back to wherever the method was called.</p>

      <h3>Why use functions?</h3>
      <ul>
        <li><strong>Reuse</strong> — write the logic once, call it many times.</li>
        <li><strong>Readability</strong> — <code>isPassed(score)</code> reads more clearly
          than the raw comparison repeated everywhere.</li>
        <li><strong>Isolation</strong> — a variable declared inside a method (a
          <em>local variable</em>) only exists inside that method.</li>
      </ul>

      <h3>Basic logic formulation</h3>
      <p>Before writing code, experienced programmers plan the steps first — in plain
      language or pseudocode — then translate that plan into Java. For example, before coding
      a function that checks if a student passed:</p>
      <ol>
        <li>Take the score as input.</li>
        <li>Compare it to the passing rate.</li>
        <li>Return true if it meets or exceeds it, false otherwise.</li>
      </ol>
      <div class="code-panel">public static boolean isPassed(int score) {
    return score >= 70;
}</div>
    `,
    resources: [
      { title: "W3Schools — Java Methods", url: "https://www.w3schools.com/java/java_methods.asp" }
    ],
    qaQuestions: [
      {
        q: "What keyword do you use as the return type when a method does not return any value?",
        options: ["null", "empty", "void", "none"],
        correct: 2
      },
      {
        q: "What are the inputs listed inside a method's parentheses called?",
        options: ["Arguments only", "Parameters", "Returns", "Constants"],
        correct: 1
      },
      {
        q: "A variable declared inside a method, that cannot be accessed outside of it, is called a...",
        options: ["global variable", "static variable", "local variable", "final variable"],
        correct: 2
      },
      {
        q: "Why do programmers break code into functions/methods?",
        options: [
          "To make the program run using more memory on purpose",
          "To reuse logic and make the program easier to read and maintain",
          "Because Java requires at least five methods per program",
          "To avoid using variables"
        ],
        correct: 1
      }
    ],
    codeTasks: [
      {
        instructions: "Complete the method so it takes an int score and returns true if it is 70 or above.",
        template: "public class Main {\n  public static {{b1}} isPassed(int score) {\n    {{b2}} score >= 70;\n  }\n}",
        blanks: [
          { id: "b1", accepted: ["boolean"] },
          { id: "b2", accepted: ["return"] }
        ]
      },
      {
        instructions: "Complete the method call that passes 85 as the argument to isPassed.",
        template: "public class Main {\n  public static void main(String[] args) {\n    boolean result = {{b1}}({{b2}});\n    System.out.println(result);\n  }\n}",
        blanks: [
          { id: "b1", accepted: ["isPassed"] },
          { id: "b2", accepted: ["85"] }
        ]
      }
    ]
  }
];

/* -------------------------------------------------------------------- */
/* Pre-test / Post-test bank — same coverage, used before Lesson 1 and   */
/* again after Lesson 5, so scores are directly comparable.              */
/* -------------------------------------------------------------------- */
export const PRE_POST_QUESTIONS = [
  { area: "A", q: "Which keyword declares a value that cannot be changed after it is assigned?", options: ["var", "final", "static", "const"], correct: 1 },
  { area: "A", q: "Which data type best stores a whole number such as 25 students?", options: ["int", "double", "char", "String"], correct: 0 },
  { area: "A", q: "Which of the following is an INVALID Java data type keyword as written?", options: ["int", "boolean", "string", "double"], correct: 2 },
  { area: "A", q: "Java variable names are...", options: ["not case-sensitive", "case-sensitive", "always uppercase", "always one letter"], correct: 1 },
  { area: "B", q: "Which loop always executes its body at least once?", options: ["for", "while", "do-while", "switch"], correct: 2 },
  { area: "B", q: "Which statement is used to check a single variable against many exact values?", options: ["for", "switch", "while", "return"], correct: 1 },
  { area: "B", q: "What does 'break;' do inside a loop?", options: ["Skips to the next iteration", "Ends the loop immediately", "Restarts the loop", "Pauses the program"], correct: 1 },
  { area: "B", q: "In an if / else-if / else chain, when does the final else block run?", options: ["Always", "Never", "Only when every earlier condition is false", "Only when the first condition is true"], correct: 2 },
  { area: "C", q: "What keyword is used as a method's return type when it returns nothing?", options: ["void", "null", "empty", "none"], correct: 0 },
  { area: "C", q: "What is it called when a method calls itself?", options: ["Looping", "Recursion", "Overloading", "Casting"], correct: 1 },
  { area: "C", q: "The inputs listed in a method's parentheses are called...", options: ["returns", "parameters", "constants", "loops"], correct: 1 },
  { area: "C", q: "What is one key benefit of organizing code into functions/methods?", options: ["It removes the need for variables", "It allows code to be reused and organized", "It makes programs run only once", "It disables loops"], correct: 1 }
];

/* -------------------------------------------------------------------- */
/* Usability / perception survey — 5-point Likert scale                  */
/* -------------------------------------------------------------------- */
export const SURVEY_ITEMS = [
  "The website was easy to navigate from one lesson to the next.",
  "The instructions for each lesson and assessment were clear.",
  "The roadmap layout helped me understand my progress in the course.",
  "The lesson content was easy to understand.",
  "The programming (code-completion) assessments helped me apply what I learned.",
  "I would prefer this roadmap-guided website over a traditional lecture-only approach.",
  "The website helped me understand programming fundamentals better.",
  "Overall, I am satisfied with my experience using this website."
];

export const LIKERT_LABELS = [
  "Strongly Disagree", "Disagree", "Neutral", "Agree", "Strongly Agree"
];
