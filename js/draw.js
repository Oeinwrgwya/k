function draw(){
  const cv=document.getElementById('arena-canvas'),ctx=cv.getContext('2d');
  ctx.fillStyle='#070709';ctx.fillRect(0,0,W,H);
  ctx.strokeStyle='rgba(36,36,62,.8)';ctx.lineWidth=1;
  for(let x=0;x<=W;x+=40){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke();}
  for(let y=0;y<=H;y+=40){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke();}
  ctx.strokeStyle='rgba(55,55,90,.9)';ctx.lineWidth=2;ctx.strokeRect(1,1,W-2,H-2);
  arrows.forEach(a=>{
    const ang=Math.atan2(a.vy,a.vx),col=a.owner==='player'?'#4cc9f0':'#e63946';
    ctx.save();ctx.translate(a.x,a.y);ctx.rotate(ang);
    ctx.strokeStyle=col;ctx.lineWidth=2.5;ctx.beginPath();ctx.moveTo(-12,0);ctx.lineTo(8,0);ctx.stroke();
    ctx.fillStyle=col;ctx.beginPath();ctx.moveTo(8,0);ctx.lineTo(1,-4);ctx.lineTo(1,4);ctx.closePath();ctx.fill();
    ctx.restore();
  });

  drawParticles(ctx);
  drawBallBody(ctx,player);drawBallBody(ctx,enemy);
  if(player.weapon==='bow')drawBow(ctx,player,true);
  if(enemy.weapon==='bow') drawBow(ctx,enemy,false);
  if(player.weapon==='shield')drawShieldShape(ctx,player,true);
  if(enemy.weapon==='shield') drawShieldShape(ctx,enemy,false);

  const sc=document.getElementById('sword-canvas'),sctx=sc.getContext('2d');
  sctx.clearRect(0,0,W,H);
  if(player.weapon==='sword'&&player.alive)drawSword(sctx,player,true);
  if(enemy.weapon==='sword'&&enemy.alive)  drawSword(sctx,enemy,false);
}

function drawParticles(ctx){
  particles.forEach(p=>{
    const a=p.life/p.maxLife;ctx.save();ctx.globalAlpha=a;
    if(p.isLine){
      const ang=Math.atan2(p.vy,p.vx);ctx.strokeStyle=p.color;ctx.lineWidth=p.r*1.5;ctx.lineCap='round';
      ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(p.x+Math.cos(ang)*p.len*a,p.y+Math.sin(ang)*p.len*a);ctx.stroke();
    } else {
      ctx.fillStyle=p.color;ctx.beginPath();ctx.arc(p.x,p.y,p.r*a,0,Math.PI*2);ctx.fill();
    }
    ctx.globalAlpha=1;ctx.restore();
  });
}

function drawBallBody(ctx,b){
  if(!b.alive)return;
  const g=ctx.createRadialGradient(b.x,b.y,0,b.x,b.y,b.r*2.2);
  g.addColorStop(0,b.color+'2a');g.addColorStop(1,'transparent');
  ctx.beginPath();ctx.arc(b.x,b.y,b.r*2.2,0,Math.PI*2);ctx.fillStyle=g;ctx.fill();
  const bg=ctx.createRadialGradient(b.x-4,b.y-4,1,b.x,b.y,b.r);
  bg.addColorStop(0,'#fff');bg.addColorStop(.25,b.color);bg.addColorStop(1,b.color+'66');
  ctx.beginPath();ctx.arc(b.x,b.y,b.r,0,Math.PI*2);ctx.fillStyle=bg;ctx.fill();
  ctx.strokeStyle=b.color;ctx.lineWidth=2;ctx.stroke();
}

function drawSword(ctx,b,isP){
  const sw=b.sword,r1=getR1('sword',isP?playerR1:enemyR1);
  const sLen=r1?r1.swordLen:SWORD_LEN,isCurved=r1&&r1.id==='curved',isWide=r1&&r1.id==='wide';
  ctx.save();ctx.translate(b.x,b.y);ctx.rotate(sw.angle);
  const s=b.r+1;
  ctx.strokeStyle='#7a5810';ctx.lineWidth=5;ctx.lineCap='butt';ctx.beginPath();ctx.moveTo(s,0);ctx.lineTo(s+10,0);ctx.stroke();
  ctx.strokeStyle='#c9a227';ctx.lineWidth=isWide?5:3;ctx.beginPath();ctx.moveTo(s+10,isWide?-13:-9);ctx.lineTo(s+10,isWide?13:9);ctx.stroke();
  const bs=s+10,be=s+sLen;
  if(isCurved){
    ctx.strokeStyle='#a0d8ff';ctx.lineWidth=4;ctx.lineCap='round';
    ctx.beginPath();ctx.moveTo(bs,0);ctx.quadraticCurveTo(bs+(be-bs)*.5,-14,be,-4);ctx.stroke();
    ctx.strokeStyle='rgba(255,255,255,.5)';ctx.lineWidth=1.5;
    ctx.beginPath();ctx.moveTo(bs+4,0);ctx.quadraticCurveTo(bs+(be-bs)*.5,-8,be-4,-3);ctx.stroke();
  } else {
    const bw=isWide?9:SWORD_W,gr=ctx.createLinearGradient(bs,0,be,0);
    gr.addColorStop(0,'#e8e8ff');gr.addColorStop(.5,isWide?'#d0a0ff':'#b8c0ff');gr.addColorStop(1,'rgba(160,170,255,0)');
    ctx.strokeStyle=gr;ctx.lineWidth=bw;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(bs,0);ctx.lineTo(be,0);ctx.stroke();
    ctx.strokeStyle='rgba(255,255,255,.5)';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(bs+2,-2);ctx.lineTo(be-4,-1);ctx.stroke();
  }
  ctx.restore();
}

function drawBow(ctx,b,isP){
  const r1=getR1('bow',isP?playerR1:enemyR1);
  ctx.save();ctx.translate(b.x,b.y);ctx.rotate(b.aimAngle);
  const d=b.r+14;
  if(r1&&r1.id==='wide_bow'){
    ctx.strokeStyle='#e0c040';ctx.lineWidth=3.5;ctx.beginPath();ctx.arc(d,0,22,-Math.PI*.7,Math.PI*.7);ctx.stroke();
    const sy=Math.sin(Math.PI*.7)*22;ctx.strokeStyle='#ffffc0';ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(d,-sy);ctx.lineTo(d+6,0);ctx.lineTo(d,sy);ctx.stroke();
  } else if(r1&&r1.id==='dark_bow'){
    ctx.strokeStyle='#5c3010';ctx.lineWidth=3;ctx.beginPath();ctx.arc(d,0,16,-Math.PI*.65,Math.PI*.65);ctx.stroke();
    const sy=Math.sin(Math.PI*.65)*16;ctx.strokeStyle='#9c7040';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(d,-sy);ctx.lineTo(d+4,0);ctx.lineTo(d,sy);ctx.stroke();
  } else if(r1&&r1.id==='nature_bow'){
    ctx.strokeStyle='#3a8c3a';ctx.lineWidth=3;ctx.beginPath();ctx.arc(d,0,16,-Math.PI*.65,Math.PI*.65);ctx.stroke();
    const sy=Math.sin(Math.PI*.65)*16;ctx.strokeStyle='#a0e060';ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(d,-sy);ctx.lineTo(d+4,0);ctx.lineTo(d,sy);ctx.stroke();
    ctx.fillStyle='#4ab84a';ctx.beginPath();ctx.ellipse(d+6,-4,5,3,-.5,0,Math.PI*2);ctx.fill();
  } else {
    ctx.strokeStyle='#c9a227';ctx.lineWidth=2.5;ctx.beginPath();ctx.arc(d,0,16,-Math.PI*.65,Math.PI*.65);ctx.stroke();
    const sy=Math.sin(Math.PI*.65)*16;ctx.strokeStyle='#e8e8c0';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(d,-sy);ctx.lineTo(d+4,0);ctx.lineTo(d,sy);ctx.stroke();
  }
  ctx.restore();
}

function drawShieldShape(ctx,b,isP){
  const sh=b.shield,r1=getR1('shield',isP?playerR1:enemyR1);
  const isDark=r1&&r1.id==='dark_shield',isSpike=r1&&r1.id==='spike_shield';
  const cycle=isDark?SHIELD_CYCLE+2:SHIELD_CYCLE,blocking=sh.blocking;
  const toE=b===player?Math.atan2(enemy.y-b.y,enemy.x-b.x):Math.atan2(player.y-b.y,player.x-b.x);
  if(isDark){
    ctx.save();ctx.translate(b.x,b.y);ctx.rotate(toE);
    const x0=b.r+10,h=28,bul=14;
    if(blocking){ctx.shadowColor='rgba(180,140,0,0.7)';ctx.shadowBlur=10;ctx.strokeStyle='#7a6010';ctx.lineWidth=5;ctx.lineCap='round';}
    else{ctx.globalAlpha=0.25+(sh.timer/cycle)*.35;ctx.strokeStyle='#4a3a08';ctx.lineWidth=4;ctx.lineCap='round';}
    ctx.beginPath();ctx.moveTo(x0,-h);ctx.quadraticCurveTo(x0+bul,0,x0,h);ctx.stroke();
    ctx.shadowBlur=0;ctx.globalAlpha=1;ctx.restore();
    const fR=b.r+40;
    if(blocking){
      const glow=ctx.createRadialGradient(b.x,b.y,b.r+20,b.x,b.y,fR+6);
      glow.addColorStop(0,'rgba(255,220,80,0.15)');glow.addColorStop(1,'rgba(255,180,0,0)');
      ctx.beginPath();ctx.arc(b.x,b.y,fR+6,0,Math.PI*2);ctx.fillStyle=glow;ctx.fill();
      ctx.strokeStyle='rgba(255,210,60,0.8)';ctx.lineWidth=2.5;ctx.beginPath();ctx.arc(b.x,b.y,fR,0,Math.PI*2);ctx.stroke();
    } else {
      ctx.globalAlpha=0.12+(sh.timer/cycle)*.25;ctx.strokeStyle='#c9a227';ctx.lineWidth=1.5;
      ctx.beginPath();ctx.arc(b.x,b.y,fR,0,Math.PI*2);ctx.stroke();ctx.globalAlpha=1;
    }
  } else {
    ctx.save();ctx.translate(b.x,b.y);ctx.rotate(toE);
    const x0=b.r+10,h=28,bul=14;
    if(blocking){ctx.shadowColor=isSpike?'rgba(255,80,80,0.9)':'rgba(255,220,80,0.9)';ctx.shadowBlur=18;ctx.strokeStyle=isSpike?'#ff6060':'#ffe066';ctx.lineWidth=5;ctx.lineCap='round';}
    else{ctx.globalAlpha=0.3+(sh.timer/cycle)*.5;ctx.strokeStyle=isSpike?'#882020':'#b08820';ctx.lineWidth=4;ctx.lineCap='round';}
    ctx.beginPath();ctx.moveTo(x0,-h);ctx.quadraticCurveTo(x0+bul,0,x0,h);ctx.stroke();
    ctx.shadowBlur=0;
    if(isSpike){
      ctx.strokeStyle=blocking?'#ff9090':'rgba(180,60,60,0.6)';ctx.lineWidth=2;ctx.lineCap='round';
      for(let i=0;i<5;i++){const t=i/4,px=x0+bul*Math.sin(Math.PI*t),py=-h+h*2*t;ctx.beginPath();ctx.moveTo(px,py);ctx.lineTo(px+8,py);ctx.stroke();}
    }
    ctx.globalAlpha=1;ctx.restore();
  }
  const frac=blocking?sh.blockTimer/SHIELD_DURATION:sh.timer/cycle;
  ctx.save();ctx.translate(b.x,b.y);
  ctx.strokeStyle=blocking?(isDark?'rgba(180,80,255,0.9)':isSpike?'rgba(255,100,100,0.9)':'rgba(255,230,80,0.9)'):(isDark?'rgba(160,60,255,0.5)':isSpike?'rgba(255,80,80,0.5)':'rgba(255,200,50,0.5)');
  ctx.lineWidth=blocking?3:2;ctx.beginPath();ctx.arc(0,0,b.r+3,-Math.PI/2,-Math.PI/2+frac*Math.PI*2);ctx.stroke();ctx.restore();
}

function drawBallPreview(canvas,weapon,r1Id,color){
  const ctx=canvas.getContext('2d'),cx=canvas.width/2,cy=canvas.height/2,pr=18;
  ctx.clearRect(0,0,canvas.width,canvas.height);
  const col=color||'#e63946';
  const g=ctx.createRadialGradient(cx,cy,0,cx,cy,pr*2.2);
  g.addColorStop(0,col+'33');g.addColorStop(1,'transparent');
  ctx.beginPath();ctx.arc(cx,cy,pr*2.2,0,Math.PI*2);ctx.fillStyle=g;ctx.fill();
  const bg=ctx.createRadialGradient(cx-3,cy-3,1,cx,cy,pr);
  bg.addColorStop(0,'#fff');bg.addColorStop(.25,col);bg.addColorStop(1,col+'66');
  ctx.beginPath();ctx.arc(cx,cy,pr,0,Math.PI*2);ctx.fillStyle=bg;ctx.fill();
  ctx.strokeStyle=col;ctx.lineWidth=2;ctx.stroke();
  const r1=getR1(weapon,r1Id);
  if(weapon==='sword'){
    const sLen=Math.min((r1?r1.swordLen:SWORD_LEN)*0.6,36),isCurved=r1&&r1.id==='curved',isWide=r1&&r1.id==='wide';
    ctx.save();ctx.translate(cx,cy);ctx.rotate(-0.5);
    const s=pr+1;
    ctx.strokeStyle='#7a5810';ctx.lineWidth=3;ctx.lineCap='butt';ctx.beginPath();ctx.moveTo(s,0);ctx.lineTo(s+6,0);ctx.stroke();
    ctx.strokeStyle='#c9a227';ctx.lineWidth=isWide?3:2;ctx.beginPath();ctx.moveTo(s+6,isWide?-8:-5);ctx.lineTo(s+6,isWide?8:5);ctx.stroke();
    const bs=s+6,be=s+sLen;
    if(isCurved){
      ctx.strokeStyle='#a0d8ff';ctx.lineWidth=2.5;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(bs,0);ctx.quadraticCurveTo(bs+(be-bs)*.5,-8,be,-2);ctx.stroke();
    } else {
      const bw=isWide?6:3,gr=ctx.createLinearGradient(bs,0,be,0);
      gr.addColorStop(0,'#e8e8ff');gr.addColorStop(.5,isWide?'#d0a0ff':'#b8c0ff');gr.addColorStop(1,'rgba(160,170,255,0)');
      ctx.strokeStyle=gr;ctx.lineWidth=bw;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(bs,0);ctx.lineTo(be,0);ctx.stroke();
    }
    ctx.restore();
  } else if(weapon==='bow'){
    ctx.save();ctx.translate(cx,cy);
    const d=pr+8;
    if(r1&&r1.id==='wide_bow'){ctx.strokeStyle='#e0c040';ctx.lineWidth=2.5;ctx.beginPath();ctx.arc(d,0,14,-Math.PI*.7,Math.PI*.7);ctx.stroke();}
    else if(r1&&r1.id==='dark_bow'){ctx.strokeStyle='#5c3010';ctx.lineWidth=2;ctx.beginPath();ctx.arc(d,0,11,-Math.PI*.65,Math.PI*.65);ctx.stroke();}
    else if(r1&&r1.id==='nature_bow'){
      ctx.strokeStyle='#3a8c3a';ctx.lineWidth=2;ctx.beginPath();ctx.arc(d,0,11,-Math.PI*.65,Math.PI*.65);ctx.stroke();
      ctx.fillStyle='#4ab84a';ctx.beginPath();ctx.ellipse(d+4,-3,3,2,-.5,0,Math.PI*2);ctx.fill();
    } else {ctx.strokeStyle='#c9a227';ctx.lineWidth=2;ctx.beginPath();ctx.arc(d,0,11,-Math.PI*.65,Math.PI*.65);ctx.stroke();}
    const sy=Math.sin(Math.PI*.65)*11;ctx.strokeStyle='#e8e8c0';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(d,-sy);ctx.lineTo(d+3,0);ctx.lineTo(d,sy);ctx.stroke();
    ctx.restore();
  } else if(weapon==='shield'){
    const isDark=r1&&r1.id==='dark_shield',isSpike=r1&&r1.id==='spike_shield';
    ctx.save();ctx.translate(cx,cy);
    const x0=pr+6,h=16,bul=8;
    ctx.strokeStyle=isDark?'#7a6010':isSpike?'#882020':'#b08820';ctx.lineWidth=3;ctx.lineCap='round';
    ctx.beginPath();ctx.moveTo(x0,-h);ctx.quadraticCurveTo(x0+bul,0,x0,h);ctx.stroke();
    if(isSpike){ctx.strokeStyle='rgba(180,60,60,0.8)';ctx.lineWidth=1.2;for(let i=0;i<5;i++){const t=i/4,px=x0+bul*Math.sin(Math.PI*t),py=-h+h*2*t;ctx.beginPath();ctx.moveTo(px,py);ctx.lineTo(px+5,py);ctx.stroke();}}
    if(isDark){ctx.strokeStyle='rgba(255,210,60,0.5)';ctx.lineWidth=1;ctx.beginPath();ctx.arc(0,0,pr+14,0,Math.PI*2);ctx.stroke();}
    ctx.restore();
  }
}
