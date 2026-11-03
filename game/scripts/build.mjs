import { build } from 'esbuild';
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
// 僅執行打包，不啟動或提供 HTTP 伺服器。
const result = await build({
  absWorkingDir: root,
  entryPoints: ['main.js'],
  bundle: true,
  format: 'iife',
  platform: 'browser',
  target: 'es2022',
  minify: true,
  legalComments: 'inline',
  write: false,
  metafile: true,
});
if (result.outputFiles.length !== 1 || Object.values(result.metafile.outputs).some(output => output.imports.length)) {
  throw new Error('單檔輸出不能依賴外部腳本。');
}
const [template, css, license] = await Promise.all([
  readFile(path.join(root, 'page-template.html'), 'utf8'),
  readFile(path.join(root, 'styles.css'), 'utf8'),
  readFile(path.join(root, 'node_modules/three/LICENSE'), 'utf8'),
]);
for (const marker of ['<!-- INLINE_CSS -->', '<!-- INLINE_JS -->']) {
  if (template.split(marker).length !== 2) throw new Error(`入口模板必須包含一個 ${marker}`);
}
const html = template
  .replace('<!-- INLINE_CSS -->', () => `<style>${css.replace(/<\/style/gi, '<\\/style')}</style>`)
  .replace('<!-- INLINE_JS -->', () => `<script>\n${result.outputFiles[0].text.replace(/<\/script/gi, '<\\/script')}\n</script>`)
  .replace('</head>', () => `<!-- 本檔案可直接雙擊離線開啟。Three.js 授權：\n${license}\n-->\n</head>`);
await writeFile(path.join(root, 'index.html'), html);
console.log('已更新 game/index.html，可直接雙擊開啟。');
