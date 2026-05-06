// js/engumi.js
// 縁組・血統（ニックス）システム

let engumiStep=0,engumiSelectedFather=null,engumiSelectedMother=null;


function inheritTraits(fTraits,mTraits){
const o=new Set();[...fTraits,...mTraits].forEach(id=>{if(Math.random()<.30)o.add(id);});if(Math.random()<.05)o.add(pickTrait().id);return[...o];}

function createChildStatsV6(f, m){
const nd = NICKS.get(f.bloodlineId, m.bloodlineId);const cg = Math.max(f._generation||1, m._generation||1) + 1;const childBlId = Math.random()<.6 ? f.bloodlineId : m.bloodlineId;const childBl = BM.get(childBlId) || BLOODLINES[childBlId];const traits = inheritTraits(f._traits||[], m._traits||[]);const isGenius = traits.includes('genius');const fluct = 8 + Math.min(6,(cg-1)*1.5);const bonus = nd.bonus;const scMult = nd.scMult;const rawP = (f.stats.power*.55 + m.stats.power*.45) + bonus + (Math.random()*2-1)*fluct + (childBl?.b==='power'?3:0);const rawW = (f.stats.wisdom*.45 + m.stats.wisdom*.55) + bonus + (Math.random()*2-1)*fluct + (childBl?.b==='wisdom'?3:0);const rawH = Math.round((f.stats.maxHp + m.stats.maxHp)/1.8) + rnd(10,20);const rawL = Math.round(f._loyalty*.45 + m._loyalty*.55) + rnd(8,14);let p = applyGenCap(rawP, cg, scMult, isGenius);let w = applyGenCap(rawW, cg, scMult, isGenius);let hp = clamp(rawH,100,200);let loyalty = clamp(rawL,30,98);if(nd.sp){
if(nd.sp.sb.power) p = clamp(p+nd.sp.sb.power,1,99);if(nd.sp.sb.wisdom) w = clamp(w+nd.sp.sb.wisdom,1,99);if(nd.sp.sb.loyalty) loyalty = clamp(loyalty+nd.sp.sb.loyalty,1,99);}
const bt=(nd.rank==='SS'&&Math.random()<.40)||(nd.rank==='S'&&isGenius&&Math.random()<.25);if(bt){p=clamp(p+rnd(5,12),1,99);w=clamp(w+rnd(5,12),1,99);}
return {power:p, wisdom:w, hp, maxHp:hp, _loyalty:loyalty, _traits:traits,
_nickRank:nd.rank, _nickLabel:nd.label, _nickSp:nd.sp, _isBreakthrough:bt,
_childBlId:childBlId};}

function doEngumiV6(){
if(state.koku<ENGUMI_COST){showToast('石高が足りません(必要：'+ENGUMI_COST+'石)');return;}
if(engumiSelectedFather===null||engumiSelectedMother===null){showToast('父母を選択してください');return;}
const f=gParents[engumiSelectedFather], m=gParents[engumiSelectedMother];const nd=NICKS.get(f.bloodlineId, m.bloodlineId);const cs=createChildStatsV6(f, m);state.koku-=ENGUMI_COST;state.generation++;f.useCount++;m.useCount++;if(f.useCount%3===0) f.level=Math.min(9,f.level+1);if(m.useCount%3===0) m.level=Math.min(9,m.level+1);const gender=Math.random()<.5?'male':'female';const jobDef=generateJob(gender);const childName=randName(gender);const child=new IsoWarrior(childName, jobDef, cs.power, (Math.random()-.5)*2, 2.5+Math.random()*2, gender, 0, cs._childBlId);child.stats.wisdom=cs.wisdom;child.stats.hp=cs.hp;child.stats.maxHp=cs.maxHp;child._generation=Math.max(f._generation||1, m._generation||1)+1;child._parents={father:f.name, mother:m.name};child._loyalty=cs._loyalty;child._traits=cs._traits||[];child._nickRank=cs._nickRank;child._nickSp=cs._nickSp;child._isBreakthrough=cs._isBreakthrough;gWarriors.push(child);state.pedigree.push({
childName, father:f.name, mother:m.name,
power:cs.power, wisdom:cs.wisdom, generation:child._generation,
bloodlineId:cs._childBlId, jobName:jobDef.name, jobIcon:jobDef.icon,
nickRank:nd.rank, nickLabel:nd.label,
breakthrough:cs._isBreakthrough
});
if(state.pedigree.length>200)state.pedigree.splice(0,state.pedigree.length-200);addLog('縁組成立：'+f.name+'×'+m.name+'→'+childName+'【'+nd.rank+'・'+nd.label+'】'+(cs._isBreakthrough?'【限界突破！】':''));addCastleExp(30);closeEngumi();$('suc-name').textContent=childName;const blName=BM.get(cs._childBlId)?.n||child.bloodline.name;const btMsg=cs._isBreakthrough?'<br>🌟 限界突破！！':'';const spMsg=cs._nickSp?'<br>✨ '+cs._nickSp.name+'「'+cs._nickSp.fl+'」':'';const trMsg=cs._traits.length?'<br>特性：'+cs._traits.map(id=>TRAIT_MAP.get(id)?.n||id).join('・'):'';$('suc-stats').innerHTML=blName+'　'+jobDef.icon+jobDef.name
+'<br>武力 '+cs.power+'　知力 '+cs.wisdom+'　体力 '+cs.maxHp
+'<br>第'+child._generation+'世代　血統ニックス：<b style="color:'+NICKS.rankColor[nd.rank||'C']+'">'+(nd.rank||'C')+'ランク '+nd.label+'</b>'
+btMsg+spMsg+trMsg;openModal('success-overlay');updateStatusUI();updatePartyRow();}

function traitBadges(traits){
if(!traits||!traits.length) return '';return traits.map(id=>{const t=TRAIT_MAP.get(id);return t?`<span class="trait-badge trait-${id}" title="${t.n}" style="font-size:7px;padding:1px 5px;border-radius:8px;background:rgba(200,150,12,.15);border:1px solid rgba(200,150,12,.3);color:var(--gold-l);">${t.n}</span>`:''}).join('');}

function nickBadge(rank){
const colors={SS:'#ffd700',S:'#f0c040',A:'#cc88ff',B:'#66ddaa',C:'#aaa'};const c=colors[rank]||colors.C;return `<span style="font-size:7px;font-weight:900;color:${c};border:1px solid ${c};border-radius:8px;padding:1px 4px;font-family:DotGothic16,monospace;">${rank}</span>`;}

function openEngumi(){engumiStep=0;engumiSelectedFather=null;engumiSelectedMother=null;renderEngumiStep();openModal('engumi-modal');}

function closeEngumi(){closeModal('engumi-modal');}

function selectFather(idx){engumiSelectedFather=idx;if(engumiSelectedMother===idx)engumiSelectedMother=null;renderEngumiStep();}

function selectMother(idx){if(idx===engumiSelectedFather){showToast('父と同じ武将は選べません');return;}engumiSelectedMother=idx;renderEngumiStep();}

function engumiNext(){if(engumiStep===0){if(engumiSelectedFather===null){showToast('父を選んでください');return;}engumiStep=1;renderEngumiStep();}else if(engumiStep===1){if(engumiSelectedMother===null){showToast('母を選んでください');return;}engumiStep=2;renderEngumiStep();}else doEngumi();}

function closeSuccessOverlay(){document.getElementById('success-overlay').classList.remove('show');refreshModalBg();}

function renderEngumiStep(){
for(let i=0;i<3;i++)document.getElementById('sdot'+i).classList.toggle('active',i===engumiStep);const nb=$('engumi-next-btn'),cb=$('engumi-cancel-btn'),content=$('engumi-step-content');if(engumiStep===0){cb.textContent='取消';cb.onclick=()=>closeEngumi();}
else{cb.textContent='← 戻る';cb.onclick=()=>{engumiStep--;renderEngumiStep();};}
if(engumiStep===0){
nb.textContent='次へ →';nb.disabled=engumiSelectedFather===null;const fathers=gParents.filter(p=>p.gender!=='female');if(!fathers.length){content.innerHTML='<div style="color:rgba(200,150,12,.6);text-align:center;padding:20px;font-size:12px;">父となれる親武将がいません</div>';nb.disabled=true;return;}
let html='<div class="engumi-cost"><div class="ec-label">縁組費用</div><span class="ec-val">'+ENGUMI_COST.toLocaleString()+'</span><span class="ec-unit">石</span></div><div class="modal-section"><div class="modal-section-title">父となる武将を選べ</div><div class="warrior-select-grid">';fathers.forEach(w=>{
const idx=gParents.indexOf(w);const blE=BM.get(w.bloodlineId);const gIcon=blE?.i||'';html+='<div class="warrior-sel-card '+(engumiSelectedFather===idx?'selected':'')+'" onclick="selectFather('+idx+')">'
+'<div class="wsc-name">'+w.name+'</div>'
+'<div class="wsc-stats">武'+w.getEffectivePower()+'　知'+w.getEffectiveWisdom()+'</div>'
+'<div class="wsc-bl" style="color:'+(blE?.c||w.bloodline.color)+'">'+(gIcon)+w.bloodline.name+'【'+( blE?.g||'?')+'】</div>'
+'<div class="wsc-lv">Lv.'+w.level+'　縁組'+w.useCount+'回</div>'
+(w._traits&&w._traits.length?'<div style="margin-top:3px;">'+traitBadges(w._traits)+'</div>':'')
+'</div>';});html+='</div></div>';content.innerHTML=html;}else if(engumiStep===1){
nb.textContent='次へ →';nb.disabled=engumiSelectedMother===null;const mothers=gParents.filter((p,idx)=>idx!==engumiSelectedFather&&p.gender!=='male');if(!mothers.length){content.innerHTML='<div style="color:rgba(200,150,12,.6);text-align:center;padding:20px;font-size:12px;">母となれる親武将がいません</div>';nb.disabled=true;return;}
let html='<div class="modal-section"><div class="modal-section-title">母となる武将を選べ</div><div class="warrior-select-grid">';mothers.forEach(w=>{
const idx=gParents.indexOf(w);const blE=BM.get(w.bloodlineId);const fbl=gParents[engumiSelectedFather];const ndPrev=fbl?NICKS.get(fbl.bloodlineId,w.bloodlineId):null;html+='<div class="warrior-sel-card '+(engumiSelectedMother===idx?'selected':'')+'" onclick="selectMother('+idx+')">'
+'<div class="wsc-name">'+w.name+'</div>'
+'<div class="wsc-stats">武'+w.getEffectivePower()+'　知'+w.getEffectiveWisdom()+'</div>'
+'<div class="wsc-bl" style="color:'+(blE?.c||w.bloodline.color)+'">'+( blE?.i||'')+w.bloodline.name+'【'+(blE?.g||'?')+'】</div>'
+(ndPrev?'<div style="margin-top:3px;">'+nickBadge(ndPrev.rank)+' '+ndPrev.label+'</div>':'')
+'</div>';});html+='</div></div>';content.innerHTML=html;}else{
nb.textContent='成立させる';nb.disabled=false;const f=gParents[engumiSelectedFather],m=gParents[engumiSelectedMother];const nd=NICKS.get(f.bloodlineId,m.bloodlineId);const cs=createChildStatsV6(f,m);const childBl=BM.get(cs._childBlId);const btMsg=cs._isBreakthrough?'<div style="color:#ffd700;font-size:10px;margin-top:4px;font-weight:900;">🌟 限界突破の可能性あり！</div>':'';const spMsg=nd.sp?'<div style="color:#ffcc88;font-size:9px;margin-top:3px;">✨ '+nd.sp.name+' — '+nd.sp.fl+'</div>':'';content.innerHTML='<div class="modal-section"><div class="modal-section-title">縁組の確認</div>'
+'<div class="confirm-panel"><div class="confirm-pair">'
+'<div class="confirm-w"><div class="cw-name">'+f.name+'</div><div class="cw-role" style="color:'+(BM.get(f.bloodlineId)?.c||'#aaa')+'">'+( BM.get(f.bloodlineId)?.g||'?')+'系　'+f.bloodline.name+'</div></div>'
+'<div class="confirm-heart">❤</div>'
+'<div class="confirm-w"><div class="cw-name">'+m.name+'</div><div class="cw-role" style="color:'+(BM.get(m.bloodlineId)?.c||'#aaa')+'">'+( BM.get(m.bloodlineId)?.g||'?')+'系　'+m.bloodline.name+'</div></div>'
+'</div>'
+'<div class="nick-confirm">'
+'<div class="nc-rank nick-'+nd.rank+'" style="color:'+(NICKS.rankColor[nd.rank]||'#aaa')+'">'+nd.rank+'ランク　'+nd.label+'</div>'
+'<div class="nc-desc">成長補正 +'+nd.bonus+'　ソフトキャップ緩和 → '+nd.scMult+'</div>'
+spMsg+btMsg
+'</div>'
+'<div class="child-preview"><div class="cp-title">誕生する子の予測値</div>'
+'<div class="cp-stat"><span>武力</span><span class="cpv">〜'+cs.power+'</span></div>'
+'<div class="cp-stat"><span>知力</span><span class="cpv">〜'+cs.wisdom+'</span></div>'
+'<div class="cp-stat"><span>体力</span><span class="cpv">〜'+cs.maxHp+'</span></div>'
+'<div class="cp-stat"><span>継承血統</span><span class="cpv" style="color:'+(childBl?.c||'#fff')+'">'+(childBl?.i||'')+(childBl?.n||'?')+'【'+(childBl?.g||'?')+'系】</span></div>'
+(cs._traits.length?'<div class="cp-stat"><span>予測特性</span><span class="cpv">'+traitBadges(cs._traits)+'</span></div>':'')
+'</div></div>'
+'<div style="margin-top:10px;font-size:11px;color:rgba(200,150,12,.6);text-align:center;letter-spacing:.2em;">費用 '+ENGUMI_COST.toLocaleString()+' 石を消費します</div>'
+'</div>';}
}

function openPedigree(){
const content=$('pedigree-content');if(!content)return;let html='<div class="gen-block"><div class="gen-label-h">◆ 現役武将(育成中)</div><div class="gen-list">';if(!gWarriors.length)html+='<div style="color:rgba(200,150,12,.4);font-size:10px;padding:8px;">なし</div>';gWarriors.forEach(w=>{
const blE=BM.get(w.bloodlineId);html+='<div class="gen-card">'
+'<div class="gn">'+w.name+'　'+w.age+'歳 '+(w._nickRank?nickBadge(w._nickRank):'')+'</div>'
+'<div style="color:'+(blE?.c||w.bloodline.color)+'">'+(blE?.i||'')+w.bloodline.name+'【'+(blE?.g||'?')+'系】　'+(w.jobIcon||'')+w.jobName+'</div>'
+'<div class="gp">武'+w.getEffectivePower()+'　知'+w.getEffectiveWisdom()+'</div>'
+(w._traits&&w._traits.length?'<div style="margin-top:3px;">'+traitBadges(w._traits)+'</div>':'')
+'<div>'+(w._parents?w._parents.father+'の子':'初代')+'</div>'
+(w._isBreakthrough?'<div style="color:#ffd700;font-size:8px;">🌟限界突破！</div>':'')
+'</div>';});html+='</div></div>';html+='<div class="gen-block"><div class="gen-label-h">◆ 親リスト(縁組専念)</div><div class="gen-list">';if(!gParents.length)html+='<div style="color:rgba(200,150,12,.4);font-size:10px;padding:8px;">なし</div>';gParents.forEach(p=>{
const blE=BM.get(p.bloodlineId);html+='<div class="gen-card">'
+'<div class="gn">'+p.name+'　Lv.'+p.level+'</div>'
+'<div style="color:'+(blE?.c||p.bloodline.color)+'">'+(blE?.i||'')+p.bloodline.name+'【'+(blE?.g||'?')+'系】</div>'
+'<div class="gp">武'+p.getEffectivePower()+'　知'+p.getEffectiveWisdom()+'</div>'
+(p._traits&&p._traits.length?'<div style="margin-top:2px;">'+traitBadges(p._traits)+'</div>':'')
+'<div>縁組'+p.useCount+'回</div></div>';});html+='</div></div>';if(state.pedigree.length){
html+='<div class="gen-block"><div class="gen-label-h">◆ 縁組履歴</div><div class="gen-list">';state.pedigree.slice().reverse().forEach(p=>{
const blE=BM.get(p.bloodlineId);html+='<div class="gen-card">'
+'<div class="gn">'+p.childName+'　'+(p.jobIcon||'')+p.jobName
+(p.nickRank?' '+nickBadge(p.nickRank):'')
+(p.breakthrough?' <span style="color:#ffd700;font-size:7px;">突破</span>':'')+'</div>'
+'<div>'+p.father+' × '+p.mother+'</div>'
+'<div style="color:'+(blE?.c||'#fff')+'">'+(blE?.n||'?')+'</div>'
+'<div class="gp">武'+p.power+'　知'+p.wisdom+'</div></div>';});html+='</div></div>';}
content.innerHTML=html;openModal('pedigree-modal');}

window.doEngumi = doEngumiV6;
function doEngumi(){doEngumiV6();}
