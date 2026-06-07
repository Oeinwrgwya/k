// ── GOLD & INVENTORY ──
let gold = 0;
let inventory = []; // array of item ids owned

const SHOP_ITEMS = [
  {
    id: 'feather',
    name: 'Feather',
    icon: '🪶',
    desc: 'Attack speed +35%',
    cost: 3,
    stat: 'attackSpeed',
    value: 0.35,
  },
  {
    id: 'leaf',
    name: 'Leaf',
    icon: '🍃',
    desc: 'Crit chance +15%',
    cost: 1,
    stat: 'critBonus',
    value: 0.15,
  },
];

// Computed player stats from items
function getItemStats(){
  let attackSpeedBonus = 0;
  let critBonus = 0;
  let hpBonus = 0;
  let dmgBonus = 0;
  inventory.forEach(id => {
    const item = SHOP_ITEMS.find(i => i.id === id);
    if(!item) return;
    if(item.stat === 'attackSpeed') attackSpeedBonus += item.value;
    if(item.stat === 'critBonus')   critBonus        += item.value;
    if(item.stat === 'hp')          hpBonus          += item.value;
    if(item.stat === 'dmg')         dmgBonus         += item.value;
  });
  return { attackSpeedBonus, critBonus, hpBonus, dmgBonus };
}

// Apply item stats to arrow interval
function getPlayerArrowInterval(baseInterval){
  const { attackSpeedBonus } = getItemStats();
  return baseInterval / (1 + attackSpeedBonus);
}

// Apply item crit bonus in damage calc
function getItemCritChance(){
  return getItemStats().critBonus;
}

// ── SHOP SCREEN ──
function openShop(){
  renderShop();
  showScreen('shop-screen');
}

function renderShop(){
  // player ball preview
  const cv = document.getElementById('shop-ball-canvas');
  if(cv) drawBallPreview(cv, playerWeapon, playerR1, '#4cc9f0');

  // gold display
  document.getElementById('shop-gold').textContent = '🪙 ' + gold;

  // inventory grid
  const invGrid = document.getElementById('inv-grid');
  invGrid.innerHTML = '';
  inventory.forEach(id => {
    const item = SHOP_ITEMS.find(i => i.id === id);
    if(!item) return;
    const div = document.createElement('div');
    div.className = 'inv-slot';
    div.title = item.name + ': ' + item.desc;
    div.textContent = item.icon;
    invGrid.appendChild(div);
  });
  if(inventory.length === 0){
    const empty = document.createElement('div');
    empty.className = 'inv-slot empty';
    empty.textContent = '—';
    invGrid.appendChild(empty);
  }

  // stats panel
  const iStats = getItemStats();
  const baseHP = (MAX_HP[playerWeapon] || 8) + (playerR3 === 'r3_hp' ? 5 : 0) + (playerR2 === 'extra_hp' ? 5 : 0);
  document.getElementById('stat-hp').textContent    = baseHP + (iStats.hpBonus ? ' +' + iStats.hpBonus : '');
  document.getElementById('stat-dmg').textContent   = '1' + (iStats.dmgBonus ? ' +' + iStats.dmgBonus : '');
  document.getElementById('stat-crit').textContent  = Math.round(iStats.critBonus * 100) + '%';

  // attack speed: base = ARROW_INTERVAL, show as shots/sec or just multiplier
  const atkBase = 1;
  const atkMult = (1 + iStats.attackSpeedBonus).toFixed(2);
  document.getElementById('stat-atk').textContent   = atkMult + '×';

  // shop items grid
  const shopGrid = document.getElementById('shop-grid');
  shopGrid.innerHTML = '';
  SHOP_ITEMS.forEach(item => {
    const owned = inventory.includes(item.id);
    const canAfford = gold >= item.cost;
    const div = document.createElement('div');
    div.className = 'shop-slot' + (owned ? ' owned' : '') + (!canAfford && !owned ? ' cant-afford' : '');
    div.innerHTML = `
      <div class="shop-slot-icon">${item.icon}</div>
      <div class="shop-slot-name">${item.name}</div>
      <div class="shop-slot-desc">${item.desc}</div>
      <div class="shop-slot-cost">${owned ? '✓' : '🪙 ' + item.cost}</div>
    `;
    if(!owned && canAfford){
      div.style.cursor = 'pointer';
      div.onclick = () => buyItem(item.id);
    }
    shopGrid.appendChild(div);
  });
}

function buyItem(id){
  const item = SHOP_ITEMS.find(i => i.id === id);
  if(!item || inventory.includes(id) || gold < item.cost) return;
  gold -= item.cost;
  inventory.push(id);
  renderShop();
}
