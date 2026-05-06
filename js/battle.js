// js/battle.js
// 戦闘システム

const PX=3;
const PAL_A={helm:'#1838b0',armor:'#1040c8',skin:'#f5c890',eye:'#201440',acc:'#c8a020',shadow:'#0a2060'};
const PAL_E={helm:'#a01828',armor:'#c01840',skin:'#f5c890',eye:'#400010',acc:'#c8a020',shadow:'#480c18'};
const B_LOG_HOLD=90;
const B_LINES_P=['かかれーっ！','討ち取れ！','引くな！','前へ！','者ども続け！'];
const B_LINES_E=['押せ押せ！','蹴散らせ！','逃がすな！','突き崩せ！','進め！'];
const B_DUEL=['一騎討ち！','尋常に勝負！','受けてみよ！','逃がさぬ！'];
const B_SKILL_MAX=100;

let bSoldiers,bGenerals,bSubGenerals=[],bGameState,bTickCount,bLoopId,bField;
let bLogText='',bLogTimer=0,bGenMaxHp={p:120,e:120},bActiveWarriors=[],bSkillGauge={p:0,e:0};


function makeSoldierShadow(pal,frame,state_){const H=pal.helm,A=pal.armor,S=pal.skin,E=pal.eye,C=pal.acc,D=pal.shadow;const b=frame?1:0;const px=[{x:2,y:b,c:H},{x:3,y:b,c:H},{x:4,y:b,c:H},{x:5,y:b,c:H},{x:1,y:1+b,c:H},{x:2,y:1+b,c:H},{x:3,y:1+b,c:H},{x:4,y:1+b,c:H},{x:5,y:1+b,c:H},{x:6,y:1+b,c:H},{x:3,y:-1+b,c:C},{x:4,y:-1+b,c:C},{x:2,y:2+b,c:S},{x:3,y:2+b,c:S},{x:4,y:2+b,c:S},{x:5,y:2+b,c:S},{x:3,y:3+b,c:E},{x:5,y:3+b,c:E},{x:2,y:4+b,c:S},{x:3,y:4+b,c:S},{x:4,y:4+b,c:S},{x:5,y:4+b,c:S},{x:1,y:5+b,c:A},{x:2,y:5+b,c:A},{x:3,y:5+b,c:C},{x:4,y:5+b,c:A},{x:5,y:5+b,c:C},{x:6,y:5+b,c:A},{x:1,y:6+b,c:A},{x:2,y:6+b,c:A},{x:3,y:6+b,c:A},{x:4,y:6+b,c:A},{x:5,y:6+b,c:A},{x:6,y:6+b,c:A},{x:1,y:7+b,c:D},{x:2,y:7+b,c:D},{x:3,y:7+b,c:D},{x:4,y:7+b,c:D},{x:5,y:7+b,c:D},{x:6,y:7+b,c:D},{x:frame?-1:0,y:5+b,c:A},{x:frame?-1:0,y:6+b,c:A},{x:frame?7:8,y:5+b,c:A},{x:frame?7:8,y:6+b,c:A},{x:2,y:8+b,c:D},{x:3,y:8+b,c:A},{x:4,y:8+b,c:A},{x:5,y:8+b,c:D},{x:2,y:9+b,c:'#333'},{x:3,y:9+b,c:'#333'},{x:4,y:9+b,c:'#333'},{x:5,y:9+b,c:'#333'}];if(state_==='attack')px.push({x:9,y:4+b,c:C},{x:10,y:3+b,c:C},{x:11,y:2+b,c:'#ddd'},{x:12,y:1+b,c:'#bbb'});return px.map(p=>`${p.x*PX}px ${p.y*PX}px 0 ${PX}px ${p.c}`).join(',');}

function makeGeneralShadow(pal,frame,state_){const H=pal.helm,A=pal.armor,S=pal.skin,E=pal.eye,C=pal.acc,D=pal.shadow;const b=frame?1:0;const px=[{x:1,y:b,c:H},{x:2,y:b,c:H},{x:3,y:b,c:H},{x:4,y:b,c:H},{x:5,y:b,c:H},{x:6,y:b,c:H},{x:7,y:b,c:H},{x:0,y:1+b,c:H},{x:1,y:1+b,c:H},{x:2,y:1+b,c:H},{x:3,y:1+b,c:H},{x:4,y:1+b,c:H},{x:5,y:1+b,c:H},{x:6,y:1+b,c:H},{x:7,y:1+b,c:H},{x:8,y:1+b,c:H},{x:3,y:-1+b,c:C},{x:4,y:-1+b,c:C},{x:5,y:-1+b,c:C},{x:4,y:-2+b,c:'#fff8e0'},{x:3,y:-2+b,c:C},{x:5,y:-2+b,c:C},{x:1,y:2+b,c:S},{x:2,y:2+b,c:S},{x:3,y:2+b,c:S},{x:4,y:2+b,c:S},{x:5,y:2+b,c:S},{x:6,y:2+b,c:S},{x:7,y:2+b,c:S},{x:2,y:3+b,c:S},{x:3,y:3+b,c:E},{x:4,y:3+b,c:S},{x:5,y:3+b,c:S},{x:6,y:3+b,c:E},{x:7,y:3+b,c:S},{x:4,y:4+b,c:'#c08060'},{x:1,y:4+b,c:S},{x:8,y:4+b,c:S},{x:0,y:5+b,c:C},{x:1,y:5+b,c:A},{x:2,y:5+b,c:A},{x:3,y:5+b,c:A},{x:4,y:5+b,c:C},{x:5,y:5+b,c:A},{x:6,y:5+b,c:A},{x:7,y:5+b,c:A},{x:8,y:5+b,c:C},{x:0,y:6+b,c:C},{x:1,y:6+b,c:A},{x:2,y:6+b,c:A},{x:3,y:6+b,c:A},{x:4,y:6+b,c:A},{x:5,y:6+b,c:A},{x:6,y:6+b,c:A},{x:7,y:6+b,c:A},{x:8,y:6+b,c:C},{x:0,y:7+b,c:C},{x:1,y:7+b,c:D},{x:2,y:7+b,c:D},{x:3,y:7+b,c:D},{x:4,y:7+b,c:D},{x:5,y:7+b,c:D},{x:6,y:7+b,c:D},{x:7,y:7+b,c:D},{x:8,y:7+b,c:C},{x:3,y:5+b,c:C},{x:5,y:5+b,c:C},{x:4,y:6+b,c:C},{x:3,y:7+b,c:C},{x:5,y:7+b,c:C},{x:frame?-2:-1,y:5+b,c:A},{x:frame?-2:-1,y:6+b,c:A},{x:frame?9:10,y:5+b,c:A},{x:frame?9:10,y:6+b,c:A},{x:1,y:8+b,c:D},{x:2,y:8+b,c:A},{x:3,y:8+b,c:A},{x:5,y:8+b,c:A},{x:6,y:8+b,c:A},{x:7,y:8+b,c:D},{x:2,y:9+b,c:'#222'},{x:3,y:9+b,c:'#222'},{x:5,y:9+b,c:'#222'},{x:6,y:9+b,c:'#222'}];if(state_==='attack'){for(let i=0;i<6;i++)px.push({x:9+i,y:5-i+b,c:i<2?C:i<4?'#dde':'#bbc'});}return px.map(p=>`${p.x*PX}px ${p.y*PX}px 0 ${PX}px ${p.c}`).join(',');}

function bYMin(){const f=$('bscr-frame');return f?f.clientHeight*.38:110;}

function bYMax(){const f=$('bscr-frame');return f?f.clientHeight*.88:270;}

function bFW(){const f=$('bscr-frame');return f?f.clientWidth:360;}

function bFH(){const f=$('bscr-frame');return f?f.clientHeight:300;}

function bSetLog(t){if(bLogTimer<=0){bLogText=t;bLogTimer=B_LOG_HOLD;}}

function bForceLog(t,h){bLogText=t;bLogTimer=h||B_LOG_HOLD;}

function bTickLog(){if(bLogTimer>0)bLogTimer--;$('battle-log-bar').textContent=bLogText;}

function bNearest(list,x,y){return list.reduce((b,t)=>Math.hypot(t.x-x,t.y-y)<Math.hypot(b.x-x,b.y-y)?t:b);}

function bFindFoe(s){const foes=bSoldiers.filter(t=>t.side!==s.side&&!t.dead);return foes.length?bNearest(foes,s.x,s.y):null;}

function bEl(id,cls){if(!bField)return document.createElement('div');let el=$('bu-'+id);if(!el){el=document.createElement('div');el.id='bu-'+id;el.className=cls;bField.appendChild(el);}return el;}

function bRender(u){const isGen=u.type==='general'||u.type==='subgen';const pal=u.side==='p'?PAL_A:PAL_E;const frame=(bTickCount>>3)&1;const cls='dot-unit'+(u.dead?' du-die':'')+(u.state==='hit'?' du-hit':'')+(u.state==='walk'&&!u.dead?' du-walk':'')+(u.awaken?' du-awaken':'');const el=bEl(u.id,cls);const _hash=frame+'|'+u.state+'|'+u.dead;if(el.className!==cls)el.className=cls;if(el._sh!==_hash){el._sh=_hash;el.style.boxShadow=isGen?makeGeneralShadow(pal,frame,u.state):makeSoldierShadow(pal,frame,u.state);}el.style.left=Math.round(u.x)+'px';el.style.top=Math.round(u.y)+'px';if(u.dead&&u._deadAt&&Date.now()-u._deadAt>700)el.style.display='none';if(isGen){const lel=bEl('lbl-'+u.id,'gen-label');lel.textContent=u.name+(u.type==='subgen'?'（副）':'');lel.style.left=(u.x+12)+'px';lel.style.top=(u.y-15)+'px';lel.style.display=u.dead?'none':'block';}const hbg=bEl('hpbg-'+u.id,'unit-hpbar');if(!u.dead){const bw=isGen?27:24;hbg.style.display='';hbg.style.width=bw+'px';hbg.style.left=(u.x-bw/2+(isGen?12.5:12))+'px';hbg.style.top=(u.y-9)+'px';let hfill=document.getElementById('bu-hpf-'+u.id);if(!hfill){hfill=document.createElement('div');hfill.className='unit-hpfill';hfill.id='bu-hpf-'+u.id;hbg.appendChild(hfill);}const pct=Math.max(0,u.hp/u.maxHp*100);hfill.style.width=pct+'%';hfill.style.background=pct>60?'#44ff88':pct>30?'#ffcc44':'#ff4444';}else hbg.style.display='none';}

function bAddDmg(x,y,val,color){const el=document.createElement('div');el.className='dmg-num';el.textContent=(val>0?'-':val<0?'+':'')+Math.abs(val);el.style.color=color||'#ffee40';el.style.left=x+'px';el.style.top=y+'px';bField.appendChild(el);setTimeout(()=>el.remove(),1050);}

function bAddSkillText(x,y,text,color){const el=document.createElement('div');el.className='skill-text';el.textContent=text;el.style.color=color||'#ffcc00';el.style.left=x+'px';el.style.top=y+'px';bField.appendChild(el);setTimeout(()=>el.remove(),1500);}

function bAddSkillFlash(x,y,color,size){const el=document.createElement('div');el.className='skill-flash';const s=size||60;el.style.width=s+'px';el.style.height=s+'px';el.style.background='radial-gradient(circle,'+color+' 0%,transparent 70%)';el.style.left=x+'px';el.style.top=y+'px';bField.appendChild(el);setTimeout(()=>el.remove(),700);}

function bAddBubble(side,text){const g=bGenerals[side];if(!g||g.dead)return;const old=document.getElementById('bu-bbl-'+side);if(old)old.remove();const el=document.createElement('div');el.id='bu-bbl-'+side;el.className='dot-bubble'+(side==='e'?' ene':'');el.textContent=text;el.style.left=(g.x+15)+'px';el.style.top=(g.y-32)+'px';bField.appendChild(el);setTimeout(()=>{if(el.parentNode)el.remove();},1900);}

function bUpdateBubblePos(){['p','e'].forEach(side=>{const g=bGenerals[side];if(!g)return;const el=document.getElementById('bu-bbl-'+side);if(el){el.style.left=(g.x+15)+'px';el.style.top=(g.y-32)+'px';}});}

function initSubUI(sub1,sub2){const p1=$('bsub-p1');if(sub1){p1.classList.remove('empty');$('bsub-p1-name').textContent=sub1.name;}else{p1.classList.add('empty');$('bsub-p1-name').textContent='―';$('bsub-p1-hp').textContent='―';}const p2=$('bsub-p2');if(sub2){p2.classList.remove('empty');$('bsub-p2-name').textContent=sub2.name;}else{p2.classList.add('empty');$('bsub-p2-name').textContent='―';$('bsub-p2-hp').textContent='―';}}

function bUpdateSubUI(){if(!bSubGenerals)return;const pSubs=bSubGenerals.filter(sg=>sg.side==='p');const eSubs=bSubGenerals.filter(sg=>sg.side==='e');const pIds=['bsub-p1','bsub-p2'],eIds=['bsub-e1','bsub-e2'],pBars=['bsub-p1-bar','bsub-p2-bar'],eBars=['bsub-e1-bar','bsub-e2-bar'],pHps=['bsub-p1-hp','bsub-p2-hp'],eHps=['bsub-e1-hp','bsub-e2-hp'];[0,1].forEach(i=>{const ps=pSubs[i];const pp=document.getElementById(pIds[i]);if(ps&&pp){const pct=Math.max(0,ps.hp/ps.maxHp*100);const bar=$(pBars[i]);if(bar){bar.style.width=pct+'%';bar.style.background=pct>50?'#44cc88':pct>25?'#ffaa44':'#ff4444';}const hpEl=$(pHps[i]);if(hpEl)hpEl.textContent=Math.max(0,Math.round(ps.hp));if(ps.dead&&pp)pp.style.opacity='0.35';}const es=eSubs[i];const ep=document.getElementById(eIds[i]);if(es&&ep){const pct=Math.max(0,es.hp/es.maxHp*100);const bar=$(eBars[i]);if(bar){bar.style.width=pct+'%';bar.style.background=pct>50?'#ff6666':pct>25?'#ff9944':'#cc2222';}const hpEl=$(eHps[i]);if(hpEl)hpEl.textContent=Math.max(0,Math.round(es.hp));if(es.dead&&ep)ep.style.opacity='0.35';}});}

function bUpdateUI(){if(!bGenerals)return;const ph=Math.max(0,bGenerals.p.hp),eh=Math.max(0,bGenerals.e.hp);$('bhp-player').textContent=ph;$('bhp-enemy').textContent=eh;$('bbar-player').style.width=Math.min(100,(ph/bGenMaxHp.p*100)).toFixed(1)+'%';$('bbar-enemy').style.width=Math.min(100,(eh/bGenMaxHp.e*100)).toFixed(1)+'%';$('bskill-bar-p').style.width=(bSkillGauge.p/B_SKILL_MAX*100)+'%';$('bskill-bar-e').style.width=(bSkillGauge.e/B_SKILL_MAX*100)+'%';$('bskill-btn-p').disabled=bSkillGauge.p<B_SKILL_MAX||bGameState==='end';bUpdateSubUI();}

function fireSkill(side){if(!bGenerals||bSkillGauge[side]<B_SKILL_MAX||bGameState==='end')return;bSkillGauge[side]=0;const sk=SKILLS[side][Math.floor(Math.random()*SKILLS[side].length)];const g=bGenerals['p'];bAddBubble('p','【'+sk.name+'】');bAddSkillFlash(g.x+15,g.y+15,sk.color,90);bAddSkillText(g.x+15,g.y-20,'【'+sk.name+'】',sk.color);bForceLog('必殺技【'+sk.name+'】発動！',B_LOG_HOLD*2);if(sk.name==='士気高揚'){bSoldiers.filter(s=>s.side==='p'&&!s.dead).forEach(s=>{s.hp=Math.min(s.maxHp,s.hp+15);});bGenerals.p.hp=Math.min(bGenMaxHp.p,bGenerals.p.hp+Math.floor(bGenMaxHp.p*.15));bSubGenerals.filter(sg=>sg.side==='p'&&!sg.dead).forEach(sg=>{sg.hp=Math.min(sg.maxHp,sg.hp+Math.floor(sg.maxHp*.15));});bAddDmg(g.x+15,g.y-10,-(Math.floor(bGenMaxHp.p*.15)),'#44ff88');addLog('必殺技【'+sk.name+'】：味方HP回復！');}else if(sk.aoe){const dmg=Math.floor((bGenMaxHp.p*.08+rnd(5,15))*sk.dmg);bSoldiers.filter(s=>s.side==='e'&&!s.dead).forEach(s=>{s.hp-=dmg;s.state='hit';s.stateTimer=14;if(s.hp<=0){s.dead=true;s._deadAt=Date.now();}});bGenerals.e.hp-=Math.floor(dmg*.5);bGenerals.e.state='hit';bGenerals.e.stateTimer=20;bSubGenerals.filter(sg=>sg.side==='e'&&!sg.dead).forEach(sg=>{sg.hp-=Math.floor(dmg*.4);sg.state='hit';sg.stateTimer=16;if(sg.hp<=0){sg.dead=true;sg._deadAt=Date.now();}});bAddSkillFlash(bFW()/2,bFH()/2,sk.color,180);bAddDmg(bFW()/2,bFH()/3,dmg,sk.color);addLog('必殺技【'+sk.name+'】：全敵に'+dmg+'ダメージ！');}else{const dmg=Math.floor((bGenMaxHp.p*.2+rnd(10,25))*sk.dmg);bGenerals.e.hp-=dmg;bGenerals.e.state='hit';bGenerals.e.stateTimer=30;bAddSkillFlash(bGenerals.e.x+18,bGenerals.e.y+15,sk.color,80);bAddDmg(bGenerals.e.x+18,bGenerals.e.y-15,dmg,sk.color);addLog('必殺技【'+sk.name+'】：敵将に'+dmg+'の大ダメージ！');}}

function bEnemySkillAI(){if(bSkillGauge.e<B_SKILL_MAX)return;bSkillGauge.e=0;const sk=SKILLS.e[Math.floor(Math.random()*SKILLS.e.length)];bAddBubble('e','【'+sk.name+'】');bAddSkillFlash(bGenerals.e.x+18,bGenerals.e.y+15,sk.color,80);bForceLog('敵の必殺技【'+sk.name+'】！',B_LOG_HOLD*2);if(sk.aoe){const dmg=Math.floor((bGenMaxHp.e*.07+rnd(4,12))*sk.dmg);bSoldiers.filter(s=>s.side==='p'&&!s.dead).forEach(s=>{s.hp-=dmg;s.state='hit';s.stateTimer=12;if(s.hp<=0){s.dead=true;s._deadAt=Date.now();}});bGenerals.p.hp-=Math.floor(dmg*.4);bGenerals.p.state='hit';bGenerals.p.stateTimer=16;bSubGenerals.filter(sg=>sg.side==='p'&&!sg.dead).forEach(sg=>{sg.hp-=Math.floor(dmg*.35);sg.state='hit';sg.stateTimer=14;if(sg.hp<=0){sg.dead=true;sg._deadAt=Date.now();}});bAddSkillFlash(bFW()/3,bFH()/2,sk.color,140);}else{const dmg=Math.floor((bGenMaxHp.e*.18+rnd(8,20))*sk.dmg);bGenerals.p.hp-=dmg;bGenerals.p.state='hit';bGenerals.p.stateTimer=28;bAddDmg(bGenerals.p.x+15,bGenerals.p.y-15,dmg,'#ff4444');}}

function bUpdateSoldiers(){
bSoldiers.forEach(s=>{
if(s.dead)return;if(s.stateTimer>0){s.stateTimer--;return;}
s.target=s.target&&!s.target.dead?s.target:bFindFoe(s);const yMin=bYMin(),yMax=bYMax();if(!s.target){
const gen=bGenerals[s.side==='p'?'e':'p'];if(gen.dead)return;const dx=gen.x+12-s.x,dy=gen.y+15-s.y,dist=Math.hypot(dx,dy)||1;if(dist<24){s.state='attack';s.stateTimer=22;const dmg=rnd(2,4);gen.hp-=dmg;gen.state='hit';gen.stateTimer=12;bAddDmg(gen.x+PX*2,gen.y-8,dmg,'#ff5050');bSetLog((s.side==='p'?'我が軍':'敵軍')+'が大将に'+dmg+'撃！');bSkillGauge.p=Math.min(B_SKILL_MAX,bSkillGauge.p+(s.side==='p'?3:0));bSkillGauge.e=Math.min(B_SKILL_MAX,bSkillGauge.e+(s.side==='e'?3:0));}
else{s.state='walk';s.x+=dx/dist*1.4;s.y+=dy/dist*1.4;s.y=Math.max(yMin,Math.min(yMax,s.y));}
return;}
const t=s.target,dx=t.x-s.x,dy=t.y-s.y,dist=Math.hypot(dx,dy)||1;if(dist<21){s.state='attack';s.stateTimer=16;const dmg=rnd(3,6);t.hp-=dmg;t.state='hit';t.stateTimer=10;bAddDmg(t.x+PX,t.y-8,dmg);bSkillGauge.p=Math.min(B_SKILL_MAX,bSkillGauge.p+(s.side==='p'?5:2));bSkillGauge.e=Math.min(B_SKILL_MAX,bSkillGauge.e+(s.side==='e'?5:2));if(t.hp<=0){t.dead=true;t._deadAt=Date.now();bSetLog((s.side==='p'?'敵軍':'我が軍')+'の兵士が倒れた！');}}
else{
let spx=0,spy=0;bSoldiers.forEach(o=>{if(o===s||o.dead||o.side!==s.side)return;const ax=s.x-o.x,ay=s.y-o.y,ad=Math.hypot(ax,ay)||1;if(ad<24){spx+=ax/ad*(24-ad)/24*1.5;spy+=ay/ad*(24-ad)/24*1.5;}});s.state='walk';s.x+=dx/dist*1.1+spx;s.y+=dy/dist*1.1+spy;s.y=Math.max(yMin,Math.min(yMax,s.y));}
});}

function bUpdateGenerals(){['p','e'].forEach(side=>{
const g=bGenerals[side],foe=bGenerals[side==='p'?'e':'p'];if(g.dead)return;if(g.stateTimer>0){g.stateTimer--;return;}
g.state='charge';const yMin=bYMin()-14,yMax=bYMax()+14;if(bTickCount%(side==='p'?160:180)===(side==='p'?0:80))bAddBubble(side,(side==='p'?B_LINES_P:B_LINES_E)[rnd(0,4)]);const foeTroops=bSoldiers.filter(s=>s.side!==side&&!s.dead);const tgt=foeTroops.length?bNearest(foeTroops,g.x,g.y):null;if(tgt){const dx=tgt.x-g.x,dy=tgt.y-g.y,dist=Math.hypot(dx,dy)||1;if(dist<30){g.state='attack';g.stateTimer=18;const dmg=rnd(9,15);tgt.hp-=dmg;tgt.state='hit';tgt.stateTimer=12;bAddDmg(tgt.x,tgt.y-10,dmg,'#ffdd20');bSkillGauge[side]=Math.min(B_SKILL_MAX,bSkillGauge[side]+8);if(tgt.hp<=0){tgt.dead=true;tgt._deadAt=Date.now();bSetLog('大将が敵兵を薙ぎ払った！');}}else{g.x+=dx/dist*1.9;g.y+=dy/dist*1.9;g.y=Math.max(yMin,Math.min(yMax,g.y));}}
else{const dx=foe.x-g.x,dy=foe.y-g.y,dist=Math.hypot(dx,dy)||1;if(dist<36){g.state='attack';g.stateTimer=28;const dmg=rnd(14,22);foe.hp-=dmg;foe.state='hit';foe.stateTimer=24;bAddDmg(foe.x+PX,foe.y-14,dmg,'#ff4020');bAddBubble(side,B_DUEL[rnd(0,3)]);bSkillGauge[side]=Math.min(B_SKILL_MAX,bSkillGauge[side]+12);bForceLog('大将同士の一騎討ち！ '+dmg+'ダメージ！',B_LOG_HOLD*2);}else{g.x+=dx/dist*1.9;g.y+=dy/dist*1.9;g.y=Math.max(yMin,Math.min(yMax,g.y));}}
});}

function bUpdateSubGenerals(){
if(!bSubGenerals||!bGenerals)return;const SEP=52,fw=bFW();const all=[bGenerals.p,bGenerals.e,...bSubGenerals,...bSoldiers];bSubGenerals.forEach(sg=>{
if(sg.dead)return;if(sg.stateTimer>0){sg.stateTimer--;return;}
const yMin=bYMin()-8,yMax=bYMax()+8;let sx=0,sy2=0;all.forEach(o=>{
if(o===sg||o.dead)return;const ax=sg.x-o.x,ay=sg.y-o.y,ad=Math.hypot(ax,ay)||1;if(ad<SEP){const f=(SEP-ad)/SEP*4.5;sx+=ax/ad*f;sy2+=ay/ad*f;}
});const sepMag=Math.hypot(sx,sy2);if(sepMag>3.5){
sg.x+=sx*.7;sg.y+=sy2*.7;sg.y=Math.max(yMin,Math.min(yMax,sg.y));sg.x=Math.max(8,Math.min(fw-8,sg.x));sg.state='walk';return;}
const foes=[...bSoldiers.filter(s=>s.side!==sg.side&&!s.dead),
bGenerals[sg.side==='p'?'e':'p'],
...bSubGenerals.filter(o=>o.side!==sg.side&&!o.dead)].filter(Boolean);if(!foes.length){sg.x+=sx;sg.y+=sy2;sg.y=Math.max(yMin,Math.min(yMax,sg.y));return;}
const tgt=bNearest(foes,sg.x,sg.y);const dx=tgt.x-sg.x,dy=tgt.y-sg.y,dist=Math.hypot(dx,dy)||1;if(dist<32){
sg.state='attack';sg.stateTimer=24;const dmg=rnd(6,12);tgt.hp-=dmg;tgt.state='hit';tgt.stateTimer=12;bAddDmg(tgt.x+PX,tgt.y-10,dmg,'#ffaa20');bSkillGauge[sg.side]=Math.min(B_SKILL_MAX,bSkillGauge[sg.side]+6);if(tgt.hp<=0){tgt.dead=true;tgt._deadAt=Date.now();bSetLog(sg.side==='p'?'副将が敵を討ち取った！':'敵副将が我が軍を倒した！');}
}else{
sg.state='walk';const spd=1.4;sg.x+=dx/dist*spd+sx*.5;sg.y+=dy/dist*spd+sy2*.5;sg.y=Math.max(yMin,Math.min(yMax,sg.y));}
sg.x=Math.max(8,Math.min(fw-8,sg.x));});}

function bEndBattle(isWin){
const cb=castleLvData().kokuBonus;let extraMsg='';if(isWin){
let reward=Math.floor(rnd(1800,2400)*cb),uniGain=4+Math.random()*3;if(currentEnemy?.province){const p=currentEnemy.province;p.clan='player';uniGain=8+Math.random()*4;reward+=rnd(800,1400);extraMsg='\n【'+p.name+'】を平定！';addLog('【天下図】'+p.name+'を制圧');showToast('🎉 '+p.name+' を平定！',4000);}
state.koku+=reward;state.unification=Math.min(100,state.unification+uniGain);bActiveWarriors.forEach(w=>{w.stats.power=clamp(w.stats.power+rnd(3,7),1,99);w.stats.hp=Math.min(w.stats.maxHp,w.stats.hp+rnd(8,15));});$('bres-title-text').textContent='勝利！';$('bres-detail-text').textContent='石高 +'+reward.toLocaleString()+'\n統一度 +'+uniGain.toFixed(1)+'%'+extraMsg;addLog('合戦勝利(報酬'+reward+'石)');addCastleExp(50);}else{
const loss=rnd(400,700);state.koku=Math.max(0,state.koku-loss);bActiveWarriors.forEach(w=>{w.stats.hp=Math.max(1,w.stats.hp-rnd(15,25));});$('bres-title-text').textContent='敗北…';$('bres-detail-text').textContent='石高 -'+loss.toLocaleString()+'\n武将が負傷した';addLog('合戦敗北(損失'+loss+'石)');addCastleExp(10);}
currentEnemy=null;$('battle-result-panel').classList.add('show');updateStatusUI();updatePartyRow();}

function bGameLoop(){
bTickCount++;if(bGameState==='battle'&&bGenerals&&bSoldiers){
bUpdateSoldiers();bUpdateGenerals();bUpdateSubGenerals();bTickLog();bUpdateBubblePos();if(bTickCount%60===0)bEnemySkillAI();bSoldiers.forEach(s=>bRender(s));bRender(bGenerals.p);bRender(bGenerals.e);if(bSubGenerals)bSubGenerals.forEach(sg=>bRender(sg));bUpdateUI();if(bGenerals.p.hp<=0||bGenerals.e.hp<=0){bGameState='end';bEndBattle(bGenerals.p.hp>0);}
}
if(bGameState!=='end')bLoopId=requestAnimationFrame(bGameLoop);}

function launchBattle(warriors){
if(bLoopId){cancelAnimationFrame(bLoopId);bLoopId=null;}
bActiveWarriors=warriors;bSubGenerals=[];$('battle-screen').classList.add('show');$('battle-result-panel').classList.remove('show');$('battle-log-bar').textContent='両軍、突撃開始！';bField=$('dot-field');bField.innerHTML='';bSkillGauge={p:0,e:0};const fw=bFW(),yMin=bYMin(),yMax=bYMax(),fh=bFH();const leader=warriors[0],sub1=warriors[1]||null,sub2=warriors[2]||null;$('bunit-pname').textContent=leader?leader.name.slice(-3):'我が軍';const en=currentEnemy?currentEnemy.name:'敵　軍';$('bunit-ename').textContent=en.slice(0,4);const pp=clamp(Math.round(warriors.reduce((s,w)=>s+w.getEffectivePower()+w.getEffectiveWisdom(),0)/warriors.length),60,160);const ep=clamp(Math.round((currentEnemy?currentEnemy.strength*1.5:120)+state.unification*.5),60,220);bGenMaxHp={p:pp,e:ep};bGameState='battle';bTickCount=0;bLogText='両軍、突撃開始！';bLogTimer=B_LOG_HOLD*2;bSoldiers=[];const sc=Math.min(6,3+warriors.length);const midY=(yMin+yMax)/2;const rowH=Math.max(28,Math.min(38,(yMax-yMin)/(Math.ceil(sc/2)+1)));for(let i=0;i<sc;i++){
const col=i%2,row=Math.floor(i/2);const py=midY+(row-Math.floor(Math.ceil(sc/2)/2))*rowH+col*10;bSoldiers.push({id:'ps'+i,type:'soldier',side:'p',x:fw*.18+col*22,y:clamp(py,yMin+4,yMax-4),state:'walk',stateTimer:rnd(0,8),hp:24,maxHp:24,target:null,dead:false,_deadAt:0,awaken:false});}
const ec=Math.min(3+Math.floor(state.unification/18),6);for(let i=0;i<ec;i++){
const col=i%2,row=Math.floor(i/2);const py=midY+(row-Math.floor(Math.ceil(ec/2)/2))*rowH+col*10;bSoldiers.push({id:'es'+i,type:'soldier',side:'e',x:fw*.82-col*22,y:clamp(py,yMin+4,yMax-4),state:'walk',stateTimer:rnd(0,8),hp:24,maxHp:24,target:null,dead:false,_deadAt:0,awaken:false});}
bGenerals={
p:{id:'pg',type:'general',side:'p',name:leader?leader.name.slice(-3):'大将',x:fw*.08,y:midY-10,hp:pp,maxHp:pp,state:'charge',stateTimer:0,dead:false,awaken:false},
e:{id:'eg',type:'general',side:'e',name:en.slice(0,3),x:fw*.88,y:midY-10,hp:ep,maxHp:ep,state:'charge',stateTimer:0,dead:false,awaken:false},
};if(sub1){const sp=clamp(sub1.getEffectivePower(),40,140);bSubGenerals.push({id:'psg0',type:'subgen',side:'p',name:sub1.name.slice(-2),x:fw*.10,y:clamp(midY-50,yMin+4,yMax-4),hp:sp,maxHp:sp,state:'walk',stateTimer:0,dead:false,awaken:false});}
if(sub2){const sp=clamp(sub2.getEffectivePower(),40,140);bSubGenerals.push({id:'psg1',type:'subgen',side:'p',name:sub2.name.slice(-2),x:fw*.10,y:clamp(midY+50,yMin+4,yMax-4),hp:sp,maxHp:sp,state:'walk',stateTimer:0,dead:false,awaken:false});}
['甲','乙'].forEach((n,i)=>{const sp=clamp(Math.round(ep*.6),30,120);bSubGenerals.push({id:'esg'+i,type:'subgen',side:'e',name:'副将'+n,x:fw*.86,y:clamp(midY+(i===0?-50:50),yMin+4,yMax-4),hp:sp,maxHp:sp,state:'walk',stateTimer:0,dead:false,awaken:false});});initSubUI(sub1,sub2);$('bhp-player').textContent=pp;$('bhp-enemy').textContent=ep;$('bbar-player').style.width='100%';$('bbar-enemy').style.width='100%';$('bskill-btn-p').disabled=true;setTimeout(()=>{bAddBubble('p',B_LINES_P[0]);bAddBubble('e',B_LINES_E[0]);},300);bLoopId=requestAnimationFrame(bGameLoop);}

function closeBattle(){if(bLoopId){cancelAnimationFrame(bLoopId);bLoopId=null;}$('battle-screen').classList.remove('show');if(bField)bField.innerHTML='';}
