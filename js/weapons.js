function updateBowShoot(from,to,key,dt){
  if(from.weapon!=='bow')return;
  const isP=key==='player';
  const r1=getR1('bow',isP?playerR1:enemyR1);
  let interval=ARROW_INTERVAL;
  if(r1)interval/=(r1.fireRateMult||1);
  arrowTimers[key]+=dt;
  if(arrowTimers[key]>=interval){
    arrowTimers[key]=0;
    const sk=key+'Shot';arrowTimers[sk]=(arrowTimers[sk]||0)+1;
    const doTriple=r1?(r1.id==='dark_bow'||r1.id==='nature_bow'?true:r1.tripleShot):true;
    const extraA=r1?(r1.id==='nature_bow'?[-0.28,0.28]:r1.spreadAngles):[-0.28,0.28];
    if(doTriple&&arrowTimers[sk]>=3){arrowTimers[sk]=0;shootSpread(from,to,key,extraA);}
    else shootSingle(from,to,key);
  }
}

function shootSingle(from,to,owner){
  const dx=to.x-from.x,dy=to.y-from.y,d=Math.sqrt(dx*dx+dy*dy)||1;
  arrows.push({x:from.x+(dx/d)*(from.r+10),y:from.y+(dy/d)*(from.r+10),vx:(dx/d)*320,vy:(dy/d)*320,owner,life:5,homing:false});
}
function shootSpread(from,to,owner,extra){
  const dx=to.x-from.x,dy=to.y-from.y,base=Math.atan2(dy,dx);
  arrows.push({x:from.x+Math.cos(base)*(from.r+10),y:from.y+Math.sin(base)*(from.r+10),vx:Math.cos(base)*320,vy:Math.sin(base)*320,owner,life:5,homing:false});
  (extra||[]).forEach(off=>{
    const ang=base+off;
    arrows.push({x:from.x+Math.cos(ang)*(from.r+10),y:from.y+Math.sin(ang)*(from.r+10),vx:Math.cos(ang)*320,vy:Math.sin(ang)*320,owner,life:5,homing:false});
  });
}

function spawnCrit(x,y,color){
  for(let i=0;i<10;i++){
    const ang=Math.random()*Math.PI*2,spd=60+Math.random()*120;
    particles.push({x,y,vx:Math.cos(ang)*spd,vy:Math.sin(ang)*spd,life:.45,maxLife:.45,r:2+Math.random()*3,color});
  }
  for(let i=0;i<6;i++){
    const ang=(i/6)*Math.PI*2,spd=180+Math.random()*60;
    particles.push({x,y,vx:Math.cos(ang)*spd,vy:Math.sin(ang)*spd,life:.25,maxLife:.25,r:1.5,isLine:true,len:14,color});
  }
}

function updateParticles(dt){
  for(let i=particles.length-1;i>=0;i--){
    const p=particles[i];
    p.x+=p.vx*dt;p.y+=p.vy*dt;
    p.vx*=Math.pow(0.06,dt);p.vy*=Math.pow(0.06,dt);
    p.life-=dt;if(p.life<=0)particles.splice(i,1);
  }
}
