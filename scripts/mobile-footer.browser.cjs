// Focused informational-footer regression, not a release certification.
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {pathToFileURL}=require('node:url'),{chromium}=require('playwright');
const cfg={"slug": "queue-board", "bp": 600, "end": "helpOffline", "badge": "localBadge", "nav": ".mobile-session-nav"};
const evidence=path.resolve('test-results/mobile-footer');
// Check rendered geometry, including clipping by an ancestor (isVisible alone misses it).
async function auditHeader(page, label) {
  const badge = page.locator('header #versionBadge');
  assert.equal(await badge.textContent(), 'v' + require('../app.config.json').version, label + ': current header version');
  assert.equal(await badge.isVisible(), true, label + ': version visible');
  const clipped = await badge.evaluate(el => {
    const r = el.getBoundingClientRect(), problems = [];
    if (r.width <= 0 || r.height <= 0 || r.left < -1 || r.right > innerWidth + 1 || r.top < -1 || r.bottom > innerHeight + 1) problems.push('outside viewport');
    if (el.scrollWidth > el.clientWidth + 1) problems.push('version text clipped');
    for (let p = el.parentElement; p; p = p.parentElement) {
      const s = getComputedStyle(p), b = p.getBoundingClientRect();
      if (/hidden|clip|auto|scroll/.test(s.overflowX) && (r.left < b.left - 1 || r.right > b.right + 1)) problems.push('ancestor clips x: ' + p.className);
      if (/hidden|clip|auto|scroll/.test(s.overflowY) && (r.top < b.top - 1 || r.bottom > b.bottom + 1)) problems.push('ancestor clips y: ' + p.className);
    }
    return problems;
  });
  assert.deepEqual(clipped, [], label + ': complete header version remains readable');
  const help = page.locator('#helpButton svg');
  assert.equal(await help.isVisible(), true, label + ': Help icon visible');
  assert.ok(await help.evaluate(svg => {
    const paths = [...svg.querySelectorAll('path')], shape = paths.map(p => p.getAttribute('d')).join(' ');
    return /[aAcC]/.test(shape) && paths.some(p => /[hH]\.01/.test(p.getAttribute('d')) && getComputedStyle(p).strokeLinecap === 'round') && svg.getBBox().width > 0;
  }), label + ': question-mark curve and painted dot, not information icon');
  const shield = page.locator('.local-badge svg');
  if (await shield.count()) {
    assert.ok(await shield.evaluate(svg => [...svg.querySelectorAll('path')].some(p => /^M12 3 5 6/.test(p.getAttribute('d')))), label + ': local-processing shield');
  }
}

async function main(){
 fs.mkdirSync(evidence,{recursive:true});const browser=await chromium.launch();
 try{for(const language of ['ja','en'])for(const [width,height,touch]of [[1360,900,false],[cfg.bp+1,568,false],[cfg.bp,568,false],[320,568,false],[360,640,false],[390,844,false],[393,252,false],...(cfg.slug==='photo-collage'?[[900,500,true]]:[])]){
 const context=await browser.newContext({viewport:{width,height},locale:language,reducedMotion:'reduce',hasTouch:touch});
 const page=await context.newPage(),errors=[],requests=[],label=`${language}-${width}x${height}${touch?'-coarse':''}`;
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});page.on('request',r=>{if(/^https?:/.test(r.url()))requests.push(r.url());});
 try{
 await page.goto(pathToFileURL(path.resolve(__dirname,'../dist/index.html')).href);
 await page.locator('#helpButton').waitFor();
 if(await page.locator('html').getAttribute('lang')!==language)await page.locator('#languageButton').click();
 const badge=page.locator('[data-i18n="'+cfg.badge+'"]');
 assert.equal((await badge.textContent()).trim(),language==='ja'?'完全ローカル処理':'Fully local processing');
 const phone=width<=cfg.bp||(cfg.slug==='photo-collage'&&touch&&height<=520);
 assert.equal(await page.locator('body > footer').isVisible(),!phone,label+': footer');
 assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),label+': page width');
 if(cfg.slug!=='queue-board')assert.equal(await page.locator(cfg.nav).isVisible(),cfg.slug==='reveal-sheet'||phone,label+': functional navigation preserved');
 if([1360,320].includes(width))await page.screenshot({path:path.join(evidence,label+'.png')});
 await auditHeader(page, label);
        await page.locator('#helpButton').click();
        const visibleHelpText = await page.locator('#helpDialog').innerText();
        assert.doesNotMatch(visibleHelpText, /(?:EN\s*\/\s*JA|JA\s*[\/／]\s*EN|ヘッダーのEN|Use EN in the header)/, label + ': redundant language instructions removed');
        assert.match(visibleHelpText, language === 'ja' ? /待ち列・呼び出し状態・履歴の絞り込み・CSVの保存範囲とファイル名/ : /queue and call state, History filters, CSV scope, and the filename/i, label + ': useful adjacent Help guidance retained');

 await page.locator('#helpDialog .dialog-body').evaluate(el=>{el.scrollTop=el.scrollHeight;});
 const bounds=await page.locator('[data-i18n="'+cfg.end+'"]').evaluate(el=>{const range=document.createRange(),t=el.firstChild;range.setStart(t,t.textContent.length-1);range.setEnd(t,t.textContent.length);const r=range.getBoundingClientRect();let top=0,bottom=innerHeight;for(let p=el.parentElement;p;p=p.parentElement){const s=getComputedStyle(p);if(/auto|scroll|hidden|clip/.test(s.overflowY)){const b=p.getBoundingClientRect();top=Math.max(top,b.top);bottom=Math.min(bottom,b.bottom);}}return{top:r.top,bottom:r.bottom,clipTop:top,clipBottom:bottom};});
 assert.ok(bounds.top>=bounds.clipTop-1&&bounds.bottom<=bounds.clipBottom+1,label+': Help end reachable '+JSON.stringify(bounds));
 const header=await page.locator('#helpDialog .dialog-header').boundingBox();assert.ok(header&&header.y>=0&&header.y+header.height<=height,label+': Help header visible');
 await page.keyboard.press('Escape');assert.equal(await page.locator('#helpDialog').isVisible(),false,label+': Escape closes Help');
 await page.locator('#helpButton').click();await page.locator('#closeHelpButton').click();assert.equal(await page.locator('#helpDialog').isVisible(),false,label+': close');
 assert.deepEqual(errors,[],label+': runtime errors');assert.deepEqual(requests,[],label+': external requests');console.log('PASS '+label);
 }catch(error){await page.screenshot({path:path.join(evidence,'failure-'+label+'.png')}).catch(()=>{});throw error;}finally{await context.close();}
 }}finally{await browser.close();}
}
main().catch(error=>{console.error(error);process.exitCode=1;});
