import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

// JSON import 는 import attribute 를 요구해 playwright 의 로더에서 걸린다.
// 파일로 읽는다 — 검사 대상이 '스냅샷 파일의 내용'이라 오히려 직접적이다.
const snapshot = JSON.parse(
  readFileSync(
    fileURLToPath(new URL('../../src/features/research/atlas-snapshot.json', import.meta.url)),
    'utf-8',
  ),
) as { unattachedDefects?: Array<{ id: string; severity: string }> };

/**
 * 미귀속 결함 뱃지 — /project-map
 * Issue: #289
 *
 * 왜 이 검사가 있나
 *   화면은 `pages`(=feature) 를 타고만 결함에 닿는다. 그래서 어느 feature 도
 *   데려가지 않은 결함은 **사이트에서 통째로 안 보였다.** BC-DB-01·BC-ARCH-01/02 가
 *   그 상태로 있었고 아무도 몰랐다. #289 에서 근거 없는 귀속 두 건을 지우자
 *   P1 하나가 같은 자리로 떨어지며 드러났다 — 틀린 귀속이 빈틈을 가리고 있었다.
 *
 *   뱃지를 붙이는 것과 그것이 실제로 보이는 것은 다르다. 이 저장소는 오늘
 *   "선언은 있는데 효과가 없는" 사례를 여러 번 봤다(훅·게이트·registry).
 *   그래서 데이터(스냅샷)와 화면을 대조한다.
 */

const unattached = snapshot.unattachedDefects ?? [];
const p1 = unattached.filter((d) => d.severity === 'P1').length;

test.describe('#289 미귀속 결함 뱃지', () => {
  test('스냅샷의 미귀속 결함 수가 화면에 그대로 뜬다', async ({ page }) => {
    await page.goto('/project-map');

    if (unattached.length === 0) {
      // 0 건이면 아예 그리지 않는 것이 의도다 — 늘 떠 있는 표시는 배경이 된다.
      await expect(page.locator('.research-data-badge.is-danger')).toHaveCount(0);
      return;
    }

    const badge = page.getByText(/미귀속 결함 \d+/);
    await expect(badge).toBeVisible();
    await expect(badge).toContainText(`미귀속 결함 ${unattached.length}`);

    if (p1 > 0) {
      await expect(badge).toContainText(`P1 ${p1}`);
      // P1 이 섞였으면 색으로도 구별돼야 한다. `is-danger` 는 이 뱃지에 정의된 적이
      // 없어 클래스만 붙고 아무 효과가 없었다 — 그 회귀를 막는다.
      await expect(badge).toHaveCSS('color', 'rgb(163, 56, 74)');
    }

    // 무엇이 미귀속인지 확인할 수 있어야 한다. 숫자만으로는 확인하러 갈 수 없다.
    const title = await badge.getAttribute('title');
    for (const defect of unattached) {
      expect(title, `툴팁에 ${defect.id} 가 있어야 한다`).toContain(defect.id);
    }
  });
});
