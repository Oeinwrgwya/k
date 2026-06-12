// ── State ──
let playerWeapon=null;
let playerR1=null,playerR2=null,playerR3=null;
let enemyWeapon=null,enemyR1=null,enemyR2=null,enemyR3=null;
let roundCount=0;
let nextEnemyWeapon=null,nextEnemyR1=null,nextEnemyR2=null,nextEnemyR3=null;
let selectedUpgradeId=null,currentUpgradeRound=0;
let gameRunning=false,animFrame=null,lastTime=0,gameEnded=false;
let player,enemy,arrows,arrowTimers,lastHit,particles;

function showScreen(id){
  document.querySelectorAll('.screen').forEach(s=>s.classList.add('hidden'));
  document.getElementById(id).classList.remove('hidden');
}
function selectWeapon(w){
  playerWeapon=w;
  document.querySelectorAll('.weapon-card').forEach(c=>c.classList.remove('selected'));
  document.getElementById('card-'+w).classList.add('selected');
  document.getElementById('btn-fight').classList.add('visible');
}
function pickRandWeapon(exclude){
  const pool=ALL_WEAPONS.filter(w=>w!==exclude);
  return pool[Math.floor(Math.random()*pool.length)];
}
function getPlayerMaxHP(){
  let h=MAX_HP[playerWeapon]||8;
  if(playerR2==='extra_hp')h+=5;
  if(playerR3==='r3_hp')h+=5;
  return h;
}
function getEnemyMaxHP(){
  let h=MAX_HP[enemyWeapon]||8;
  if(enemyR2==='extra_hp')h+=5;
  if(enemyR3==='r3_hp')h+=5;
  return h;
}

function prepareNextEnemy(){
  nextEnemyWeapon=pickRandWeapon(playerWeapon);
  // R1: weapon upgrade
  if(playerR1){
    const pool=UPGRADES_R1[nextEnemyWeapon]||[];
    nextEnemyR1=pool.length?pool[Math.floor(Math.random()*pool.length)].id:null;
  } else nextEnemyR1=null;
  // R2: weapon passive
  if(playerR2){
    const pool=UPGRADES_R2[nextEnemyWeapon]||[];
    nextEnemyR2=pool.length?pool[Math.floor(Math.random()*pool.length)].id:null;
  } else nextEnemyR2=null;
  // R3: universal stat
  if(playerR3){
    nextEnemyR3=UPGRADES_R3[Math.floor(Math.random()*UPGRADES_R3.length)].id;
  } else nextEnemyR3=null;
}

function startRun(){
  roundCount=0;
  playerR1=playerR2=playerR3=null;
  enemyWeapon=enemyR1=enemyR2=enemyR3=null;
  nextEnemyWeapon=nextEnemyR1=nextEnemyR2=nextEnemyR3=null;
  gold=0; inventory=[];
  prepareNextEnemy();
  launchNextFight();
}

function launchNextFight(){
  enemyWeapon=nextEnemyWeapon;
  enemyR1=nextEnemyR1;
  enemyR2=nextEnemyR2;
  enemyR3=nextEnemyR3;
  startBattle();
}

function startBattle(){
  gameEnded=false;
  const spd=150;
  function rv(){const a=Math.random()*Math.PI*2;return{vx:Math.cos(a)*spd,vy:Math.sin(a)*spd};}
  const pv=rv(),ev=rv();
  player={x:130,y:H/2,vx:pv.vx,vy:pv.vy,r:R,weapon:playerWeapon,color:'#4cc9f0',alive:true,
          hp:getPlayerMaxHP(),aimAngle:0,sword:makeSword(),shield:{timer:0,blocking:false,blockTimer:0}};
  enemy={x:W-130,y:H/2,vx:ev.vx,vy:ev.vy,r:R,weapon:enemyWeapon||'sword',color:'#e63946',alive:true,
         hp:getEnemyMaxHP(),aimAngle:Math.PI,sword:makeSword(),shield:{timer:0,blocking:false,blockTimer:0}};
  // safety check
  if(!player.hp||player.hp<=0)player.hp=MAX_HP[playerWeapon]||8;
  if(!enemy.hp||enemy.hp<=0)enemy.hp=MAX_HP[enemyWeapon]||8;
  arrows=[];particles=[];
  arrowTimers={player:0,enemy:0,playerShot:0,enemyShot:0};
  lastHit={player:-999,enemy:-999};
  updateHPBars();
  showScreen('arena-screen');
  gameRunning=true;lastTime=performance.now();
  animFrame=setInterval(loop,1000/60);
}

function updateHPBars(){
  document.getElementById('hp-bar-player').style.width=(player.hp/getPlayerMaxHP()*100)+'%';
  document.getElementById('hp-bar-enemy').style.width=(enemy.hp/getEnemyMaxHP()*100)+'%';
}

function loop(){
  if(!gameRunning)return;
  const now=performance.now();
  const dt=Math.min((now-lastTime)/1000,.05);
  lastTime=now;
  update(dt);updateParticles(dt);draw();
}

function update(dt){
  moveBall(player,dt);moveBall(enemy,dt);
  ballCollide(player,enemy);
  if(player.weapon==='sword')updateSword(player,enemy,dt,true);
  if(enemy.weapon==='sword') updateSword(enemy,player,dt,false);
  if(player.weapon==='shield')updateShield(player,dt,true);
  if(enemy.weapon==='shield') updateShield(enemy,dt,false);
  if(player.weapon==='bow')player.aimAngle=Math.atan2(enemy.y-player.y,enemy.x-player.x);
  if(enemy.weapon==='bow') enemy.aimAngle=Math.atan2(player.y-enemy.y,player.x-enemy.x);
  updateBowShoot(player,enemy,'player',dt);
  updateBowShoot(enemy,player,'enemy',dt);

  for(let i=arrows.length-1;i>=0;i--){
    const a=arrows[i];
    a.x+=a.vx*dt;a.y+=a.vy*dt;a.life-=dt;
    if(a.homing){
      const ht=a.owner==='player'?enemy:player;
      const hx=ht.x-a.x,hy=ht.y-a.y,hd=Math.sqrt(hx*hx+hy*hy)||1;
      a.vx+=(hx/hd)*600*dt;a.vy+=(hy/hd)*600*dt;
      const s2=Math.sqrt(a.vx*a.vx+a.vy*a.vy);
      if(s2>400){a.vx=a.vx/s2*400;a.vy=a.vy/s2*400;}
    }
    if(a.x<0||a.x>W||a.y<0||a.y>H||a.life<=0){arrows.splice(i,1);continue;}
    const tgt=a.owner==='player'?enemy:player;
    if(!tgt.alive)continue;

    if(tgt.weapon==='shield'&&tgt.shield.blocking){
      const isPS=tgt===player,upgS=getR1('shield',isPS?playerR1:enemyR1);
      const isDark=upgS&&upgS.id==='dark_shield';
      let hit=false;
      if(isDark){if(Math.sqrt((a.x-tgt.x)**2+(a.y-tgt.y)**2)<tgt.r+32)hit=true;}
      else{
        const fa=tgt===player?Math.atan2(enemy.y-tgt.y,enemy.x-tgt.x):Math.atan2(player.y-tgt.y,player.x-tgt.x);
        const sx=tgt.x+Math.cos(fa)*(tgt.r+10),sy=tgt.y+Math.sin(fa)*(tgt.r+10);
        if(Math.sqrt((a.x-sx)**2+(a.y-sy)**2)<38)hit=true;
      }
      if(hit){
        const sp=Math.sqrt(a.vx*a.vx+a.vy*a.vy);
        const sh2=a.owner==='player'?player:enemy;
        const dx2=sh2.x-tgt.x,dy2=sh2.y-tgt.y,d2=Math.sqrt(dx2*dx2+dy2*dy2)||1;
        a.vx=(dx2/d2)*sp;a.vy=(dy2/d2)*sp;
        a.owner=a.owner==='player'?'enemy':'player';a.life=5;continue;
      }
    }

    const dx=a.x-tgt.x,dy=a.y-tgt.y;
    if(Math.sqrt(dx*dx+dy*dy)<tgt.r+4){
      const sp=Math.sqrt(a.vx*a.vx+a.vy*a.vy);
      const isP=a.owner==='player';
      const r1shooter=getR1('bow',isP?playerR1:enemyR1);
      const knockMult=(r1shooter&&r1shooter.weakKnockback)?0.03:0.5;
      tgt.vx=(a.vx/sp)*PUSH_SCALE*knockMult;tgt.vy=(a.vy/sp)*PUSH_SCALE*knockMult;
      let dmg=1,isCrit=false;
      const r1b=getR1('bow',isP?playerR1:enemyR1);
      if(r1b&&r1b.critChance&&Math.random()<r1b.critChance){dmg+=2;isCrit=true;}
      // item crit bonus (player only)
      if(isP&&Math.random()<getItemCritChance()){dmg+=2;isCrit=true;}
      const r2b=getR2('bow',isP?playerR2:enemyR2);
      if(r2b&&r2b.id==='homing_crit'&&Math.random()<0.15){dmg+=2;isCrit=true;}
      const r3=getR3(isP?playerR3:enemyR3);
      if(r3&&r3.id==='r3_crit'&&Math.random()<0.15){dmg+=2;isCrit=true;}
      if(r3&&r3.id==='r3_dmg')dmg+=1;
      arrows.splice(i,1);
      if(isCrit)spawnCrit(tgt.x,tgt.y,isP?'#a0ff60':'#ffcc00');
      damage(tgt,dmg);
    }
  }
}

// ── END GAME ──
// Round flow:
// Battle 1 done → R1 upgrade (weapon path)
// Battle 2 done → R2 upgrade (weapon passive)
// Battle 3 done → R3 upgrade (universal stat: +1dmg / +5hp / 15%crit)
// Battle 4+ done → hub only
function endGame(result){
  if(!gameRunning||gameEnded)return;
  gameEnded=true;gameRunning=false;clearInterval(animFrame);animFrame=null;
  roundCount++;
  // gold reward
  if(result==='win')       gold+=3;
  else if(result==='lose') gold+=1;
  setTimeout(()=>{
    const t=result==='win'?'Victory':result==='lose'?'Defeat':'Draw';
    const c=result==='win'?'win':result==='lose'?'lose':'draw';
    document.getElementById('result-title').textContent=t;
    document.getElementById('result-title').className='result-title '+c;
    document.getElementById('result-gold').textContent='🪙 +'+(result==='win'?3:1);
    document.getElementById('btn-continue').textContent='Next';
    showScreen('result-screen');
  },500);
}

function afterBattle(){
  prepareNextEnemy(); // always prepare before showing any screen
  if(roundCount===1)      showUpgradeScreen('r1');
  else if(roundCount===2) showUpgradeScreen('r2');
  else if(roundCount===3) showUpgradeScreen('r3');
  else                    showHub();
}

function showUpgradeScreen(rnd){
  currentUpgradeRound=rnd;selectedUpgradeId=null;
  let pool,title,sub;
  if(rnd==='r1'){
    pool=UPGRADES_R1[playerWeapon]||[];
    title='Weapon Upgrade';sub='Choose your path';
  } else if(rnd==='r2'){
    pool=UPGRADES_R2[playerWeapon]||[];
    title='Weapon Passive';sub='Enhance your fighting style';
  } else {
    pool=UPGRADES_R3;
    title='Stat Upgrade';sub='Choose a universal stat';
  }
  document.getElementById('upg-title').textContent=title;
  document.getElementById('upg-sub').textContent=sub;
  document.getElementById('btn-upgrade').classList.remove('active');
  document.getElementById('upgrade-grid').innerHTML=pool.map(u=>{
    const stats=(u.stats||[]).map(s=>`<span class="stat-pill ${s.g?'stat-good':'stat-bad'}">${s.t}</span>`).join('');
    return `<div class="upgrade-card" id="upg-${u.id}" onclick="selectUpgrade('${u.id}')"><div class="upgrade-badge">✓</div><span class="upgrade-icon">${u.icon}</span><div class="upgrade-name">${u.name}</div><div class="upgrade-desc">${u.desc}</div><div class="upgrade-stats">${stats}</div></div>`;
  }).join('');
  showScreen('upgrade-screen');
}

function selectUpgrade(id){
  selectedUpgradeId=id;
  document.querySelectorAll('.upgrade-card').forEach(c=>c.classList.remove('selected'));
  const el=document.getElementById('upg-'+id);if(el)el.classList.add('selected');
  document.getElementById('btn-upgrade').classList.add('active');
}

function applyUpgrade(){
  if(!selectedUpgradeId)return;
  if(currentUpgradeRound==='r1')      playerR1=selectedUpgradeId;
  else if(currentUpgradeRound==='r2') playerR2=selectedUpgradeId;
  else                                playerR3=selectedUpgradeId;
  prepareNextEnemy();
  showHub();
}

function showHub(){
  document.getElementById('round-dots').innerHTML='';
  document.getElementById('hub-title').textContent='Round '+(roundCount+1);
  document.getElementById('hub-sub').textContent='';
  document.getElementById('hub-stats').innerHTML='';

  const prev=document.getElementById('hub-enemy-preview');
  if(prev)prev.style.display='none';

  showScreen('hub-screen');
}

function goMenu(){
  clearInterval(animFrame);animFrame=null;
  playerWeapon=enemyWeapon=null;
  playerR1=playerR2=playerR3=enemyR1=enemyR2=enemyR3=null;
  nextEnemyWeapon=nextEnemyR1=nextEnemyR2=nextEnemyR3=null;
  roundCount=0;
  document.querySelectorAll('.weapon-card').forEach(c=>c.classList.remove('selected'));
  document.getElementById('btn-fight').classList.remove('visible');
  showScreen('menu-screen');
}
