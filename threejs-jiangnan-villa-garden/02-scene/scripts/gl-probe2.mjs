import puppeteer from 'puppeteer-core';
const sets = [
  ['headful-swangle', ['--enable-unsafe-swiftshader','--use-gl=angle','--use-angle=swiftshader']],
  ['headful-default', []],
];
for (const [name, args] of sets) {
  try {
    const b = await puppeteer.launch({executablePath:'/usr/bin/google-chrome', headless:false, env:{...process.env, DISPLAY:':9'}, args:['--no-sandbox','--disable-dev-shm-usage','--window-size=1280,800',...args]});
    const p = await b.newPage();
    await p.setContent('<canvas id="c" width="64" height="64"></canvas>');
    const info = await p.evaluate(() => {
      const c = document.getElementById('c');
      const gl = c.getContext('webgl2') || c.getContext('webgl');
      if (!gl) return { ok:false };
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      return { ok:true, ver: gl.getParameter(gl.VERSION), renderer: ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : 'n/a' };
    });
    console.log(name, JSON.stringify(info));
    await b.close();
  } catch (e) { console.log(name, 'ERR', e.message.slice(0,200)); }
}
