import { chromium } from 'playwright';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { join, extname } from 'node:path';
import assert from 'node:assert/strict';
const root = new URL('../', import.meta.url).pathname;
const server = createServer(async (req, res) => {
  try {
    const path = new URL(req.url, 'http://localhost').pathname;
    const data = path === '/public-config.js' ? 'window.WAKUWAKU_CONFIG={worldAccess:{requireLocation:false}};' : await readFile(join(root, path));
    res.setHeader('Content-Type', ({ '.js': 'text/javascript', '.html': 'text/html', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml' })[extname(path)] || 'application/octet-stream'); res.end(data);
  } catch { res.statusCode = 404; res.end(); }
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const browser = await chromium.launch({ headless: true, channel: 'chrome' });
try {
  for (const mobile of [false, true]) for (const id of ['shisa', 'professor', 'miu', 'coral']) {
    const page = await browser.newPage({ viewport: mobile ? { width: 390, height: 844 } : { width: 1280, height: 800 } });
    const errors = []; page.on('pageerror', e => errors.push(e.message));
    page.on('console', m => { if (/THREE.*Error|VALIDATE_STATUS|shader error/i.test(m.text())) errors.push(m.text()); });
    await page.route('https://**/*', r => r.abort());
    await page.goto(`http://127.0.0.1:${server.address().port}/model-world.html?src=assets/${mobile ? 'fudo' : 'MANABI_Shibuya_3F'}.glb&avatar=${id}&qa=1`);
    await page.getByRole('button', { name: 'アバターで入る', exact: true }).click();
    await page.waitForFunction(() => JSON.parse(document.querySelector('.castle-interior')?.dataset.qa || '{}').motion, {}, { timeout: 60000 });
    const state = () => page.locator('.castle-interior').getAttribute('data-qa').then(JSON.parse);
    assert.equal((await state()).motion, id === 'shisa' ? 'still' : 'idle_03');
    await page.locator('.avatar-motion-controls summary').click();
    await page.locator('[data-idle]').selectOption('still');
    await page.waitForTimeout(100); assert.equal((await state()).motion, 'still');
    await page.locator('[data-run]').check();
    await page.locator('.castle-interior canvas').focus();
    await page.keyboard.down('w'); await page.waitForTimeout(300); assert.equal((await state()).motion, 'running');
    await page.keyboard.up('w'); await page.locator('[data-run]').uncheck();
    await page.locator('.castle-interior canvas').focus();
    await page.keyboard.down('w'); await page.waitForTimeout(300); assert.equal((await state()).motion, 'walking'); await page.keyboard.up('w');
    if (id === 'miu') {
      await page.locator('[data-idle]').selectOption('dance'); await page.waitForTimeout(150); assert.equal((await state()).motion, 'dance');
    }
    if (['shisa', 'professor'].includes(id)) {
      await page.waitForFunction(() => JSON.parse(document.querySelector('.castle-interior').dataset.qa).blink > .4, {}, { timeout: 6000 });
      await page.locator('[data-blink]').uncheck(); await page.waitForTimeout(100); assert.equal((await state()).blink, 0);
    } else assert.equal(await page.locator('[data-blink]').isDisabled(), true);
    await page.screenshot({ path: `/private/tmp/avatar-motion-${id}-${mobile ? 'mobile' : 'desktop'}.png` });
    assert.deepEqual(errors, []); await page.close(); console.log('PASS', id, mobile ? 'mobile' : 'desktop');
  }
} finally { await browser.close(); await new Promise(resolve => server.close(resolve)); }
