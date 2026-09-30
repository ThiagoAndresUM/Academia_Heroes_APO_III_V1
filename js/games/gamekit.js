(function(){
  const esc=s=>String(s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const done=k=>window.hasGame(k);
  const reward=(k,x,c,b)=>window.completeGame(k,x,c,b);
  const keyParts=key=>{const m=String(key).match(/^u(\d+)g(\d+)$/);return m?{unit:+m[1],order:+m[2]}:null};
  function prerequisites(key){const p=keyParts(key);if(!p||p.order<=1)return[];return Array.from({length:p.order-1},(_,i)=>`u${p.unit}g${i+1}`)}
  function base(root,title,sub){root.innerHTML=`<div class="game-top"><div><span class="kicker">${sub}</span><h2>${title}</h2></div><span class="game-live">● DESAFÍO ACTIVO</span></div>`}
  function gate(root,key,render){
    if(done(key)){root.innerHTML='<div class="game-success">🏅 Desafío superado. Puedes volver a practicar sin duplicar recompensas.</div>';return false}
    const req=prerequisites(key), missing=req.filter(k=>!done(k));
    if(missing.length){
      const current=keyParts(key), completed=req.length-missing.length;
      root.innerHTML=`<div class="game-locked"><div class="lock-hero">🔒</div><div><span class="kicker">Ruta progresiva · Unidad ${current?.unit||''}</span><h2>Completa el desafío anterior</h2><p>Este juego se activa al superar el anterior. Progreso de esta zona: <b>${completed}/${req.length}</b>.</p><div class="gate-progress"><i style="width:${req.length?completed/req.length*100:0}%"></i></div><small>Orden: ${req.length?req.map((x,i)=>`Juego ${i+1}`).join(' → '):'Inicio'}</small></div></div>`;
      if(!root.__gameGateListener){
        const handler=()=>{if(prerequisites(key).every(done)){window.removeEventListener('gameStateChanged',handler);delete root.__gameGateListener;render()}};
        root.__gameGateListener=handler;window.addEventListener('gameStateChanged',handler);
      }
      return false;
    }
    return true;
  }
  function finish(root,key,msg,xp,coins,badge,bonus=0){
    if(!reward(key,xp+bonus,coins,badge))return;
    root.insertAdjacentHTML('beforeend',`<div class="game-success"><strong>🏆 ${msg}</strong><br><b>+${xp+bonus} XP</b> · ${coins} 🪙 ${bonus?`· ✨ Bonificación +${bonus} XP`:''}</div>`);
    root.classList.add('game-complete');
  }
  function resetButton(root,label,fn){const b=root.querySelector('.game-retry');if(b)b.onclick=fn;}
  window.GameKit={
    quiz({root,key,questions,xp=70,coins=12,badge=null,time=50}){
      const renderGame=()=>{
        if(!gate(root,key,renderGame))return;
        let i=0,score=0,left=time,timer=null,locked=false;
        base(root,'⚡ Desafío relámpago','Quiz con tiempo · mínimo 75%');
        root.insertAdjacentHTML('beforeend',`<div class="game-toolbar"><span>Pregunta <b class="qcount">1</b>/${questions.length}</span><span>⏱ <b class="qtime">${time}</b>s</span><div class="mini-progress"><i></i></div></div><div class="quiz-card"><h3 class="qtext"></h3><div class="qopts"></div></div><div class="feedback"></div>`);
        const qtext=root.querySelector('.qtext'),opts=root.querySelector('.qopts'),fb=root.querySelector('.feedback'),timeEl=root.querySelector('.qtime'),count=root.querySelector('.qcount'),bar=root.querySelector('.mini-progress i');
        const stop=()=>{if(timer)clearInterval(timer);timer=null};
        const restart=()=>{stop();renderGame()};
        const end=()=>{stop();bar.style.width='100%';const need=Math.ceil(questions.length*.75);if(score>=need)finish(root,key,`Quiz superado: ${score}/${questions.length}.`,xp,coins,badge,score===questions.length?30:0);else{fb.className='feedback show bad';fb.innerHTML=`Necesitas ${need}/${questions.length}. <button class="btn ghost game-retry">↻ Reintentar</button>`;resetButton(root,'',restart)}};
        const render=()=>{const q=questions[i];count.textContent=i+1;qtext.textContent=q.q;opts.innerHTML=q.opts.map((o,n)=>`<button class="choice" data-i="${n}">${esc(o)}</button>`).join('');opts.querySelectorAll('.choice').forEach(b=>b.onclick=()=>answer(+b.dataset.i));bar.style.width=(i/questions.length*100)+'%'};
        const answer=n=>{if(locked)return;locked=true;const q=questions[i],ok=n===q.a;score+=ok?1:0;opts.querySelectorAll('button').forEach(b=>b.disabled=true);opts.children[n].classList.add(ok?'correct':'wrong');if(!ok&&opts.children[q.a])opts.children[q.a].classList.add('correct');fb.className='feedback show '+(ok?'good':'bad');fb.textContent=ok?'✅ '+(q.note||'Correcto.'):'🔎 '+(q.note||'Revisa el concepto.');window.sound(ok?'success':'error');setTimeout(()=>{i++;locked=false;if(i<questions.length)render();else end()},420)};
        const tick=()=>{left--;timeEl.textContent=Math.max(0,left);if(left<=0){stop();fb.className='feedback show bad';fb.innerHTML=`⏰ Tiempo agotado. <button class="btn ghost game-retry">↻ Reiniciar</button>`;opts.innerHTML='';resetButton(root,'',restart)}};
        render();timer=setInterval(tick,1000);
      };renderGame();
    },
    roulette({root,key,items,xp=80,coins=14,badge=null}){
      const renderGame=()=>{
        if(!gate(root,key,renderGame))return;
        base(root,'🎡 Ruleta de decisiones','Gira · analiza · responde');
        root.insertAdjacentHTML('beforeend',`<div class="roulette-pro"><div class="wheel-wrap"><div class="wheel-pointer">▼</div><div class="wheel"><div class="wheel-inner">⚔️</div></div></div><button class="btn alt spin">GIRAR</button></div><div class="roulette-result card">Pulsa <b>GIRAR</b> para recibir un desafío.</div><div class="feedback"></div>`);
        const wheel=root.querySelector('.wheel'),spin=root.querySelector('.spin'),result=root.querySelector('.roulette-result'),fb=root.querySelector('.feedback');let busy=false,turn=0;
        spin.onclick=()=>{if(busy)return;busy=true;spin.disabled=true;turn++;const idx=Math.floor(Math.random()*items.length),rotation=1080+idx*(360/items.length)+(Math.random()*20-10);wheel.animate([{transform:`rotate(${rotation-360}deg)`},{transform:`rotate(${rotation}deg)`}],{duration:1450,easing:'cubic-bezier(.17,.67,.21,1)',fill:'forwards'});setTimeout(()=>{const x=items[idx];result.innerHTML=`<div class="kicker">Reto ${turn}</div><h3>${esc(x.title)}</h3><p>${esc(x.text)}</p><div class="choice-row">${x.opts.map((o,n)=>`<button class="choice" data-i="${n}">${esc(o)}</button>`).join('')}</div>`;result.querySelectorAll('.choice').forEach(b=>b.onclick=()=>{const ok=+b.dataset.i===x.a;result.querySelectorAll('button').forEach(z=>z.disabled=true);b.classList.add(ok?'correct':'wrong');if(!ok&&result.querySelector(`[data-i="${x.a}"]`))result.querySelector(`[data-i="${x.a}"]`).classList.add('correct');fb.className='feedback show '+(ok?'good':'bad');fb.textContent=ok?'🎯 Decisión correcta.':'🔁 Analiza la retroalimentación y vuelve a girar.';window.sound(ok?'success':'error');busy=false;if(ok)finish(root,key,'Ruleta superada.',xp,coins,badge,turn===1?20:0);else spin.disabled=false})},1500)};
      };renderGame();
    },
    boxes({root,key,boxes,xp=90,coins=16,badge=null}){
      const renderGame=()=>{
        if(!gate(root,key,renderGame))return;
        base(root,'🎁 Caja sorpresa','Elige · descubre · resuelve');
        root.insertAdjacentHTML('beforeend',`<div class="chest-grid">${boxes.map((b,i)=>`<button class="chest" data-i="${i}"><span>🔒</span><b>COFRE ${i+1}</b><small>Reto oculto</small></button>`).join('')}</div><div class="chest-challenge"></div><div class="feedback"></div>`);
        const area=root.querySelector('.chest-challenge'),fb=root.querySelector('.feedback');let solved=false;
        root.querySelectorAll('.chest').forEach(b=>b.onclick=()=>{if(solved)return;root.querySelectorAll('.chest').forEach(x=>x.disabled=true);const x=boxes[+b.dataset.i];b.classList.add('opened');b.querySelector('span').textContent=x.icon||'✨';area.innerHTML=`<div class="card"><div class="kicker">Reto secreto</div><h3>${esc(x.q)}</h3><div class="choice-row">${x.opts.map((o,n)=>`<button class="choice" data-i="${n}">${esc(o)}</button>`).join('')}</div></div>`;area.querySelectorAll('button').forEach(c=>c.onclick=()=>{const ok=+c.dataset.i===x.a;area.querySelectorAll('button').forEach(z=>z.disabled=true);c.classList.add(ok?'correct':'wrong');if(!ok&&area.querySelector(`[data-i="${x.a}"]`))area.querySelector(`[data-i="${x.a}"]`).classList.add('correct');fb.className='feedback show '+(ok?'good':'bad');fb.textContent=ok?'🎉 Cofre conquistado.':'🔁 Ese cofre no contiene la solución. Puedes elegir otro.';window.sound(ok?'success':'error');if(ok){solved=true;finish(root,key,'Caja sorpresa superada.',xp,coins,badge,boxes.length>2?15:0)}else{root.querySelectorAll('.chest').forEach(x=>x.disabled=false);b.disabled=true}})})
      };renderGame();
    },
    memory({root,key,pairs,xp=100,coins=18,badge=null}){
      const renderGame=()=>{
        if(!gate(root,key,renderGame))return;
        const deck=[];pairs.forEach((p,i)=>{deck.push({p:i,t:p[0]});deck.push({p:i,t:p[1]})});for(let i=deck.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[deck[i],deck[j]]=[deck[j],deck[i]]}
        base(root,'🃏 Cartas de memoria','Relaciona concepto · definición · aplicación');
        root.insertAdjacentHTML('beforeend',`<div class="game-toolbar"><span>Pares <b class="match-count">0</b>/${pairs.length}</span><span>Movimientos <b class="move-count">0</b></span><button class="btn ghost game-retry">↻ Reiniciar</button></div><div class="memory-grid">${deck.map((c,i)=>`<button class="memory-card" data-i="${i}" aria-label="Carta ${i+1}"><span>?</span><b>${esc(c.t)}</b></button>`).join('')}</div><div class="feedback"></div>`);
        const cards=[...root.querySelectorAll('.memory-card')],fb=root.querySelector('.feedback'),matchEl=root.querySelector('.match-count'),moveEl=root.querySelector('.move-count');let first=null,busy=false,matches=0,moves=0;
        root.querySelector('.game-retry').onclick=renderGame;
        cards.forEach((c,i)=>c.onclick=()=>{if(busy||c.classList.contains('matched')||c===first)return;c.classList.add('flipped');if(first===null){first=c;return}const j=+first.dataset.i,a=deck[j],b=deck[i];busy=true;moves++;moveEl.textContent=moves;if(a.p===b.p){first.classList.add('matched');c.classList.add('matched');matches++;matchEl.textContent=matches;first=null;busy=false;window.sound('success');if(matches===pairs.length)finish(root,key,'Todos los pares encontrados.',xp,coins,badge,moves===pairs.length?25:0)}else{window.sound('error');setTimeout(()=>{first.classList.remove('flipped');c.classList.remove('flipped');first=null;busy=false},650)}})
      };renderGame();
    },
    sorter({root,key,items,xp=95,coins=17,badge=null}){
      const renderGame=()=>{
        if(!gate(root,key,renderGame))return;
        let pool=[...items];for(let i=pool.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[pool[i],pool[j]]=[pool[j],pool[i]]}
        base(root,'🧱 Constructor de código','Ordena · prueba · corrige');
        root.insertAdjacentHTML('beforeend',`<p>Selecciona los bloques en el orden lógico. Puedes reiniciar cuando quieras.</p><div class="code-actions"><span class="moves-label">Bloques: <b>0</b>/${pool.length}</span><button class="btn ghost game-retry">↻ Reiniciar</button></div><div class="code-blocks">${pool.map((x,i)=>`<button class="code-block" data-i="${i}">${esc(x)}</button>`).join('')}</div><div class="sequence"></div><div class="feedback"></div>`);
        const seq=[],fb=root.querySelector('.feedback'),out=root.querySelector('.sequence'),moves=root.querySelector('.moves-label b');root.querySelector('.game-retry').onclick=renderGame;
        root.querySelectorAll('.code-block').forEach(b=>b.onclick=()=>{const i=+b.dataset.i;if(seq.includes(i))return;seq.push(i);moves.textContent=seq.length;b.classList.add('used');out.insertAdjacentHTML('beforeend',`<span>${seq.length}. ${esc(pool[i])}</span>`);if(seq.length===pool.length){const ok=seq.every((v,j)=>pool[v]===items[j]);fb.className='feedback show '+(ok?'good':'bad');fb.innerHTML=ok?`🏆 Secuencia correcta. <b>Excelente construcción.</b>`:`🔁 Secuencia incorrecta. <button class="btn ghost game-retry">↻ Intentar de nuevo</button>`;window.sound(ok?'success':'error');if(ok)finish(root,key,'Secuencia construida.',xp,coins,badge,seq.length===pool.length?20:0);else root.querySelector('.game-retry').onclick=renderGame}})
      };renderGame();
    },
    battle({root,key,pairs,xp=110,coins=20,badge=null}){
      const renderGame=()=>{
        if(!gate(root,key,renderGame))return;
        let i=0,score=0,energy=100,enemy=100,streak=0;
        base(root,'⚔️ Batalla de conceptos','Responde · golpea · derrota al guardián');
        root.insertAdjacentHTML('beforeend',`<div class="battle-hud"><span>🛡️ Guardián <b class="enemy-hp">100</b> HP</span><span>⚡ Energía <b class="player-hp">100</b></span><span>🔥 Racha <b class="battle-streak">0</b></span><span>Ronda <b class="battle-round">1</b>/${pairs.length}</span></div><div class="battle-bars"><div><small>Vida del guardián</small><div class="healthbar"><i class="enemy-bar"></i></div></div><div><small>Tu energía</small><div class="healthbar"><i class="player-bar"></i></div></div></div><div class="battle-card"><h3 class="battle-q"></h3><div class="battle-opts"></div></div><div class="feedback"></div>`);
        const q=root.querySelector('.battle-q'),opts=root.querySelector('.battle-opts'),hp=root.querySelector('.enemy-hp'),energyEl=root.querySelector('.player-hp'),round=root.querySelector('.battle-round'),streakEl=root.querySelector('.battle-streak'),enemyBar=root.querySelector('.enemy-bar'),playerBar=root.querySelector('.player-bar'),fb=root.querySelector('.feedback');
        const restart=()=>renderGame();
        const render=()=>{if(i>=pairs.length){const need=Math.ceil(pairs.length*.75);if(score>=need)finish(root,key,score===pairs.length?'Guardián derrotado con golpe perfecto.':'Guardián derrotado.',xp,coins,badge,score===pairs.length?40:0);else{fb.className='feedback show bad';fb.innerHTML=`Necesitas ${need}/${pairs.length} impactos. <button class="btn ghost game-retry">↻ Reintentar batalla</button>`;root.querySelector('.game-retry')?.addEventListener('click',restart,{once:true})}return}const x=pairs[i];round.textContent=i+1;q.textContent=x.q;opts.innerHTML=x.opts.map((o,n)=>`<button class="choice" data-i="${n}">${esc(o)}</button>`).join('');opts.querySelectorAll('button').forEach(b=>b.onclick=()=>answer(+b.dataset.i));};
        const answer=n=>{const x=pairs[i],ok=n===x.a;opts.querySelectorAll('button').forEach(z=>z.disabled=true);opts.children[n].classList.add(ok?'correct':'wrong');if(!ok&&opts.children[x.a])opts.children[x.a].classList.add('correct');if(ok){score++;streak++;enemy=Math.max(0,enemy-25);energy=Math.min(100,energy+5)}else{streak=0;energy=Math.max(0,energy-30)}hp.textContent=enemy;energyEl.textContent=energy;streakEl.textContent=streak;enemyBar.style.width=enemy+'%';playerBar.style.width=energy+'%';fb.className='feedback show '+(ok?'good':'bad');fb.textContent=ok?'⚔️ Impacto crítico.':'🛡️ El guardián bloqueó tu ataque. Revisa la pista.';window.sound(ok?'success':'error');setTimeout(()=>{i++;if(energy<=0&&score<Math.ceil(pairs.length*.75)){fb.className='feedback show bad';fb.innerHTML=`💥 Energía agotada. <button class="btn ghost game-retry">↻ Recuperar y reintentar</button>`;root.querySelector('.game-retry').onclick=restart}else render()},520)};
        render();
      };renderGame();
    }
  };
})();
