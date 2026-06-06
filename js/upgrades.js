const UPGRADES_R1={
  sword:[
    {id:'curved',name:'Curved Blade',icon:'🗡️',desc:'Dashes much more powerful.',stats:[{t:'Dash +80%',g:true}],dashMult:1.8,damageMult:1,swordLen:68},
    {id:'wide',name:'Broad Sword',icon:'⚔️',desc:'Double damage per hit, dash slightly weaker.',stats:[{t:'Damage ×2',g:true},{t:'Dash -25%',g:false}],dashMult:0.75,damageMult:2,swordLen:80},
  ],
  bow:[
    {id:'wide_bow',name:'Wide Bow',icon:'🏹',desc:'Fires twice as fast, no spread shots.',stats:[{t:'Fire rate ×2',g:true},{t:'No triple shot',g:false}],fireRateMult:2,tripleShot:false,spreadAngles:[]},
    {id:'dark_bow',name:'Dark Bow',icon:'🪃',desc:'5-arrow spread salvo every 3rd shot.',stats:[{t:'5 arrows per salvo',g:true}],fireRateMult:1,tripleShot:true,spreadAngles:[-0.42,-0.21,0.21,0.42]},
    {id:'nature_bow',name:'Nature Bow',icon:'🌿',desc:'25% crit chance (+2 dmg). Spread every 3rd shot.',stats:[{t:'25% crit (+2 dmg)',g:true}],fireRateMult:1,tripleShot:true,spreadAngles:[],critChance:0.25},
  ],
  shield:[
    {id:'dark_shield',name:'Dark Shield',icon:'🌑',desc:'Force field blocks all attacks in wide radius.',stats:[{t:'360° block field',g:true},{t:'Longer cooldown',g:false}]},
    {id:'spike_shield',name:'Spike Shield',icon:'⚙️',desc:'Spikes deal contact damage on collision.',stats:[{t:'Contact damage',g:true}]},
  ],
};

// Weapon-specific passives — shown after battle 2
const UPGRADES_R2={
  sword:[
    {id:'fast_dash',name:'Swift Dash',icon:'💨',desc:'Dash cooldown -50% — lunge more often.',stats:[{t:'Dash CD -50%',g:true}]},
    {id:'crit_sword',name:'Critical Strike',icon:'⚡',desc:'25% chance each hit deals +2 extra damage.',stats:[{t:'25% crit (+2 dmg)',g:true}]},
  ],
  bow:[
    {id:'fast_fire',name:'Swift Arrows',icon:'💨',desc:'Fire rate +50%.',stats:[{t:'Fire rate +50%',g:true}]},
    {id:'homing',name:'Homing Arrows',icon:'🎯',desc:'Arrows gently curve toward the enemy.',stats:[{t:'Light homing',g:true}]},
  ],
  shield:[
    {id:'extra_hp',name:'Iron Will',icon:'❤️',desc:'+5 max HP.',stats:[{t:'+5 max HP',g:true}]},
    {id:'fast_reflect',name:'Power Reflect',icon:'🔄',desc:'Reflected projectiles travel 2× faster.',stats:[{t:'Reflect speed ×2',g:true}]},
  ],
};

// Universal stats — shown after battle 3
const UPGRADES_R3=[
  {id:'r3_crit',name:'15% Critical',icon:'🎲',desc:'15% chance +2 damage on every attack.',stats:[{t:'15% crit (+2 dmg)',g:true}]},
  {id:'r3_hp',name:'+5 Max HP',icon:'💚',desc:'Permanently +5 max HP.',stats:[{t:'+5 max HP',g:true}]},
  {id:'r3_dmg',name:'+1 Damage',icon:'🔥',desc:'All attacks deal +1 damage permanently.',stats:[{t:'+1 dmg always',g:true}]},
];

function getR1(w,id){return(UPGRADES_R1[w]||[]).find(u=>u.id===id)||null;}
function getR2(w,id){return(UPGRADES_R2[w]||[]).find(u=>u.id===id)||null;}
function getR3(id){return UPGRADES_R3.find(u=>u.id===id)||null;}
