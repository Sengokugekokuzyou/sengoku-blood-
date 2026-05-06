'use strict';

// ── ユーティリティ ──
const $=id=>document.getElementById(id);
function rnd(lo,hi){return Math.floor(lo+Math.random()*(hi-lo+1));}
function clamp(v,lo,hi){return Math.max(lo,Math.min(hi,v));}
function getAgeModifier(age){if(age>=MATURE_AGE)return 1;if(age<=14)return .6;return .7+(age-15)*.06;}

// ── ゲーム定数 ──
const ENGUMI_COST=600,MATURE_AGE=20,RETIRE_AGE=20,MAX_STAFF=4,MAX_FORMATION=3;
const HPX=2;
const CASTLE_LEVELS=[
{lv:1,name:'小屋',kokuBonus:1.0,powerBonus:1.0,maxExp:200,upgCost:800,upgDesc:'鍛錬場・学問所を拡張'},
{lv:2,name:'陣屋',kokuBonus:1.2,powerBonus:1.05,maxExp:600,upgCost:2000,upgDesc:'城壁を整備し防衛力強化'},
{lv:3,name:'館',kokuBonus:1.5,powerBonus:1.12,maxExp:1500,upgCost:5000,upgDesc:'天守閣の基礎を建造'},
{lv:4,name:'城',kokuBonus:2.0,powerBonus:1.20,maxExp:4000,upgCost:12000,upgDesc:'五重天守を完成させる'},
{lv:5,name:'天下城',kokuBonus:3.0,powerBonus:1.35,maxExp:99999,upgCost:99999,upgDesc:'天下統一の象徴'},
];

const FACILITY_EFFECT={training:{stat:'power',label:'武力',color:'#ffcc44',range:[5,11],costHp:-6},forge:{stat:'power',label:'武力',color:'#ffaa44',range:[4,9],costHp:-5},academy:{stat:'wisdom',label:'知力',color:'#aaddff',range:[5,10],costHp:-4},tea:{stat:'hp',label:'体力',color:'#88ffcc',range:[12,18],costHp:8},garden:{stat:'hp',label:'体力',color:'#ff88cc',range:[18,25],costHp:15},loyalty:{stat:'loyalty',label:'忠誠',color:'#ffdd88',range:[7,14],costHp:-3}};

const FACILITY_MAP={training:{name:'鍛錬場',color:'#cc8800',icon:'🏋️'},forge:{name:'鍛冶場',color:'#aa6600',icon:'⚒️'},academy:{name:'学問所',color:'#4488cc',icon:'📚'},tea:{name:'茶室',color:'#88cc88',icon:'🍵'},garden:{name:'庭園',color:'#cc88aa',icon:'🌸'},loyalty:{name:'忠義堂',color:'#ccaa44',icon:'🏮'}};

const FACILITY_POSITIONS=[{key:'training',tx:0,ty:1},{key:'forge',tx:1,ty:2},{key:'academy',tx:-1,ty:2},{key:'tea',tx:2,ty:0},{key:'garden',tx:-2,ty:0},{key:'loyalty',tx:0,ty:3}];

const JOB_DEFS=[{id:0,name:'武官',icon:'⚔️',gender:'male'},{id:1,name:'文官',icon:'📜',gender:'male'},{id:2,name:'姫',icon:'🌸',gender:'female'},{id:3,name:'姫武将',icon:'🌸',gender:'female'},{id:4,name:'軍師',icon:'🪭',gender:'any'},{id:5,name:'忍者',icon:'🌑',gender:'any'}];

const BLOODLINES=[
{id:0,name:'織田流',color:'#c83030',bonus:'power'},{id:1,name:'徳川流',color:'#4488cc',bonus:'wisdom'},
{id:2,name:'武田流',color:'#ffaa00',bonus:'power'},{id:3,name:'上杉流',color:'#44cc88',bonus:'wisdom'},
{id:4,name:'毛利流',color:'#cc7733',bonus:'power'},{id:5,name:'島津流',color:'#cc3333',bonus:'power'},
{id:6,name:'伊達流',color:'#dd4444',bonus:'power'},{id:7,name:'豊臣流',color:'#ddcc00',bonus:'wisdom'},
{id:8,name:'北条流',color:'#888888',bonus:'wisdom'},{id:9,name:'今川流',color:'#aa88cc',bonus:'power'},
{id:10,name:'浅井流',color:'#88aacc',bonus:'wisdom'},{id:11,name:'朝倉流',color:'#cc8844',bonus:'power'},
{id:12,name:'三好流',color:'#aa66aa',bonus:'wisdom'},{id:13,name:'宇喜多流',color:'#ccaa88',bonus:'power'},
{id:14,name:'立花流',color:'#44bb66',bonus:'power'},{id:15,name:'黒田流',color:'#aaaa44',bonus:'wisdom'},
{id:16,name:'細川流',color:'#aa99cc',bonus:'wisdom'},{id:17,name:'長曾我部流',color:'#33aa55',bonus:'power'},
{id:18,name:'龍造寺流',color:'#cc2222',bonus:'power'},{id:19,name:'大友流',color:'#aa8800',bonus:'wisdom'},
];

const SURNAMES=['織田','豊臣','徳川','武田','上杉','毛利','伊達','島津','長曾我部','北条','今川','斎藤','浅井','朝倉','松永','三好','宇喜多','立花','黒田','細川'];

const GIVEN_NAMES_M=['信長','秀吉','家康','信玄','謙信','元就','政宗','義久','元親','氏康','義元','道三','長政','義景','久秀','長慶','直家','道雪','如水','幽斎','勝家','利家','光秀','秀長','半兵衛','官兵衛','兼続','慶次','幸村','昌幸'];

const GIVEN_NAMES_F=['茶々','ねね','帰蝶','お市','松','江','千姫','春日局','淀殿','小督','お梶','阿茶','寧々','旭姫','亀姫','振姫','珠姫','天姫','千代','鶴姫'];

const GROWTH_EVENTS=[
{tier:'daily',id:'train_ok',label:'訓練成功',icon:'⚔️',desc:'地道な鍛錬が実を結んだ',apply(w){const g=rnd(2,5);w.stats.power=clamp(w.stats.power+g,1,99);return{text:'+武力'+g,color:'#ffcc44'};}},
{tier:'daily',id:'study_ok',label:'学問励行',icon:'📚',desc:'書物から多くを学んだ',apply(w){const g=rnd(2,5);w.stats.wisdom=clamp(w.stats.wisdom+g,1,99);return{text:'+知力'+g,color:'#aaddff'};}},
{tier:'daily',id:'meal',label:'食事',icon:'🍚',desc:'滋養たっぷりの食事で回復',apply(w){const g=rnd(10,20);w.stats.hp=clamp(w.stats.hp+g,1,w.stats.maxHp);return{text:'+体力'+g,color:'#88ffcc'};}},
{tier:'daily',id:'slack',label:'サボり',icon:'😴',desc:'今日は気が乗らなかった…',apply(w){const g=rnd(1,3);w.stats.power=clamp(w.stats.power-g,1,99);w.stats.wisdom=clamp(w.stats.wisdom-g,1,99);return{text:'-武力/知力'+g,color:'#ff8888'};}},
{tier:'daily',id:'argue',label:'口論',icon:'💢',desc:'仲間と言い合いになった',apply(w){const g=rnd(2,6);w._loyalty=clamp(w._loyalty-g,0,100);return{text:'-忠誠'+g,color:'#ff6666'};}},
{tier:'daily',id:'patrol',label:'見回り',icon:'🏯',desc:'城内を見回り経験を積んだ',apply(w){w.stats.power=clamp(w.stats.power+1,1,99);w.stats.wisdom=clamp(w.stats.wisdom+1,1,99);return{text:'+武力/知力 1',color:'#ffdd88'};}},
{tier:'daily',id:'rest',label:'休養',icon:'🌙',desc:'ゆっくり休んで体力回復',apply(w){const g=rnd(15,25);w.stats.hp=clamp(w.stats.hp+g,1,w.stats.maxHp);return{text:'+体力'+g,color:'#88ffcc'};}},
{tier:'daily',id:'encourage',label:'激励',icon:'🔥',desc:'仲間に励まされ士気が上がった',apply(w){const g=rnd(3,7);w._loyalty=clamp(w._loyalty+g,0,100);return{text:'+忠誠'+g,color:'#ffdd88'};}},
{tier:'rare',id:'master',label:'師匠に出会う',icon:'🧙',desc:'名高い師に弟子入りした！',apply(w){const gp=rnd(5,10),gw=rnd(5,10);w.stats.power=clamp(w.stats.power+gp,1,99);w.stats.wisdom=clamp(w.stats.wisdom+gw,1,99);return{text:'+武力'+gp+' 知力'+gw,color:'#88ccff'};}},
{tier:'rare',id:'secret',label:'秘伝習得',icon:'📜',desc:'古の秘技を習得した！',apply(w){const g=rnd(8,14);w.stats.power=clamp(w.stats.power+g,1,99);return{text:'+武力'+g+'（秘伝）',color:'#aaddff'};}},
{tier:'rare',id:'hard_train',label:'特訓成功',icon:'💪',desc:'血のにじむ特訓が大きな成果！',apply(w){const gp=rnd(7,13);w.stats.power=clamp(w.stats.power+gp,1,99);w.stats.hp=clamp(w.stats.hp-8,1,w.stats.maxHp);return{text:'+武力'+gp+' HP-8',color:'#ffaa44'};}},
{tier:'rare',id:'insight',label:'悟り',icon:'✨',desc:'深夜の修行で悟りを開いた！',apply(w){const g=rnd(7,13);w.stats.wisdom=clamp(w.stats.wisdom+g,1,99);return{text:'+知力'+g+'（悟り）',color:'#88ccff'};}},
{tier:'rare',id:'rival',label:'ライバル出現',icon:'⚡',desc:'好敵手の登場で互いを高め合う！',apply(w){const g=rnd(4,8);w.stats.power=clamp(w.stats.power+g,1,99);w.stats.wisdom=clamp(w.stats.wisdom+g,1,99);return{text:'+武力/知力'+g,color:'#ffcc88'};}},
{tier:'rare',id:'gift',label:'才能開花',icon:'🌸',desc:'眠れる才能が開花し始めた！',apply(w){const g=rnd(6,12);const stat=Math.random()<.5?'power':'wisdom';w.stats[stat]=clamp(w.stats[stat]+g,1,99);return{text:'+'+(stat==='power'?'武力':'知力')+g,color:'#ffaaff'};}},
{tier:'divine',id:'awakening',label:'【覚　醒】',icon:'🌟',desc:'天賦の才が一気に目覚めた！！',apply(w){const op=w.stats.power,ow=w.stats.wisdom;w.stats.power=clamp(Math.floor(w.stats.power*1.8+rnd(10,20)),1,99);w.stats.wisdom=clamp(Math.floor(w.stats.wisdom*1.8+rnd(10,20)),1,99);return{text:'覚醒！武力'+op+'→'+w.stats.power+' 知力'+ow+'→'+w.stats.wisdom,color:'#ffdd00'};}},
{tier:'divine',id:'betrayal',label:'【裏　切】',icon:'🗡️',desc:'突然の裏切り…忠誠が崩壊した！！',apply(w){const old=w._loyalty;w._loyalty=Math.max(0,Math.floor(w._loyalty*.1));w.stats.hp=clamp(w.stats.hp-rnd(30,50),1,w.stats.maxHp);return{text:'忠誠崩壊 '+old+'→'+w._loyalty,color:'#ff4444'};}},
{tier:'divine',id:'rampage',label:'【暴　走】',icon:'💀',desc:'制御不能の暴走状態に！！',apply(w){w.stats.hp=clamp(w.stats.hp-rnd(40,60),1,w.stats.maxHp);w.stats.power=clamp(w.stats.power+rnd(15,25),1,99);w._loyalty=clamp(w._loyalty-rnd(20,35),0,100);return{text:'暴走！武力大幅UP・HP大損失',color:'#ff6600'};}},
{tier:'divine',id:'genius',label:'【天才誕生】',icon:'👑',desc:'歴史に残る天才が覚醒した！！！',apply(w){w.stats.power=clamp(w.stats.power+rnd(25,35),1,99);w.stats.wisdom=clamp(w.stats.wisdom+rnd(25,35),1,99);w.stats.maxHp=clamp(w.stats.maxHp+rnd(30,50),100,200);w.stats.hp=w.stats.maxHp;return{text:'天才覚醒！全能力+大幅UP',color:'#ffe040'};}},
];

const EVENT_TIER_WEIGHTS={daily:.80,rare:.17,divine:.03};

const SKILLS={
p:[{name:'千本槍',color:'#ffcc44',dmg:0.8,aoe:true},{name:'鬼神斬',color:'#ff6622',dmg:1.8,aoe:false},{name:'士気高揚',color:'#44ffaa',dmg:0,aoe:false}],
e:[{name:'鉄砲斉射',color:'#ff4444',dmg:0.9,aoe:true},{name:'獅子奮迅',color:'#ff2222',dmg:2.0,aoe:false},{name:'包囲陣',color:'#ff8800',dmg:0.6,aoe:true}],
};

const PROVINCES=[
{id:1,name:'尾張',x:240,y:238,clan:'player',strength:65,adj:[2,3,4]},
{id:2,name:'美濃',x:210,y:255,clan:'saito',strength:72,adj:[1,5,12]},
{id:3,name:'三河',x:268,y:226,clan:'tokugawa',strength:58,adj:[1,11,8]},
{id:4,name:'甲斐',x:182,y:193,clan:'takeda',strength:85,adj:[1,5,6]},
{id:5,name:'信濃',x:198,y:217,clan:'takeda',strength:78,adj:[2,4,6,7]},
{id:6,name:'上野',x:158,y:160,clan:'hojo',strength:70,adj:[4,5,7]},
{id:7,name:'武蔵',x:138,y:141,clan:'hojo',strength:82,adj:[5,6,8]},
{id:8,name:'相模',x:128,y:116,clan:'hojo',strength:75,adj:[3,7]},
{id:9,name:'近江',x:226,y:272,clan:'azai',strength:62,adj:[2,10,12]},
{id:10,name:'山城',x:215,y:291,clan:'ashikaga',strength:55,adj:[9,11,12]},
{id:11,name:'摂津',x:235,y:295,clan:'miyoshi',strength:68,adj:[3,10,13]},
{id:12,name:'越前',x:199,y:274,clan:'asakura',strength:60,adj:[2,5,9]},
{id:13,name:'播磨',x:215,y:318,clan:'bessho',strength:52,adj:[11,14]},
{id:14,name:'備前',x:215,y:348,clan:'ukita',strength:65,adj:[13,15]},
{id:15,name:'安芸',x:195,y:378,clan:'mouri',strength:80,adj:[14,16]},
{id:16,name:'周防',x:178,y:405,clan:'mouri',strength:72,adj:[15,17]},
{id:17,name:'長門',x:160,y:420,clan:'mouri',strength:68,adj:[16,18]},
{id:18,name:'豊前',x:175,y:445,clan:'otomo',strength:58,adj:[17,19]},
{id:19,name:'筑前',x:155,y:462,clan:'otomo',strength:62,adj:[18,20]},
{id:20,name:'薩摩',x:148,y:495,clan:'shimazu',strength:90,adj:[19]},
{id:21,name:'阿波',x:268,y:380,clan:'choso',strength:55,adj:[22]},
{id:22,name:'土佐',x:255,y:410,clan:'choso',strength:68,adj:[21]},
];

const CLAN_COLORS={player:'#c8960c',saito:'#4a6a3a',tokugawa:'#3a5a7a',takeda:'#7a1a1a',hojo:'#1a2a6a',azai:'#4a2a6a',ashikaga:'#6a4a1a',miyoshi:'#2a6a4a',asakura:'#5a4a2a',bessho:'#3a4a2a',ukita:'#6a3a2a',mouri:'#2a4a6a',otomo:'#5a2a4a',shimazu:'#1a4a3a',choso:'#4a3a1a'};

const BL_EXT=[
{id:0, n:'織田流',    c:'#e03030',g:'武',i:'🔥',b:'power',  lo:'天下布武を掲げた覇道の血。攻撃本能が際立つ'},
{id:1, n:'武田流',    c:'#ffaa00',g:'武',i:'🐯',b:'power',  lo:'風林火山。山岳で鍛えられた剛の武脈'},
{id:2, n:'島津流',    c:'#cc2222',g:'武',i:'⚡',b:'power',  lo:'示現流の猛々しさ。鬼島津の血が滾る'},
{id:3, n:'伊達流',    c:'#dd5555',g:'武',i:'🐉',b:'power',  lo:'独眼竜の奔放さ。華美と武が混じりあう'},
{id:4, n:'徳川流',    c:'#4488cc',g:'智',i:'🌊',b:'wisdom', lo:'忍耐と謀略。泰平の礎を築く深謀の系譜'},
{id:5, n:'豊臣流',    c:'#ddcc00',g:'智',i:'🌸',b:'wisdom', lo:'百姓から天下人へ。機転と人心掌握の極み'},
{id:6, n:'今川流',    c:'#aa88cc',g:'智',i:'📖',b:'wisdom', lo:'学問と文化の守護者。詩歌に通じた才智の血'},
{id:7, n:'三好流',    c:'#bb66bb',g:'智',i:'🎭',b:'wisdom', lo:'室町の実力者。政治的駆け引きに長けた謀臣'},
{id:8, n:'大友流',    c:'#cc9900',g:'智',i:'⚓',b:'wisdom', lo:'南蛮交易の要衝。外交と商才が血に宿る'},
{id:9, n:'上杉流',    c:'#44cc88',g:'将',i:'🏔️',b:'command',lo:'義の将・謙信の血統。軍律と統制の化身'},
{id:10,n:'毛利流',    c:'#cc7733',g:'将',i:'🌿',b:'command',lo:'三本の矢。合議と結束が生む不抜の大組織'},
{id:11,n:'北条流',    c:'#888888',g:'将',i:'🏯',b:'command',lo:'関東の雄。内政と守城に極まる鉄壁の系譜'},
{id:12,n:'朝倉流',    c:'#cc8844',g:'将',i:'🌄',b:'command',lo:'一乗谷の文化と軍政。組織力を誇る北陸の雄'},
{id:13,n:'立花流',    c:'#44bb66',g:'将',i:'⚔️',b:'command',lo:'鬼道雪・誾千代。男女問わぬ鉄の将帥の血'},
{id:14,n:'浅井流',    c:'#88aaee',g:'霊',i:'💠',b:'loyalty',lo:'信義と哀愁。儚くも気高き魂の系譜'},
{id:15,n:'黒田流',    c:'#aaaa44',g:'霊',i:'🕯️',b:'loyalty',lo:'如水の深謀と信仰。精神の強さが血に宿る'},
{id:16,n:'細川流',    c:'#aa99cc',g:'霊',i:'🌙',b:'loyalty',lo:'文武両道の公家武将。精神的高潔さが際立つ'},
{id:17,n:'宇喜多流',  c:'#ccaa88',g:'霊',i:'🌟',b:'loyalty',lo:'備前の梟雄。乱世を生き抜く強靭な精神力の血'},
{id:18,n:'長曾我部流',c:'#33bb55',g:'忍',i:'🌊',b:'power',  lo:'土佐一条の鯨。海と陸を駆ける自由の戦士'},
{id:19,n:'龍造寺流',  c:'#cc2255',g:'忍',i:'🐊',b:'power',  lo:'肥前の熊。豪胆さと野性的な奇襲戦術の血'},
];

const TRAITS=[
{id:'genius',   n:'天才',   cls:'t-ge',w:5,  special:true, ap(s){s.power=Math.min(99,s.power+10);s.wisdom=Math.min(99,s.wisdom+10);}},
{id:'sickly',   n:'病弱',   cls:'t-si',w:8,  ap(s){s._loyalty=Math.max(1,s._loyalty-10);}},
{id:'ambitious',n:'野心家', cls:'t-am',w:10, ap(s){s._loyalty=Math.max(1,s._loyalty-15);s.stats.power=Math.min(99,s.stats.power+5);}},
{id:'loyal',    n:'忠義者', cls:'t-lo',w:8,  ap(s){s._loyalty=Math.min(99,s._loyalty+15);}},
{id:'fierce',   n:'剛勇',   cls:'t-fi',w:10, ap(s){s.stats.power=Math.min(99,s.stats.power+8);}},
{id:'wise',     n:'智謀',   cls:'t-wi',w:10, ap(s){s.stats.wisdom=Math.min(99,s.stats.wisdom+8);}},
{id:'cursed',   n:'呪縛',   cls:'t-cu',w:3,  ap(s){s.stats.power=Math.max(1,s.stats.power-8);s.stats.wisdom=Math.max(1,s.stats.wisdom-8);}},
];

const NICKS=(()=>{
const k=(a,b)=>a<b?`${a}-${b}`:`${b}-${a}`;const m=new Map([
[k('武','霊'),{rank:'SS',label:'完全共鳴！！',bonus:12,scMult:.92,sp:{name:'魂砕鬼将',fl:'剛と魂の完全共鳴',sb:{power:5,loyalty:5}}}],
[k('智','将'),{rank:'S', label:'理想配合！', bonus:8, scMult:.85,sp:{name:'軍師双璧',fl:'謀と軍が合わさり戦略の極みへ',sb:{wisdom:4,command:4}}}],
[k('武','忍'),{rank:'S', label:'理想配合！', bonus:8, scMult:.85,sp:{name:'鬼焔一閃',fl:'剛力と奇襲が爆発',sb:{power:6}}}],
[k('武','智'),{rank:'A', label:'好配合',     bonus:5, scMult:.70,sp:{name:'知勇兼備',fl:'知恵と武勇を兼備',sb:{power:2,wisdom:2}}}],
[k('将','霊'),{rank:'A', label:'好配合',     bonus:5, scMult:.70,sp:{name:'義将覚醒',fl:'忠臣を引き寄せる義将',sb:{command:3,loyalty:3}}}],
[k('智','忍'),{rank:'A', label:'好配合',     bonus:5, scMult:.70,sp:{name:'奇謀縦横',fl:'予測不能な謀略',sb:{wisdom:3}}}],
[k('武','将'),{rank:'B', label:'普通',        bonus:2, scMult:.60,sp:null}],
[k('智','霊'),{rank:'B', label:'普通',        bonus:2, scMult:.60,sp:null}],
[k('将','忍'),{rank:'B', label:'普通',        bonus:2, scMult:.60,sp:null}],
[k('霊','忍'),{rank:'B', label:'普通',        bonus:2, scMult:.60,sp:null}],
]);['武','智','将','霊','忍'].forEach(g=>m.set(k(g,g),{rank:'C',label:'相性薄',bonus:0,scMult:.50,sp:null}));return{
get(aId,bId){
const ga=BM.get(aId)?.g||'武', gb=BM.get(bId)?.g||'武';return m.get(k(ga,gb))||{rank:'C',label:'相性薄',bonus:0,scMult:.50,sp:null};},
rankColor:{SS:'#ffd700',S:'#f0c040',A:'#cc88ff',B:'#66ddaa',C:'#aaa'}
};})()


const SCT_GEN=[
[60,.50,80,.20,92,.05],[65,.50,82,.22,93,.06],[70,.52,84,.25,94,.07],
[74,.54,86,.28,94,.08],[78,.56,88,.30,95,.09],[80,.58,89,.32,95,.10],
[82,.60,90,.34,96,.11],[84,.62,91,.36,96,.12],[86,.65,92,.40,97,.15],
];function getGenCaps(gen){const r=SCT_GEN[Math.min(gen,9)-1]||SCT_GEN[8];return[{t:r[0],m:r[1]},{t:r[2],m:r[3]},{t:r[4],m:r[5]}];}
function applyGenCap(raw,gen,scMult,isGenius){
const caps=getGenCaps(gen);let v=raw;for(const{t,m} of caps)if(v>t){let e=Math.max(m,scMult);if(isGenius)e=Math.min(1,e+.5*(1-e));v=t+(v-t)*e;}
return Math.min(99,Math.floor(v));}

const state={koku:1200,unification:0,turn:0,generation:1,log:[],pedigree:[],castle:{lv:1,exp:0}};let gWarriors=[],gParents=[],gStaff=[];let retireTarget=null,retireQueue=[];let idleTimer=null,ageTickCounter=0;let engumiStep=0,engumiSelectedFather=null,engumiSelectedMother=null;