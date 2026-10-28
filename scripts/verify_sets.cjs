const fs = require('fs');
const path = require('path');

// Dynamically compile or test using the built or direct logic
const manifestPath = path.join(__dirname, '..', 'public', 'data', 'test-sets.json');
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

console.log('=== TEST SETS VERIFICATION ===');
console.log('Manifest testSets count:', manifest.testSets.length);

manifest.testSets.forEach((setEntry, i) => {
  console.log(`\nChecking Set [${i + 1}]: ${setEntry.id} (${setEntry.title})`);
  console.log(`File path: ${setEntry.file}`);
  
  const fullFilePath = path.join(__dirname, '..', 'public', setEntry.file);
  if (!fs.existsSync(fullFilePath)) {
    console.error(`ERROR: File does not exist at ${fullFilePath}`);
    process.exit(1);
  }

  const rawData = JSON.parse(fs.readFileSync(fullFilePath, 'utf8'));
  console.log('File size:', fs.statSync(fullFilePath).size, 'bytes');

  if (setEntry.id === 'bpsc-tre-set01-social-science') {
    if (!rawData.subjects || rawData.subjects.length !== 4) {
      console.error('ERROR: Set 01 subjects missing or length != 4');
      process.exit(1);
    }
    const totalQ = rawData.subjects.reduce((sum, s) => sum + s.questions.length, 0);
    console.log(`Set 01 raw questions count: ${totalQ}`);
    if (totalQ !== 160) {
      console.error('ERROR: Set 01 question count != 160');
      process.exit(1);
    }
  } else if (setEntry.id === 'bpsc-tre-set02-social-science') {
    if (!rawData.social_science_set_02) {
      console.error('ERROR: Set 02 missing social_science_set_02 key');
      process.exit(1);
    }
    const root = rawData.social_science_set_02;
    const expectedKeys = ['itihas', 'bhugol', 'rajvyavastha', 'arthashastra'];
    let totalQ = 0;
    expectedKeys.forEach((k) => {
      if (!Array.isArray(root[k])) {
        console.error(`ERROR: Set 02 missing array for ${k}`);
        process.exit(1);
      }
      console.log(`  - Subject ${k}: ${root[k].length} questions`);
      totalQ += root[k].length;
    });
    console.log(`Set 02 raw questions count: ${totalQ}`);
    if (totalQ !== 160) {
      console.error('ERROR: Set 02 question count != 160');
      process.exit(1);
    }
  }
});

console.log('\nAll files in catalogue verified successfully!');
