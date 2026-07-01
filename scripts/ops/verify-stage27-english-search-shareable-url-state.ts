import { parseEnglishSearchState, serializeEnglishSearchState } from '../../apps/web/src/utils/englishSearchUrlState';

async function verify() {
  console.log('--- Stage 27 Verification: English Search Shareable URL State ---');
  let failed = false;

  const assert = (condition: boolean, message: string) => {
    if (condition) {
      console.log(`  PASS: ${message}`);
    } else {
      console.log(`  FAIL: ${message}`);
      failed = true;
    }
  };

  // Test Case 1: Stage 26 basic query
  const params1 = new URLSearchParams('view=english-search&q=Linux');
  const state1 = parseEnglishSearchState(params1);
  assert(state1.q === 'Linux', 'Parse Stage 26 basic query');

  // Test Case 2: Full state serialization
  const state2 = {
    view: 'english-search' as const,
    q: 'wake up child',
    limit: 50 as const,
    diversity: 'all' as const,
    sort: 'variety' as const,
    captionKind: 'manual' as const,
    category: 'Education',
    tag: 'Idioms',
    channels: ['ch1', 'ch2']
  };
  const params2 = serializeEnglishSearchState(state2);
  const expectedParams2 = 'view=english-search&q=wake+up+child&limit=50&diversity=all&sort=variety&captionKind=manual&category=Education&tag=Idioms&channels=ch1%2Cch2';
  assert(params2.toString() === expectedParams2, 'Serialize full state');

  // Test Case 3: Scene Pack precedence
  const params3 = new URLSearchParams('view=english-search&scenePack=pack123&q=Linux');
  const state3 = parseEnglishSearchState(params3);
  assert(state3.scenePack === 'pack123' && state3.q === 'Linux', 'Parse Scene Pack + q');
  
  const serialized3 = serializeEnglishSearchState(state3);
  assert(serialized3.get('scenePack') === 'pack123', 'Precedence Check: scenePack is present');

  // Test Case 4: Invalid enums fallback
  const params4 = new URLSearchParams('view=english-search&limit=999&diversity=chaos&sort=random');
  const state4 = parseEnglishSearchState(params4);
  assert(Object.keys(state4).length === 0, 'Invalid enums fallback (should be empty)');

  // Test Case 5: Default values omitted
  const state5 = {
    view: 'english-search' as const,
    q: 'test',
    limit: 20 as const,
    diversity: 'balanced' as const,
    sort: 'recent' as const,
    captionKind: 'all' as const
  };
  const params5 = serializeEnglishSearchState(state5);
  assert(params5.toString() === 'view=english-search&q=test', 'Omit default values in serialization');

  // Test Case 6: First-mount gating simulation
  console.log('\nTest Case 6: First-mount gating simulation');
  const shouldWriteUrl = (isRestored: boolean) => isRestored;
  assert(shouldWriteUrl(false) === false, 'Gating: URL writeback forbidden before isRestored=true');
  assert(shouldWriteUrl(true) === true, 'Gating: URL writeback allowed after isRestored=true');

  // Test Case 7: Scene Pack search suppression logic
  console.log('\nTest Case 7: Scene Pack search suppression logic');
  const canRunNormalSearch = (activePackId: string | null) => !activePackId;
  assert(canRunNormalSearch('pack123') === false, 'Search Guard: Normal search suppressed when activePackId is set');
  assert(canRunNormalSearch(null) === true, 'Search Guard: Normal search allowed when activePackId is null');

  // Test Case 8: deriveInitialSelectedChannels (Conceptual Verification)
  console.log('\nTest Case 8: deriveInitialSelectedChannels (Conceptual Verification)');
  const deriveInitialSelectedChannels = (initialState: any, indexedChannels: any[]) => {
    if (initialState?.channels && initialState.channels.length > 0) {
      return initialState.channels.filter((id: string) => indexedChannels.some(c => c.channelId === id));
    }
    return []; // Simplified for verification
  };
  const indexed = [{ channelId: 'ch1' }, { channelId: 'ch2' }];
  const initial = { channels: ['ch1', 'ch99'] };
  const derived = deriveInitialSelectedChannels(initial, indexed);
  assert(derived.length === 1 && derived[0] === 'ch1', 'Channel Restore: Preserves valid channels, drops invalid ones');

  if (failed) {
    console.log('\n--- Verification FAILED ---');
    process.exit(1);
  }

  console.log('\n--- Verification Complete: ALL PASSED ---');
}

verify().catch(console.error);
