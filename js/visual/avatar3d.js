(function(){
  const HEROES={
    codex:{name:'Codex',gender:'male',skin:0xf2c7a8,armor:0x2468a8,armor2:0x102e55,trim:0xe0b44e,cloth:0x171d2b,shield:0x1688c4,energy:0x4fe8ff,hair:0x4a2a1a,weapon:'sword'},
    logica:{name:'Lógica',gender:'female',skin:0xf0c0a8,armor:0x7b43a7,armor2:0x34204f,trim:0xf0c65b,cloth:0x21162f,shield:0xd25df2,energy:0xff86e8,hair:0x21120d,weapon:'staff'},
    proyecto:{name:'Proyecto',gender:'male',skin:0x75442d,armor:0x287854,armor2:0x143d2d,trim:0xe0ad4f,cloth:0x1b1719,shield:0xc84a3c,energy:0x59ffc2,hair:0x120f0d,weapon:'hammer'}
  };
  const mat=(n,metal=.28,rough=.5)=>new THREE.MeshStandardMaterial({color:n,metalness:metal,roughness:rough});
  function fallback(canvas,id,items){
    const ctx=canvas.getContext('2d');if(!ctx)return;
    const r=canvas.getBoundingClientRect(),w=Math.max(260,r.width||320),h=Math.max(280,r.height||320);canvas.width=w*devicePixelRatio;canvas.height=h*devicePixelRatio;ctx.scale(devicePixelRatio,devicePixelRatio);
    const c=HEROES[id]||HEROES.codex;const skin='#'+c.skin.toString(16).padStart(6,'0'),armor='#'+c.armor.toString(16).padStart(6,'0'),trim='#'+c.trim.toString(16).padStart(6,'0');
    ctx.clearRect(0,0,w,h);const g=ctx.createRadialGradient(w/2,h*.25,10,w/2,h*.6,w*.55);g.addColorStop(0,'#164b73');g.addColorStop(1,'#03101d');ctx.fillStyle=g;ctx.fillRect(0,0,w,h);
    ctx.fillStyle='rgba(0,0,0,.35)';ctx.beginPath();ctx.ellipse(w/2,h*.86,w*.25,h*.05,0,0,Math.PI*2);ctx.fill();
    const cx=w/2, sy=h*.57;ctx.fillStyle=armor;ctx.beginPath();ctx.roundRect(cx-w*.18,sy-h*.18,w*.36,h*.31,18);ctx.fill();
    ctx.fillStyle=skin;ctx.beginPath();ctx.arc(cx,sy-h*.27,w*.12,0,Math.PI*2);ctx.fill();
    ctx.fillStyle=trim;ctx.fillRect(cx-w*.14,sy-h*.41,w*.28,h*.055);ctx.fillStyle='#101722';ctx.fillRect(cx-w*.15,sy-h*.37,w*.3,h*.045);
    ctx.fillStyle=armor;ctx.fillRect(cx-w*.29,sy-h*.08,w*.58,h*.07);
    ctx.fillStyle=trim;ctx.fillRect(cx-w*.25,sy+h*.11,w*.18,h*.07);ctx.fillRect(cx+w*.07,sy+h*.11,w*.18,h*.07);
    ctx.strokeStyle=trim;ctx.lineWidth=9;ctx.beginPath();if(c.weapon==='sword'){ctx.moveTo(cx+w*.28,sy);ctx.lineTo(cx+w*.42,sy-h*.32)}else if(c.weapon==='hammer'){ctx.moveTo(cx+w*.31,sy);ctx.lineTo(cx+w*.45,sy-h*.25)}else{ctx.moveTo(cx+w*.3,sy);ctx.lineTo(cx+w*.34,sy-h*.34)}ctx.stroke();
    if(c.weapon==='hammer'){ctx.fillStyle=trim;ctx.fillRect(cx+w*.39,sy-h*.3,w*.12,h*.08)} else if(c.weapon==='staff'){ctx.fillStyle='#ff86e8';ctx.beginPath();ctx.arc(cx+w*.34,sy-h*.38,w*.045,0,Math.PI*2);ctx.fill()}
    if(items.includes('visor')){ctx.fillStyle='#5ef3ff';ctx.fillRect(cx-w*.14,sy-h*.35,w*.28,h*.035)}
    if(items.includes('capa')){ctx.fillStyle=armor;ctx.globalAlpha=.75;ctx.beginPath();ctx.moveTo(cx-w*.18,sy-h*.13);ctx.lineTo(cx-w*.34,sy+h*.25);ctx.lineTo(cx+w*.34,sy+h*.25);ctx.lineTo(cx+w*.18,sy-h*.13);ctx.fill();ctx.globalAlpha=1}
    ctx.fillStyle='white';ctx.font='700 14px Arial';ctx.textAlign='center';ctx.fillText(`${c.name} · Guerrero del Código`,cx,h-18);
  }
  function start(canvas){
    if(!canvas)return;
    const id=canvas.dataset.avatar||'codex',c=HEROES[id]||HEROES.codex,items=(canvas.dataset.equippedItems||'').split(',').filter(Boolean);
    if(!window.THREE){fallback(canvas,id,items);return}
    const scene=new THREE.Scene();scene.background=new THREE.Color(0x04101d);
    const camera=new THREE.PerspectiveCamera(30,1,.1,100);camera.position.set(0,1.18,6.5);
    const renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true});renderer.setPixelRatio(Math.min(devicePixelRatio||1,2));renderer.outputColorSpace=THREE.SRGBColorSpace;
    const root=new THREE.Group();root.position.y=-.18;scene.add(root);scene.add(new THREE.HemisphereLight(0x9edfff,0x06101b,2.2));
    const key=new THREE.DirectionalLight(0xffe6c5,3.3);key.position.set(3,5,4);scene.add(key);const rim=new THREE.PointLight(c.energy,2.6,8);rim.position.set(-2,2,2);scene.add(rim);
    const armor=mat(c.armor,.58,.32),armor2=mat(c.armor2,.5,.42),trim=mat(c.trim,.72,.25),cloth=mat(c.cloth,.08,.72),skin=mat(c.skin,.02,.72),steel=mat(0xb8c7d8,.84,.2),dark=mat(0x09111b,.18,.42),energy=mat(c.energy,.25,.16),hair=mat(c.hair,.02,.82),shield=mat(c.shield,.58,.28);
    const accGroup=new THREE.Group();root.add(accGroup),animated=[];
    const add=o=>(root.add(o),o),box=(s,m,p)=>{const o=new THREE.Mesh(new THREE.BoxGeometry(...s),m);o.position.set(...p);add(o);return o},cyl=(r1,r2,h,m,p,seg=18)=>{const o=new THREE.Mesh(new THREE.CylinderGeometry(r1,r2,h,seg),m);o.position.set(...p);add(o);return o},sphere=(r,m,p)=>{const o=new THREE.Mesh(new THREE.SphereGeometry(r,20,14),m);o.position.set(...p);add(o);return o};
    const shadow=new THREE.Mesh(new THREE.CircleGeometry(1.42,32),new THREE.MeshBasicMaterial({color:0x000000,transparent:true,opacity:.34}));shadow.rotation.x=-Math.PI/2;shadow.position.y=-1.7;add(shadow);
    box([.34,.8,.34],cloth,[-.31,-.86,0]);box([.34,.8,.34],cloth,[.31,-.86,0]);box([.56,.27,.76],steel,[-.31,-1.34,.13]);box([.56,.27,.76],steel,[.31,-1.34,.13]);
    cyl(.67,.57,1.1,armor,[0,-.02,0]);box([1.05,.13,.62],trim,[0,.02,.53]);box([.82,.13,.12],armor2,[0,.31,.58]);const emblem=sphere(.13,energy,[0,.05,.64]);animated.push(emblem);
    const sh1=cyl(.25,.34,.34,trim,[-.72,.38,0]);sh1.rotation.z=Math.PI/2;const sh2=cyl(.25,.34,.34,trim,[.72,.38,0]);sh2.rotation.z=Math.PI/2;
    box([.29,.72,.29],armor2,[-.72,.02,0]);box([.29,.72,.29],armor2,[.72,.02,0]);box([.34,.2,.36],trim,[-.72,-.39,0]);box([.34,.2,.36],trim,[.72,-.39,0]);
    cyl(.17,.17,.22,skin,[0,.62,0]);sphere(.42,skin,[0,1.08,0]);
    if(c.gender==='female'){sphere(.47,hair,[0,1.18,-.03]);const pony=new THREE.Mesh(new THREE.SphereGeometry(.2,16,12),hair);pony.position.set(.43,1.18,-.05);add(pony);const braid=new THREE.Mesh(new THREE.CylinderGeometry(.08,.12,.72,12),hair);braid.position.set(.5,.86,-.04);braid.rotation.z=-.3;add(braid)}else{sphere(.43,hair,[0,1.22,-.04]);box([.74,.15,.2],hair,[0,1.38,.03])}
    cyl(.55,.49,.28,steel,[0,1.43,0]);box([.9,.12,.52],dark,[0,1.37,.25]);box([.12,.46,.16],trim,[0,1.72,.02]);
    const crest=new THREE.Mesh(new THREE.ConeGeometry(c.gender==='female'?.13:.1,.42,10),energy);crest.position.set(0,1.9,0);add(crest);
    const cape=new THREE.Mesh(new THREE.PlaneGeometry(1.5,1.9),cloth);cape.position.set(0,.08,-.44);cape.rotation.x=.08;add(cape);
    const makeWeapon=()=>{if(c.weapon==='sword'){const sword=box([.1,1.75,.12],steel,[1.04,.54,.18]);sword.rotation.z=-.18;box([.55,.1,.18],trim,[1,-.22,.18])}else if(c.weapon==='hammer'){const handle=box([.12,1.5,.12],steel,[1.04,.5,.2]);handle.rotation.z=-.18;box([.5,.3,.28],trim,[1.15,1.18,.2])}else{const staff=box([.1,1.8,.1],steel,[1.04,.58,.2]);staff.rotation.z=-.05;const orb=sphere(.17,energy,[1.01,1.52,.2]);animated.push(orb)}};makeWeapon();
    const sh=new THREE.Mesh(new THREE.CylinderGeometry(.62,.62,.14,16),shield);sh.rotation.x=Math.PI/2;sh.position.set(-1.02,.17,.28);add(sh);const shEm=new THREE.Mesh(new THREE.CylinderGeometry(.2,.2,.08,8),trim);shEm.rotation.x=Math.PI/2;shEm.position.set(-1.02,.17,.36);add(shEm);
    function acc(id){if(id==='visor'){const v=boxAcc([.84,.1,.1],energy,[0,1.39,.34]);v.name='visor'}if(id==='capa'){const cp=new THREE.Mesh(new THREE.PlaneGeometry(1.72,2.12),cloth);cp.position.set(0,.06,-.58);cp.rotation.x=.1;accGroup.add(cp)}if(id==='guantes'){accBox([.34,.23,.38],trim,[-.72,-.39,.02]);accBox([.34,.23,.38],trim,[.72,-.39,.02])}if(id==='botas'){accBox([.58,.28,.78],steel,[-.31,-1.34,.14]);accBox([.58,.28,.78],steel,[.31,-1.34,.14])}if(id==='trofeo'){const stem=new THREE.Mesh(new THREE.CylinderGeometry(.08,.11,.42,12),trim);stem.position.set(0,2.05,.05);const cup=new THREE.Mesh(new THREE.CylinderGeometry(.24,.14,.22,12),trim);cup.position.set(0,2.28,.05);accGroup.add(stem,cup)}}
    function accBox(s,m,p){const o=new THREE.Mesh(new THREE.BoxGeometry(...s),m);o.position.set(...p);accGroup.add(o);return o}function boxAcc(s,m,p){return accBox(s,m,p)}
    const apply=()=>{while(accGroup.children.length)accGroup.remove(accGroup.children[0]);items.forEach(acc)};apply();
    const resize=()=>{const r=canvas.getBoundingClientRect(),w=Math.max(220,r.width||320),h=Math.max(260,r.height||320);renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix()};if(window.ResizeObserver)new ResizeObserver(resize).observe(canvas);resize();let t=0,dead=false;
    function loop(){if(dead)return;t+=.016;root.rotation.y=Math.sin(t*.5)*.22;root.position.y=Math.sin(t*1.8)*.065;root.rotation.z=Math.sin(t*.8)*.012;animated.forEach((o,i)=>o.rotation.y+=Math.sin(t*1.4+i)*.0007);renderer.render(scene,camera);requestAnimationFrame(loop)}loop();canvas.__avatar3d={update(){apply()},destroy(){dead=true;renderer.dispose();scene.traverse(o=>{o.geometry?.dispose?.();o.material?.dispose?.()})}};
  }
  function refresh(){document.querySelectorAll('canvas[data-avatar3d]').forEach(old=>{const s=window.state?.()||{};const c=old.cloneNode(false);c.dataset.avatar=s.avatar||old.dataset.avatar||'codex';c.dataset.equippedItems=(s.equippedItems||[]).join(',');old.__avatar3d?.destroy?.();old.replaceWith(c);start(c)})}
  function boot(){document.querySelectorAll('canvas[data-avatar3d]').forEach(c=>{const s=window.state?.()||{};c.dataset.avatar=c.hasAttribute('data-avatar-live')?(s.avatar||c.dataset.avatar):c.dataset.avatar;c.dataset.equippedItems=(s.equippedItems||[]).join(',');start(c)})}
  window.Avatar3D={refresh};window.addEventListener('DOMContentLoaded',boot);window.addEventListener('gameStateChanged',refresh);
})();
