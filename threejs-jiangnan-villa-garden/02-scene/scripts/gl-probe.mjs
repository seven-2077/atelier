import puppeteer from 'puppeteer-core';
const sets = [
  ['default', []],
  ['swangle', ['--enable-unsafe-swiftshader','--use-gl=angle','--use-angle=swiftshader']],
  ['swangle-ipg', ['--enable-unsafe-swiftshader','--use-gl=angle','--use-angle=swiftshader','--in-process-gpu','--disable-gpu-sandbox']],
  ['gl-swiftshader', ['--enable-unsafe-swiftshader','--use-gl=swiftshader','--disable-gpu-sandbox']],
  ['egl', ['--enable-unsafe-swiftshader','--use-gl=egl','--disable-gpu-sandbox']],
];
for (const [name, args] of sets) {
  try {
    const b = await puppeteer.launch({executablePath:'/usr/bin/google-chrome', headless:true, args:['--no-sandbox','--disable-dev-shm-usage',...args]});
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
  } catch (e) { console.log(name, 'ERR', e.message.slice(0,120)); }
}
