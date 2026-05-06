// js/main.js
// 初期化・メインループ・開発者メニュー

let idleTimer=null,ageTickCounter=0;
let retireTarget=null,retireQueue=[];
let selectedForBattle=[];


function performIdleTick(){
state.turn++;ageTickCounter++;const castleBonus=castleLvData().kokuBonus;gWarriors.forEach(w=>{
if(Math.random()<.4)w.stats.power=clamp(w.stats.power+1,1,99);if(Math.random()<.25)w.stats.wisdom=clamp(w.stats.wisdom+1,1,99);const hpPct=w.stats.hp/w.stats.maxHp;if(hpPct<.9){const rec=Math.floor((1-hpPct)*4+1);w.stats.hp=Math.min(w.stats.maxHp,w.stats.hp+rec);}
if(Math.random()<.40)fireGrowthEvent(w);});gParents.forEach(w=>{if(w.stats.hp<w.stats.maxHp)w.stats.hp=Math.min(w.stats.maxHp,w.stats.hp+2);});if(ageTickCounter%5===0){const toR=[];gWarriors.forEach(w=>{if(w.age<60){w.age++;if(w.age===RETIRE_AGE)toR.push(w);}});toR.forEach(w=>enqueueRetire(w));
// gWarriors上限30名：超えたら最も古い成人を自動引退キューへ
if(gWarriors.length>30){const mature=gWarriors.filter(w=>w.isMature()&&!toR.includes(w));if(mature.length)enqueueRetire(mature[0]);}
}
state.koku+=Math.floor(rnd(70,120)*castleBonus);state.unification=Math.min(100,state.unification+.08);addCastleExp(1);applyStaffEducation();updateStatusUI();updatePartyRow();_sortedW=null;}

function devAddKoku(){state.koku+=5000;updateStatusUI();showToast('石高 +5000石',1500);}

function devAddPower(){[...gWarriors,...gParents].forEach(w=>w.stats.power=clamp(w.stats.power+20,1,99));updatePartyRow();showToast('全武将 武力+20',1500);}

function devAgeUp(){gWarriors.forEach(w=>w.age=Math.min(w.age+5,60));updatePartyRow();showToast('全武将 年齢+5',1500);}

function devRestoreHp(){[...gWarriors,...gParents].forEach(w=>w.stats.hp=w.stats.maxHp);updatePartyRow();showToast('全武将 体力全回復',1500);}

function devSetUnification(){state.unification=Math.min(100,state.unification+30);updateStatusUI();showToast('統一度 +30%',1500);}

function devAddWarrior(){const g=Math.random()<.5?'male':'female';const jd=generateJob(g);const w=new IsoWarrior(randName(g),jd,rnd(35,65),0,2+Math.random()*3,g,rnd(18,28));gWarriors.push(w);updatePartyRow();showToast('新武将「'+w.name+'」が参陣！',2000);}

function init(){
spawnStars();spawnPetals();const initData=[{name:'織田信長',gender:'male',age:28,power:72,bl:0},{name:'明智光秀',gender:'male',age:35,power:58,bl:6},{name:'お市',gender:'female',age:22,power:44,bl:10}];initData.forEach(d=>{const jd=generateJob(d.gender);const w=new IsoWarrior(d.name,jd,d.power,0,2.5+Math.random()*2,d.gender,d.age,d.bl);gWarriors.push(w);});updateStatusUI();updatePartyRow();updateCastleUI();addLog('戦国血脈 v6 開始。尾張より天下へ！');idleTimer=setInterval(performIdleTick,3800);drawIsoCanvas();}

window.addEventListener('DOMContentLoaded', init);
