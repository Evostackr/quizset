const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'public', 'data', 'test-sets', 'quizset_bpsc_tre_set01_social_science.json');
const raw = JSON.parse(fs.readFileSync(filePath, 'utf8'));

console.log('--- BPSC TRE DATA AUDIT ---');

const subjectMapping = {
  'इतिहास (History)': 'history',
  'भूगोल (Geography)': 'geography',
  'राजव्यवस्था (Polity / Political  Science)': 'polity',
  'अर्थशास्त्र (Economics)': 'economics',
};

const issues = [];
const summary = {};

raw.subjects.forEach((subj) => {
  const sName = subj.subject;
  const sKey = subjectMapping[sName] || sName;
  summary[sKey] = {
    name: sName,
    count: subj.questions.length,
    qNumbers: [],
    answers: { A: 0, B: 0, C: 0, D: 0, E: 0, other: 0 },
  };

  const seenQNums = new Set();

  subj.questions.forEach((q) => {
    const qNum = q.question_number;
    summary[sKey].qNumbers.push(qNum);

    if (seenQNums.has(qNum)) {
      issues.push(`Duplicate question number in ${sKey}: Q${qNum}`);
    }
    seenQNums.add(qNum);

    if (!q.question || q.question.trim().length === 0) {
      issues.push(`Empty question text in ${sKey}: Q${qNum}`);
    }

    const opts = q.options;
    ['A', 'B', 'C', 'D', 'E'].forEach((letter) => {
      if (!opts || !opts[letter] || opts[letter].trim().length === 0) {
        issues.push(`Missing/empty option ${letter} in ${sKey} Q${qNum}`);
      }
    });

    if (summary[sKey].answers[q.answer] !== undefined) {
      summary[sKey].answers[q.answer]++;
    } else {
      summary[sKey].answers.other++;
      issues.push(`Unexpected answer "${q.answer}" in ${sKey} Q${qNum}`);
    }
  });
});

console.log('Summary by Subject:');
console.log(JSON.stringify(summary, null, 2));

console.log('Total Issues Found:', issues.length);
if (issues.length > 0) {
  console.log('Issues:', issues);
} else {
  console.log('All 160 questions are structurally clean and valid!');
}

