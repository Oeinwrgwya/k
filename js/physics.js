function angleDiff(a,b){let d=((b-a+Math.PI*3)%(Math.PI*2))-Math.PI;return d;}
function lerpAngle(a,b,t){return a+angleDiff(a,b)*t;}
function easeOut(t){return 1-(1-t)*(1-t);}
function makeSword(){return{state:'rest',angle:0,restAngle:0,slashAngle:0,timer:0,hitDealt:false,slashDur:0.13,recoverDur:0.25,cooldown:0,dashTimer:1.0+Math.random()};}
function moveBall(b,dt){
  b.x+=b.vx*dt;b.y+=b.vy*dt;
  if(b.x<b.r){b.x=b.r;b.vx=Math.abs(b.vx)*WALL_BOUNCE;}
  if(b.x>W-b.r){b.x=W-b.r;b.vx=-Math.abs(b.vx)*WALL_BOUNCE;}
  if(b.y<b.r){b.y=b.r;b.vy=Math.abs(b.vy)*WALL_BOUNCE;}
  if(b.y>H-b.r){b.y=H-b.r;b.vy=-Math.abs(b.vy)*WALL_BOUNCE;}
}

function ballCollide(a,b){
  const dx=b.x-a.x,dy=b.y-a.y,dist=Math.sqrt(dx*dx+dy*dy),min=a.r+b.r;
  if(dist>=min||dist===0)return;
  const nx=dx/dist,ny=dy/dist,ov=(min-dist)/2;
  a.x-=nx*ov;a.y-=ny*ov;b.x+=nx*ov;b.y+=ny*ov;
  const dvx=a.vx-b.vx,dvy=a.vy-b.vy,dot=dvx*nx+dvy*ny;
  if(dot<=0)return;
  a.vx-=dot*nx;a.vy-=dot*ny;b.vx+=dot*nx;b.vy+=dot*ny;
}

function damage(b,amt=1){
  const key=b===player?'player':'enemy';
  const now=performance.now();
  if(now-lastHit[key]<450)return;
  lastHit[key]=now;
  b.hp=Math.max(0,b.hp-amt);
  updateHPBars();
  if(b.hp<=0){b.alive=false;endGame(b===player?'lose':'win');}
}

function updateSword(att,tgt,dt,isP){
  const sw=att.sword;
  const r1=getR1('sword',isP?playerR1:enemyR1);
  const dashMult=r1?r1.dashMult:1;
  const sLen=r1?r1.swordLen:SWORD_LEN;
  const toE=Math.atan2(tgt.y-att.y,tgt.x-att.x);
  sw.restAngle=toE+Math.PI+0.8;
  const dist=Math.sqrt((tgt.x-att.x)**2+(tgt.y-att.y)**2);
  sw.cooldown=Math.max(0,sw.cooldown-dt);
  if(sw.state==='rest'){
    sw.angle=lerpAngle(sw.angle,sw.restAngle,Math.min(1,dt*8));
    sw.dashTimer=Math.max(0,sw.dashTimer-dt);
    if(sw.dashTimer<=0){
      sw.dashTimer=2.0;
      const nx=tgt.x-att.x,ny=tgt.y-att.y,nd=Math.sqrt(nx*nx+ny*ny)||1;
      att.vx+=(nx/nd)*160*dashMult;att.vy+=(ny/nd)*160*dashMult;
    }
    if(dist<(sLen+R+R+10)&&sw.cooldown<=0){sw.state='slash';sw.timer=0;sw.hitDealt=false;sw.slashAngle=toE;}
  } else if(sw.state==='slash'){
    sw.timer+=dt;
    sw.angle=lerpAngle(sw.restAngle,sw.slashAngle,easeOut(Math.min(1,sw.timer/sw.slashDur)));
    if(!sw.hitDealt)checkSwordBlade(att,tgt,sw.angle,sw,isP,sLen);
    if(sw.timer>=sw.slashDur){sw.state='recover';sw.timer=0;}
  } else if(sw.state==='recover'){
    sw.timer+=dt;
    sw.angle=lerpAngle(sw.slashAngle,sw.restAngle,easeOut(Math.min(1,sw.timer/sw.recoverDur)));
    if(sw.timer>=sw.recoverDur){sw.state='rest';sw.cooldown=0.4;}
  }
}

function checkSwordBlade(att,tgt,angle,sw,isP,sLen){
  const r1=getR1('sword',isP?playerR1:enemyR1);
  const r3=getR3(isP?playerR3:enemyR3);
  let dmg=r1?r1.damageMult:10,isCrit=false;
  if(r3&&r3.id==='r3_crit'&&Math.random()<0.15){dmg+=20;isCrit=true;}
  if(r3&&r3.id==='r3_dmg')dmg+=10;
  const isWide=r1&&r1.id==='wide',bladeW=isWide?9:SWORD_W;
  const s0=att.r,s1=att.r+(sLen||SWORD_LEN);
  if(tgt.weapon==='shield'&&tgt.shield.blocking){
    const isPS=tgt===player,upgS=getR1('shield',isPS?playerR1:enemyR1);
    const bR=(upgS&&upgS.id==='dark_shield')?tgt.r+32:tgt.r+bladeW/2;
    for(let t=0;t<=1;t+=0.1){
      const d=s0+(s1-s0)*t,bx=att.x+Math.cos(angle)*d,by=att.y+Math.sin(angle)*d;
      if(Math.sqrt((bx-tgt.x)**2+(by-tgt.y)**2)<bR){
        const nx=att.x-tgt.x,ny=att.y-tgt.y,nd=Math.sqrt(nx*nx+ny*ny)||1;
        att.vx=(nx/nd)*PUSH_SCALE*1.4;att.vy=(ny/nd)*PUSH_SCALE*1.4;
        damage(att,dmg);sw.hitDealt=true;break;
      }
    }
    return;
  }
  for(let t=0;t<=1;t+=0.1){
    const d=s0+(s1-s0)*t,bx=att.x+Math.cos(angle)*d,by=att.y+Math.sin(angle)*d;
    if(Math.sqrt((bx-tgt.x)**2+(by-tgt.y)**2)<tgt.r+bladeW/2){
      const nx=tgt.x-att.x,ny=tgt.y-att.y,nd=Math.sqrt(nx*nx+ny*ny)||1;
      tgt.vx=(nx/nd)*PUSH_SCALE;tgt.vy=(ny/nd)*PUSH_SCALE;
      if(isCrit)spawnCrit(tgt.x,tgt.y,isP?'#c0e8ff':'#ffcc00');
      damage(tgt,dmg);sw.hitDealt=true;break;
    }
  }
}

function updateShield(b,dt,isP){
  const sh=b.shield,r1=getR1('shield',isP?playerR1:enemyR1);
  const isDark=r1&&r1.id==='dark_shield',isSpike=r1&&r1.id==='spike_shield';
  const cycle=isDark?SHIELD_CYCLE+2:SHIELD_CYCLE;
  if(sh.blocking){sh.blockTimer-=dt;if(sh.blockTimer<=0){sh.blocking=false;sh.timer=0;}}
  else{sh.timer+=dt;if(sh.timer>=cycle){sh.blocking=true;sh.blockTimer=SHIELD_DURATION;sh.timer=0;}}
  if(isSpike){
    const tgt=b===player?enemy:player;
    if(Math.sqrt((tgt.x-b.x)**2+(tgt.y-b.y)**2)<b.r+tgt.r+8)damage(tgt,10);
  }
}
