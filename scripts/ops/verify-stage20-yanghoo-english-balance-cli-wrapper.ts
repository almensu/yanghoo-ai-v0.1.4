import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import assert from 'assert';

async function run() {
  console.log('--- Verifying Stage 20: Yanghoo English Balance CLI Wrapper ---');

  const wrapperScript = '/Users/a123/claude-model/.claude-zhipu/skills/yanghoo-english-balance/scripts/balance-study-pack.mjs';
  const sceneFile = '/Users/a123/com/yanghoo205/Anything-to-English/canonical/block-system/scenes/Scene.MorningRoutine.md';
  const testId = 'morning-routine-wrapper-audit';
  const testChannelId = 'youtube-UC596VHuJ5Q11N81D6uNrrxA';

  // Ensure scene file exists
  if (!fs.existsSync(sceneFile)) {
    console.error(`Error: Scene file not found at ${sceneFile}`);
    process.exit(1);
  }

  // Ensure wrapper script exists
  if (!fs.existsSync(wrapperScript)) {
    console.error(`Error: Wrapper script not found at ${wrapperScript}`);
    process.exit(1);
  }

  console.log('1. Running wrapper command with valid channel...');
  const cmd = `node ${wrapperScript} --scene-file ${sceneFile} --id ${testId} --channels ${testChannelId} --level L2 --limit-per-query 2`;
  
  try {
    const stdout = execSync(cmd, { encoding: 'utf-8' });
    console.log('Stdout received.');
    
    const result = JSON.parse(stdout);
    console.log('JSON parsed successfully.');

    // Assert JSON fields
    assert.strictEqual(result.scene, 'Scene.MorningRoutine');
    assert.ok(result.sceneBriefPath.includes(testId));
    assert.ok(result.evidencePackPath.includes(testId));
    assert.ok(result.studyPackPath.endsWith(`${testId}.md`));
    assert.ok(result.queryCount > 0);
    assert.ok(typeof result.exampleCount === 'number');
    assert.ok(Array.isArray(result.warnings));

    console.log('✅ JSON structure validated');

    // Assert study pack file exists
    assert.ok(fs.existsSync(result.studyPackPath), 'Study pack file should exist');
    assert.ok(result.studyPackPath.startsWith('/Users/a123/com/yanghoo205/Anything-to-English/output/local/yanghoo/study-packs/'));
    console.log(`✅ Study pack created at: ${result.studyPackPath}`);

    // Assert markdown content
    const content = fs.readFileSync(result.studyPackPath, 'utf-8');
    assert.ok(content.includes('# Study Pack: Scene.MorningRoutine'));
    assert.ok(content.includes('## Real Subtitle Evidence'));
    assert.ok(content.includes('## Shadowing Queue'));
    assert.ok(content.includes('Boundary status: output-only, not canonical'));
    console.log('✅ Markdown content validated');

    // 2. Test missing selector failure
    console.log('2. Testing missing selector failure...');
    const failCmd = `node ${wrapperScript} --scene-file ${sceneFile} --id ${testId}-fail`;
    try {
      execSync(failCmd, { stdio: 'pipe' });
      assert.fail('Command should have failed without selector');
    } catch (error: any) {
      assert.ok(error.stderr.toString().includes('Provide --channel, --channels, --category, or --tag'));
      console.log('✅ Missing selector failure validated');
    }

    // 3. Test warning propagation with non-existent category
    console.log('3. Testing warning propagation with non-existent category...');
    const warnCmd = `node ${wrapperScript} --scene-file ${sceneFile} --id ${testId}-warn --category non-existent-category-123 --limit-per-query 2`;
    const warnStdout = execSync(warnCmd, { encoding: 'utf-8' });
    const warnResult = JSON.parse(warnStdout);
    
    assert.ok(Array.isArray(warnResult.warnings), 'warnings should be an array');
    assert.ok(warnResult.warnings.some((w: string) => w.includes('No channels matched criteria for search')), 
      'Should contain warning about no channels matching criteria');
    console.log('✅ Warning propagation validated');

    console.log('\n--- Stage 20 Verification PASSED ---');

  } catch (error: any) {
    console.error('Verification FAILED:');
    console.error(error.message);
    if (error.stderr) console.error(error.stderr.toString());
    process.exit(1);
  }
}

run();
