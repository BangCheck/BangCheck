import { chromium } from 'playwright';

const BASE = 'http://localhost:5173';

const seedItems = [
  { id: 100, itemName: '도배 상태', itemType: 'DEFAULT', isEnabled: true,  displayOrder: 1 },
  { id: 101, itemName: '바닥 상태', itemType: 'DEFAULT', isEnabled: true,  displayOrder: 2 },
  { id: 102, itemName: '곰팡이',    itemType: 'DEFAULT', isEnabled: false, displayOrder: 3 },
];
let custom = []; // POSTed items live here
let postCount = 0;

const log = (...a) => console.log('[E2E]', ...a);
const assert = (cond, msg) => {
  if (!cond) { console.error('❌ FAIL:', msg); process.exitCode = 1; }
  else log('✅', msg);
};

const browser = await chromium.launch();
const ctx = await browser.newContext();
const page = await ctx.newPage();

page.on('console', m => log('PAGE>', m.type(), m.text().slice(0, 200)));
page.on('pageerror', e => log('PAGEERR>', e.message));

await ctx.route('**/api/checklist/items', async (route) => {
  await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([...seedItems, ...custom]) });
});
await ctx.route('**/api/checklist/items/all', async (route) => {
  await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([...seedItems, ...custom]) });
});
await ctx.route('**/api/checklist/types', async (route) => {
  await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) });
});
await ctx.route('**/api/checklist/items/settings', async (route) => {
  await route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
});
await ctx.route('**/api/checklist/items/custom', async (route) => {
  postCount += 1;
  const body = JSON.parse(route.request().postData() || '{}');
  // scenario: 3rd POST → 500 to trigger error surface
  if (postCount === 99) {
    return route.fulfill({ status: 500, body: '{"message":"server error"}' });
  }
  const id = 1000 + postCount;
  const item = { id, itemName: body.itemName, itemType: 'CUSTOM', isEnabled: true, displayOrder: null };
  custom.push(item);
  await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(item) });
});

// Seed auth before app load
await page.addInitScript(() => {
  localStorage.setItem('auth-storage', JSON.stringify({
    state: { user: { id: 1, nickname: 'dev' }, accessToken: 'dev-token', isLoggedIn: true },
    version: 0,
  }));
});

await page.goto(`${BASE}/custom`, { waitUntil: 'networkidle' });
log('URL:', page.url());

// Wait for form to render
const input = page.locator('input[placeholder*="초인종"]');
await input.waitFor({ timeout: 8000 });

// === Scenario 5: empty disabled ===
const addBtn = page.locator('button[aria-label="항목 추가"]');
await input.fill('');
const disabledEmpty = await addBtn.isDisabled();
assert(disabledEmpty, 'Step 5: empty input → button disabled');

// === Scenario 2: happy path "내 항목1" ===
await input.fill('내 항목1');
await addBtn.click();
await page.waitForTimeout(800);
const cardVisible = await page.locator('text=내 항목1').first().isVisible();
assert(cardVisible, 'Step 2: "내 항목1" added → card visible');
const inputCleared = (await input.inputValue()) === '';
assert(inputCleared, 'Step 2: input cleared after success');

// === Scenario 4: trim + dedupe "  내 항목1  " ===
await input.fill('  내 항목1  ');
await addBtn.click();
await page.waitForTimeout(500);
const dedupeMsg = await page.locator('text=이미 추가된 항목이에요').isVisible();
assert(dedupeMsg, 'Step 4: whitespace duplicate → "이미 추가된 항목이에요" surfaced');
const inputPreserved = (await input.inputValue()) === '  내 항목1  ';
assert(inputPreserved, 'Step 4: input preserved on failure');

// === Scenario 6: server error surface ===
// Force next POST to 500 by re-routing
await ctx.unroute('**/api/checklist/items/custom');
await ctx.route('**/api/checklist/items/custom', async (route) => {
  await route.fulfill({ status: 500, body: '{"message":"server error"}' });
});
await input.fill('실패항목');
await addBtn.click();
await page.waitForTimeout(800);
const failMsg = await page.locator('text=항목 추가에 실패했어요').isVisible();
assert(failMsg, 'Step 6: BE 500 → generic 실패 메시지 surfaced');
const failPreserved = (await input.inputValue()) === '실패항목';
assert(failPreserved, 'Step 6: input preserved after BE failure');

await browser.close();
log('DONE. postCount=', postCount, 'customAdded=', custom.length);
process.exit(process.exitCode || 0);
