const fs = require('fs');

const filePath = 'C:/Users/ujwal/.gemini/antigravity/brain/93584491-c50e-490c-9f64-cf449055ce9d/.user_uploaded/media_1793185588582_c5df4df6.json';
const raw = JSON.parse(fs.readFileSync(filePath, 'utf8'));

console.log('--- SET 02 DATA AUDIT ---');

const subjectKeyMapping = {
  itihas: { id: 'history', name: 'History', hindi: 'इतिहास' },
  bhugol: { id: 'geography', name: 'Geography', hindi: 'भूगोल' },
  rajvyavastha: { id: 'polity', name: 'Polity', hindi: 'राज्यव्यवस्था' },
  arthashastra: { id: 'economics', name: 'Economics', hindi: 'अर्थव्यवस्था' },
};

const issues = [];
const summary = {};

const root = raw.social_science_set_02;
if (!root) {
  console.error('Missing root key social_science_set_02');
  process.exit(1);
}

for (const [key, mapping] of Object.entries(subjectKeyMapping)) {
  const qList = root[key];
  if (!Array.isArray(qList)) {
    issues.push(`Missing or non-array subject list for "${key}"`);
    continue;
  }

  summary[key] = {
    canonicalId: mapping.id,
    canonicalName: mapping.name,
    hindiName: mapping.hindi,
    count: qList.length,
    qNumbers: [],
    minQ: Infinity,
    maxQ: -Infinity,
    answers: { A: 0, B: 0, C: 0, D: 0, E: 0, other: 0 },
  };

  const seenQNums = new Set();

  qList.forEach((q, idx) => {
    const qNum = q.question_number;
    summary[key].qNumbers.push(qNum);
    if (qNum < summary[key].minQ) summary[key].minQ = qNum;
    if (qNum > summary[key].maxQ) summary[key].maxQ = qNum;

    if (seenQNums.has(qNum)) {
      issues.push(`Duplicate question number in ${key}: Q${qNum}`);
    }
    seenQNums.add(qNum);

    if (!q.question || typeof q.question !== 'string' || q.question.trim().length === 0) {
      issues.push(`Empty question text in ${key}: idx ${idx} Q${qNum}`);
    }

    const opts = q.options;
    if (!opts || typeof opts !== 'object') {
      issues.push(`Invalid options object in ${key}: Q${qNum}`);
    } else {
      ['A', 'B', 'C', 'D', 'E'].forEach((letter) => {
        if (!opts[letter] || typeof opts[letter] !== 'string' || opts[letter].trim().length === 0) {
          issues.push(`Missing/empty option ${letter} in ${key} Q${qNum}`);
        }
      });
    }

    const ans = q.answer;
    if (typeof ans === 'string' && ['A', 'B', 'C', 'D', 'E'].includes(ans.trim().toUpperCase())) {
      summary[key].answers[ans.trim().toUpperCase()]++;
    } else {
      summary[key].answers.other++;
      issues.push(`Unexpected answer "${ans}" in ${key} Q${qNum}`);
    }
  });
}

console.log('Summary by Subject:');
console.log(JSON.stringify(summary, null, 2));

console.log('Total Issues Found:', issues.length);
if (issues.length > 0) {
  console.log('Issues:', issues);
} else {
  console.log('All 160 questions in Set 02 are structurally clean and valid!');
}
