const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const html=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8');
const original=html.match(/<script>([\s\S]*?)<\/script>/)[1];
function boot(store=new Map(),blocked=false,newPlayer=false){
 const nodes=new Map(),events=new Map(),gradient={addColorStop(){}},timers=new Map();let timerTime=0,nextTimer=1;
 const ctx=new Proxy({}, {get:(t,k)=>k.startsWith('create')?()=>gradient:()=>{},set:(t,k,v)=>(t[k]=v,true)});
 function node(id){if(!nodes.has(id))nodes.set(id,{hidden:false,style:{},dataset:{},_events:{},textContent:'',innerHTML:'',children:[],classList:{add(){},remove(){},toggle(){}},setAttribute(){},replaceChildren(){this.children=[]},append(n){this.children.push(n)},addEventListener(k,fn){this._events[k]=fn;events.set(String(id)+':'+k,fn)},getContext:()=>ctx});return nodes.get(id)}
 const sandbox={console,Math,performance:{now:()=>0},innerWidth:1280,innerHeight:800,devicePixelRatio:1,requestAnimationFrame(){},addEventListener(k,f){events.set('window:'+k,f)},setTimeout(fn,delay){const id=nextTimer++;timers.set(id,{fn,at:timerTime+delay});return id;},clearTimeout(id){timers.delete(id)},localStorage:{getItem(k){if(blocked)throw Error('Blocked');return store.get(k)||null},setItem(k,v){if(blocked)throw Error('Blocked');store.set(k,v)}},document:{hidden:false,getElementById:node,createElement:()=>({...node(Symbol()),children:[]}),querySelectorAll:()=>[],addEventListener(k,f){events.set('document:'+k,f)}}};
 sandbox.window=sandbox;sandbox.matchMedia=()=>({matches:false});
 const code=original.replace(/\}\)\(\);\s*$/,`${newPlayer?'':'profile.tutorialDone=true;'}globalThis.game={reset,update,draw,launch,aimAt,segmentCircle,togglePause,primaryAction,advanceOrbit,orbitSpeed,saveNow,packRun,validRun,resumeSaved,showMenu,startLevel,selectMode,showLevels,showAtlas,importProgress,systemForLevel,currentSystem,systemById,moveMap,jumpMap,moveAtlas,validDiscovery,sectorPosition,galaxyIndexForLevel,galaxyForLevel,browseGalaxy,showSectorInfo,renderGalaxyMap,visitSector,zoomGalaxy,centerGalaxy,completeTutorial,showSettings,resetProgress,restoreProgress,checkSaveEpoch,saveStorageKey,
 snapshot:()=>({state,previousState,mode,level,current,target,player,camera,score,jumps,combo,perfects,orbitBoost,orbitOffset,profile,savedRun,storageAvailable,runTime,particles,rings,shake,mapPage,atlasCursor,mapView,viewGalaxy,selectedSector,saveEpoch}),
 setArrivalBoost(v){orbitBoost=v},
 aim(){const h=Math.atan2(target.y-current.y,target.x-current.x),d=Math.hypot(target.x-current.x,target.y-current.y);player.a=h-player.dir*Math.acos((current.r+orbitOffset)/d);setOrbitPosition()},
 miss(){player.a=Math.atan2(target.y-current.y,target.x-current.x)+player.dir*Math.PI/2;setOrbitPosition()}};})();`);
 vm.createContext(sandbox);vm.runInContext(code,sandbox);return{g:sandbox.game,node,events,store,advanceTimers(ms){timerTime+=ms;for(const [id,t] of timers)if(t.at<=timerTime){timers.delete(id);t.fn();}}};
}
function jump(g){g.aim();g.launch();for(let i=0;i<1000&&g.snapshot().state==='flight';i++)g.update(1/120);assert(['orbit','won'].includes(g.snapshot().state));}
// A complete physical revolution is protected before gravity starts pulling.
let {g,node,store}=boot();g.reset(true);let initial=g.snapshot().current.r;
for(let i=0;i<470;i++)g.update(1/120);assert.equal(g.snapshot().current.r,initial);assert(g.snapshot().current.orbitTravel<Math.PI*2);
for(let i=0;i<120;i++)g.update(1/120);assert(g.snapshot().current.r<initial);assert.equal(g.snapshot().state,'orbit');
g.togglePause();let age=g.snapshot().current.age;g.update(10);assert.equal(g.snapshot().current.age,age);g.togglePause();
for(let i=0;i<1500&&g.snapshot().state!=='dead';i++)g.update(1/120);assert.equal(g.snapshot().state,'dead');assert.equal(g.snapshot().savedRun,null);assert(node('death-reason').textContent.toUpperCase().includes('ГРАВИТАЦИЯ'));
// Both directions and boosted arrivals get a full actual turn, at any level speed.
for(const fps of [24,60,144])for(const n of [1,3,20])for(const [dir,boost] of [[1,0],[-1,0],[1,3],[-1,3]]){
 const test=boot().g;test.snapshot().profile.unlocked=20;test.startLevel(n);jump(test);const p=test.snapshot().current;p.orbitTravel=0;p.shrinkAge=0;p.r=p.baseR;test.snapshot().player.dir=dir;test.setArrivalBoost(boost);
 const r0=p.r;while(p.orbitTravel<=Math.PI*2){test.update(1/fps);if(p.orbitTravel<=Math.PI*2){assert.equal(p.r,r0);assert.equal(p.shrinkAge,0);}}
 test.update(.02);assert(p.r<r0);
}
// Save/reload preserves revolution progress, radius, score, and discoveries.
g.startLevel(1);jump(g);for(let i=0;i<250;i++)g.update(1/120);g.saveNow();let before=JSON.parse(JSON.stringify(g.snapshot()));
assert(g.validRun(g.packRun()));let loaded=boot(store);g=loaded.g;assert(g.snapshot().savedRun);g.resumeSaved();assert.equal(g.snapshot().state,'paused');
assert.equal(g.snapshot().jumps,before.jumps);assert.equal(g.snapshot().score,before.score);assert.equal(g.snapshot().current.age,before.current.age);assert.equal(g.snapshot().current.r,before.current.r);assert.equal(g.snapshot().player.x,before.player.x);
assert.equal(g.snapshot().current.orbitTravel,before.current.orbitTravel);assert.equal(g.snapshot().current.shrinkAge,before.current.shrinkAge);
g.togglePause();assert.equal(g.snapshot().state,'orbit');g.update(.01);assert(g.snapshot().current.age>before.current.age);
// Saving and restoring a flight cannot reset it to an earlier orbit.
g.aim();g.launch();g.update(.1);g.saveNow();before=JSON.parse(JSON.stringify(g.snapshot()));loaded=boot(store);g=loaded.g;g.resumeSaved();assert.equal(g.snapshot().previousState,'flight');assert.equal(g.snapshot().player.vx,before.player.vx);g.togglePause();assert.equal(g.snapshot().state,'flight');
for(let i=0;i<1000&&g.snapshot().state==='flight';i++)g.update(1/120);assert.equal(g.snapshot().state,'orbit');
// Continue zooms into the saved sector, freezes physics during entry, then resumes.
g.saveNow();g.showMenu();const restoreAge=g.snapshot().savedRun.current.age;g.resumeSaved(true);assert.equal(g.snapshot().state,'entering');g.update(.8);g.draw();assert.equal(g.snapshot().current.age,restoreAge);g.update(1.2);assert.equal(g.snapshot().state,'orbit');assert.equal(g.snapshot().current.age,restoreAge);g.update(.02);assert(g.snapshot().current.age>restoreAge);
// Entry can be paused, and an in-flight entry resumes the exact saved flight.
g.aim();g.launch();g.update(.05);g.saveNow();g.showMenu();g.resumeSaved(true);g.togglePause();assert.equal(g.snapshot().state,'paused');assert.equal(g.snapshot().previousState,'flight');g.showMenu();g.resumeSaved(true);g.update(2);assert.equal(g.snapshot().state,'flight');
// Old version-2 attempts migrate without discarding their position or profile.
g.saveNow();const old=JSON.parse(store.get('orbit.progress.v2'));for(const p of [old.run.current,old.run.target]){delete p.orbitTravel;delete p.shrinkAge;delete p.skin;delete p.kind;}
const legacyRun=boot(new Map([['orbit.progress.v2',JSON.stringify(old)]]));assert(legacyRun.g.snapshot().savedRun);legacyRun.g.resumeSaved();assert.equal(legacyRun.g.snapshot().player.x,old.run.player.x);
// Locked levels cannot be started. The fourth level now opens a distinct real system.
({g,store}=boot());g.startLevel(2);assert.equal(g.snapshot().state,'menu');
const expected=[['neptune','sun',8],['b','star',2],['e','star',4],['b','star',1]];
for(let n=1;n<=4;n++){
 g.startLevel(n);assert.equal(g.snapshot().mode,'expedition');assert.equal(g.snapshot().current.entryId,expected[n-1][0]);
 for(let j=0;j<expected[n-1][2];j++)jump(g);
 const s=g.snapshot();assert.equal(s.state,'won');assert.equal(s.current.entryId,expected[n-1][1]);assert.equal(s.jumps,expected[n-1][2]);assert.equal(s.profile.unlocked,n+1);assert.equal(s.profile.completed[n].stars,3);assert.equal(s.savedRun,null);g.draw();
}
assert.equal(g.snapshot().profile.discovered.length,19);
loaded=boot(store);assert.equal(loaded.g.snapshot().profile.unlocked,5);assert.equal(loaded.g.snapshot().profile.discovered.length,19);
// Losing a level keeps completed levels and atlas entries but clears the active run.
g.startLevel(5);g.miss();g.launch();for(let i=0;i<1500&&g.snapshot().state!=='dead';i++)g.update(.01);assert.equal(g.snapshot().state,'dead');assert.equal(g.snapshot().profile.unlocked,5);assert.equal(g.snapshot().savedRun,null);
// Visiting menus freezes gravity, and returning from the menu restores the snapshot.
g.startLevel(5);g.update(.2);g.showMenu();assert.equal(g.snapshot().state,'menu');const savedAge=g.snapshot().savedRun.current.age;g.showAtlas('planets');g.update(15);assert.equal(g.snapshot().savedRun.current.age,savedAge);g.showMenu();g.resumeSaved();assert.equal(g.snapshot().current.age,savedAge);g.draw();
// Import merges progress, validates active runs, and never reduces existing records.
g.showMenu();const imported=JSON.parse(store.get('orbit.progress.v2'));const high=g.snapshot().profile.records.expedition,discoveredBeforeImport=g.snapshot().profile.discovered.length;imported.profile.records.expedition=0;imported.profile.unlocked=1;imported.profile.discovered=[];imported.run=null;g.importProgress(imported);assert.equal(g.snapshot().profile.records.expedition,high);assert.equal(g.snapshot().profile.unlocked,5);assert.equal(g.snapshot().profile.discovered.length,discoveredBeforeImport);
const broken=JSON.parse(JSON.stringify(imported));broken.run={phase:'orbit',player:{x:NaN}};assert.throws(()=>g.importProgress(broken));
// Old records migrate; corrupted data and unavailable storage do not crash gameplay.
let legacy=new Map([['orbit.best.v1','123']]);let migrated=boot(legacy);assert.equal(migrated.g.snapshot().profile.records.endless,123);migrated.g.reset(true);assert(migrated.g.validRun(migrated.g.packRun()));
let bad=boot(new Map([['orbit.progress.v2','{invalid']]));bad.g.reset(true);jump(bad.g);assert(bad.g.snapshot().score>0);
let blocked=boot(new Map(),true);assert.equal(blocked.g.snapshot().storageAvailable,false);blocked.g.startLevel(1);jump(blocked.g);assert(blocked.g.snapshot().score>0);
// A stale second tab cannot overwrite persistent unlocks with an older profile.
const shared=new Map(),tabA=boot(shared),tabB=boot(shared);tabA.g.startLevel(1);for(let i=0;i<8;i++)jump(tabA.g);tabB.g.reset(true);assert.equal(JSON.parse(shared.get('orbit.progress.v2')).profile.unlocked,2);
// Every level is a distinct stable system; generated routes survive cache eviction and reload.
const catalog=boot(),ids=new Set(),names=new Set(),biomes=new Set(),ninth=JSON.stringify(catalog.g.systemForLevel(12));let worldCount=0;
for(let n=1;n<=1001;n++){
 const s=catalog.g.systemForLevel(n);assert(!ids.has(s.id));assert(!names.has(s.name));ids.add(s.id);names.add(s.name);assert.equal(s.fictional,n>11);
 assert.equal(s.route.at(-1).kind,'star');assert(s.route.length>=2&&s.route.length<=11);assert.equal(new Set(s.route.map(w=>w.id)).size,s.route.length);
 for(const w of s.route){assert(Number.isFinite(w.hue)&&w.hue>=0&&w.hue<=360);assert(catalog.g.validDiscovery(s.id+'/'+w.id));biomes.add(w.kind);}worldCount+=s.route.length;
}
assert.equal(ids.size,1001);assert.equal(names.size,1001);assert.equal(catalog.g.systemForLevel(0),null);assert.equal(catalog.g.systemForLevel(1002),null);assert.equal(catalog.g.systemById('fiction-1001'),null);
assert.equal(JSON.stringify(catalog.g.systemForLevel(12)),ninth);assert.equal(JSON.stringify(boot().g.systemForLevel(12)),ninth);for(const kind of ['lava','ocean','crystal','ring','ice','gas','rock'])assert(biomes.has(kind));
// Bounded pages expose the expanded catalog, including the final partial page.
catalog.g.showLevels();assert.equal(catalog.node('level-grid').children.length,11);catalog.g.moveMap(1);assert(catalog.node('levels-page').textContent.startsWith('12–22'));
catalog.node('level-jump').value=1001;catalog.g.jumpMap();assert.equal(catalog.node('level-grid').children.length,11);assert(catalog.node('levels-next').disabled);assert(catalog.node('level-grid').children.every(n=>n.disabled));
catalog.g.showAtlas('systems');assert.equal(catalog.node('atlas-grid').children.length,11);catalog.g.moveAtlas(9999);assert.equal(catalog.node('atlas-grid').children.length,11);assert(catalog.node('atlas-grid').children.every(n=>n.innerHTML.includes('ВЫМЫШЛЕННАЯ')&&!n.innerHTML.includes('href="undefined"')));
catalog.g.showAtlas('planets');assert.equal(catalog.node('atlas-grid').children.length,catalog.g.systemForLevel(1001).route.length);
// Play through every added real system, the real/fiction boundary, and late campaign samples.
for(const n of [2,3,4,5,6,7,8,9,10,11,12,42,76,77,78,154,155,512,999,1000,1001]){
 const run=boot();run.g.snapshot().profile.unlocked=n;run.g.startLevel(n);const sys=run.g.currentSystem();
 assert(run.g.validRun(run.g.packRun()));if(sys.route.length>2)jump(run.g);run.g.saveNow();const checkpoint=JSON.parse(JSON.stringify(run.g.snapshot()));const reloaded=boot(run.store);reloaded.g.resumeSaved();assert.equal(reloaded.g.currentSystem().id,sys.id);assert.equal(reloaded.g.snapshot().current.entryId,checkpoint.current.entryId);reloaded.g.togglePause();
 for(let j=reloaded.g.snapshot().jumps;j<sys.route.length-1;j++)jump(reloaded.g);assert.equal(reloaded.g.snapshot().state,'won');assert.equal(reloaded.g.snapshot().profile.unlocked,Math.min(n+1,1001));assert.equal(reloaded.node('next-level').disabled,n===1001);
 if(n%77===0){assert(reloaded.node('win-title').textContent.includes('Центр галактики'));assert(reloaded.node('next-level').textContent.includes('Следующая галактика'));}
 if(n>11){reloaded.g.showAtlas('planets');if(n<1001)reloaded.g.moveAtlas(-1);assert(reloaded.node('atlas-grid').children.every(card=>!card.className.includes('locked')));assert(reloaded.node('atlas-grid').children.every(card=>card.innerHTML.includes('ХУДОЖЕСТВЕННАЯ')));}
}
// Each galaxy has exactly 77 ordered sectors tracing three inward turns.
const spiral=boot();assert.deepEqual(Array.from({length:4},(_,i)=>spiral.g.systemForLevel(i+1).id),['solar','proxima','barnard','ross128']);
assert.deepEqual(Array.from(spiral.g.systemForLevel(3).route,w=>w.id),['e','c','b','d','star']);
for(let galaxy=0;galaxy<13;galaxy++){
 let previousRadius=1,previousAngle=null,totalAngle=0;
 for(let slot=0;slot<77;slot++){
  const n=galaxy*77+slot+1,p=spiral.g.sectorPosition(n),radius=Math.hypot(p.x-.5,(p.y-.5)/.66),angle=Math.atan2((p.y-.5)/.66,p.x-.5);
  assert.equal(spiral.g.galaxyIndexForLevel(n),galaxy);assert(radius<previousRadius);previousRadius=radius;
  if(previousAngle!==null){let delta=angle-previousAngle;if(delta<0)delta+=Math.PI*2;totalAngle+=delta;}previousAngle=angle;
 }
 assert(Math.abs(totalAngle-Math.PI*6)<1e-9);assert(previousRadius<.05);
}
spiral.g.snapshot().profile.unlocked=78;spiral.g.showMenu();assert.equal(spiral.g.snapshot().viewGalaxy,1);assert.equal(spiral.node('galaxy-sectors').children.length,77);assert.equal(spiral.node('galaxy-sectors').children[0].dataset.level,'78');assert(spiral.node('galaxy-name').textContent.includes('АНДРОМЕДА'));
spiral.g.browseGalaxy(-1);assert.equal(spiral.node('galaxy-sectors').children[0].dataset.level,'1');spiral.g.browseGalaxy(99);assert.equal(spiral.g.snapshot().viewGalaxy,12);assert.equal(spiral.node('galaxy-sectors').children.at(-1).dataset.level,'1001');spiral.g.draw();spiral.g.centerGalaxy();assert.equal(spiral.g.snapshot().viewGalaxy,1);
// Version-3 checkpoints retain their actual system even when its campaign position changes.
const beforeRouteChange=boot();beforeRouteChange.g.snapshot().profile.unlocked=8;beforeRouteChange.g.startLevel(8);jump(beforeRouteChange.g);beforeRouteChange.g.saveNow();const oldRoute=JSON.parse(beforeRouteChange.store.get('orbit.progress.v2'));oldRoute.run.catalogVersion=3;oldRoute.run.level=6;oldRoute.profile.unlocked=6;
const routeReload=boot(new Map([['orbit.progress.v2',JSON.stringify(oldRoute)]]));assert(routeReload.g.snapshot().savedRun);routeReload.g.resumeSaved();assert.equal(routeReload.g.currentSystem().id,'kepler186');assert(routeReload.g.validRun(routeReload.g.packRun()));
// Old repeating level 4 restores the exact Solar System attempt instead of becoming Kepler-11.
const legacySource=boot();legacySource.g.startLevel(1);jump(legacySource.g);legacySource.g.saveNow();const oldCycle=JSON.parse(legacySource.store.get('orbit.progress.v2'));oldCycle.profile.unlocked=4;oldCycle.run.level=4;delete oldCycle.run.catalogVersion;delete oldCycle.run.systemId;
const cycle=boot(new Map([['orbit.progress.v2',JSON.stringify(oldCycle)]]));assert(cycle.g.snapshot().savedRun);cycle.g.resumeSaved();assert.equal(cycle.g.currentSystem().id,'solar');assert(cycle.g.validRun(cycle.g.packRun()));cycle.g.togglePause();for(let j=1;j<8;j++)jump(cycle.g);assert.equal(cycle.g.snapshot().state,'won');cycle.g.startLevel(5);assert.equal(cycle.g.currentSystem().id,'trappist');
// Departure keeps planets intact and emits no debris, shockwave or camera shake.
const peaceful=boot();peaceful.g.startLevel(1);const home=peaceful.g.snapshot().current,homeTexture=home.img;peaceful.g.aim();peaceful.g.launch();assert.equal(home.dead,false);assert.equal(home.departed,true);assert.equal(home.img,homeTexture);assert.equal(peaceful.g.snapshot().particles.length,0);assert.equal(peaceful.g.snapshot().rings.length,0);assert.equal(peaceful.g.snapshot().shake,0);
const restoredDeparture=boot(peaceful.store);restoredDeparture.g.resumeSaved();assert.equal(restoredDeparture.g.snapshot().current.dead,false);assert.equal(restoredDeparture.g.snapshot().current.departed,true);
const oldDeparture=JSON.parse(peaceful.store.get('orbit.progress.v2'));oldDeparture.run.current.dead=true;delete oldDeparture.run.catalogVersion;delete oldDeparture.run.systemId;const restoredOldDeparture=boot(new Map([['orbit.progress.v2',JSON.stringify(oldDeparture)]]));assert(restoredOldDeparture.g.snapshot().savedRun);assert.equal(restoredOldDeparture.g.snapshot().savedRun.current.dead,false);
// First-time instructions appear inside the first system, with gravity and movement frozen.
const newcomer=boot(new Map(),false,true);assert.equal(newcomer.g.snapshot().profile.tutorialDone,false);assert.equal(newcomer.g.snapshot().state,'menu');assert(!html.includes('class="card home-card"'));assert(!html.includes('id="mode-expedition"'));assert(!html.includes('id="hint"'));
assert(newcomer.node('galaxy-sectors').children.find(n=>n.dataset.level==='1').innerHTML.includes('Начать экспедицию'));
newcomer.g.startLevel(1,true);assert.equal(newcomer.g.snapshot().state,'entering');newcomer.g.update(2);assert.equal(newcomer.g.snapshot().state,'briefing');const briefAngle=newcomer.g.snapshot().player.a;newcomer.g.update(100);assert.equal(newcomer.g.snapshot().current.orbitTravel,0);assert.equal(newcomer.g.snapshot().player.a,briefAngle);
newcomer.g.saveNow();const reloadBrief=boot(newcomer.store,false,true);assert(reloadBrief.node('galaxy-sectors').children.find(n=>n.dataset.level==='1').innerHTML.includes('Продолжить экспедицию'));reloadBrief.g.resumeSaved(true);reloadBrief.g.update(2);assert.equal(reloadBrief.g.snapshot().state,'briefing');reloadBrief.g.completeTutorial();assert.equal(reloadBrief.g.snapshot().state,'orbit');assert.equal(reloadBrief.g.snapshot().profile.tutorialDone,true);assert.equal(reloadBrief.g.snapshot().current.orbitTravel,0);
reloadBrief.g.showMenu();reloadBrief.g.startLevel(1);assert.equal(reloadBrief.g.snapshot().state,'orbit');
const interruptedBrief=boot(new Map(),false,true);interruptedBrief.g.startLevel(1,true);interruptedBrief.g.togglePause();interruptedBrief.g.togglePause();assert.equal(interruptedBrief.g.snapshot().state,'briefing');
const noLateLesson=boot(new Map(),false,true);noLateLesson.g.snapshot().profile.unlocked=2;noLateLesson.g.startLevel(2);assert.equal(noLateLesson.g.snapshot().state,'orbit');noLateLesson.g.selectMode('endless');noLateLesson.g.reset(true);assert.equal(noLateLesson.g.snapshot().state,'orbit');
noLateLesson.g.aim();noLateLesson.g.launch();noLateLesson.g.update(.02);noLateLesson.g.showMenu();const endlessX=noLateLesson.g.snapshot().savedRun.player.x;noLateLesson.events.get('endless-flight:click')();assert.equal(noLateLesson.g.snapshot().state,'entering');noLateLesson.g.update(2);assert.equal(noLateLesson.g.snapshot().state,'flight');assert.equal(noLateLesson.g.snapshot().player.x,endlessX);
// Completed sectors expose descriptions and records on hover/focus; the frontier glows separately.
const mapTest=boot();mapTest.g.snapshot().profile.completed={1:{stars:3,score:42},2:{stars:2,score:20}};mapTest.g.snapshot().profile.unlocked=3;mapTest.g.showMenu();const sectors=mapTest.node('galaxy-sectors').children;
assert(sectors.find(n=>n.dataset.level==='3').innerHTML.includes('Продолжить экспедицию'));mapTest.g.showSectorInfo(3);assert(mapTest.node('sector-visit').textContent.includes('Продолжить экспедицию'));
const passed=sectors.find(n=>n.dataset.level==='1'),frontier=sectors.find(n=>n.dataset.level==='3');assert(passed.className.includes('completed'));assert(frontier.className.includes('current'));passed._events.pointerenter();assert.equal(mapTest.node('sector-info-title').textContent,'Солнечная система');assert(mapTest.node('sector-info-facts').textContent.includes('42'));assert.equal(mapTest.node('sector-info').hidden,false);
// Mouse departure closes the card, while crossing onto it or a new sector cancels dismissal.
const info=mapTest.node('sector-info');passed._events.pointerleave({pointerType:'mouse'});mapTest.advanceTimers(160);assert.equal(info.hidden,false);mapTest.advanceTimers(30);assert.equal(info.hidden,true);
passed._events.pointerenter();passed._events.pointerleave({pointerType:'mouse'});mapTest.advanceTimers(80);info._events.pointerenter();mapTest.advanceTimers(1000);assert.equal(info.hidden,false);info._events.pointerleave({pointerType:'mouse'});mapTest.advanceTimers(180);assert.equal(info.hidden,true);
passed._events.pointerenter();passed._events.pointerleave({pointerType:'mouse'});frontier._events.pointerenter();mapTest.advanceTimers(1000);assert.equal(info.hidden,false);assert.equal(mapTest.g.snapshot().selectedSector,3);
frontier._events.pointerleave({pointerType:'touch'});mapTest.advanceTimers(1000);assert.equal(info.hidden,false);frontier._events.blur({relatedTarget:{closest:()=>info}});mapTest.advanceTimers(1000);assert.equal(info.hidden,false);info._events.focusout({relatedTarget:null});mapTest.advanceTimers(180);assert.equal(info.hidden,true);
const oldLeft=frontier.style.left;mapTest.g.zoomGalaxy(1.8);assert.equal(mapTest.g.snapshot().mapView.z,1.8);assert.notEqual(frontier.style.left,oldLeft);mapTest.g.zoomGalaxy(100);assert.equal(mapTest.g.snapshot().mapView.z,5);mapTest.g.centerGalaxy();assert.equal(mapTest.g.snapshot().mapView.z,1);
mapTest.events.get('space:pointerdown')({button:0,clientX:100,clientY:100,preventDefault(){}});assert.equal(mapTest.g.snapshot().state,'menu');mapTest.events.get('space:pointermove')({clientX:140,clientY:125});assert.equal(mapTest.g.snapshot().mapView.x,40);assert.equal(mapTest.g.snapshot().mapView.y,25);mapTest.events.get('space:pointerup')();mapTest.g.visitSector(1);assert.equal(mapTest.g.snapshot().state,'entering');mapTest.g.update(2);assert.equal(mapTest.g.snapshot().level,1);
// Reset is reversible and uses a new storage epoch, so stale or old tabs cannot resurrect progress.
const resetStore=new Map(),owner=boot(resetStore);owner.g.startLevel(1);for(let j=0;j<8;j++)jump(owner.g);const staleResetTab=boot(resetStore);const priorPayload=resetStore.get('orbit.progress.v2');owner.g.showMenu();owner.g.showSettings();owner.g.resetProgress();
assert.equal(owner.g.snapshot().state,'menu');assert.equal(owner.g.snapshot().profile.unlocked,1);assert.equal(owner.g.snapshot().profile.discovered.length,0);assert.equal(owner.g.snapshot().profile.tutorialDone,false);assert.equal(owner.g.snapshot().profile.records.expedition,0);assert(resetStore.has('orbit.backup.v2'));assert(owner.g.snapshot().saveEpoch>0);
staleResetTab.g.saveNow();assert.equal(staleResetTab.g.snapshot().profile.unlocked,1);resetStore.set('orbit.progress.v2',priorPayload);resetStore.set('orbit.best.v1','999');const afterReset=boot(resetStore,false,true);assert.equal(afterReset.g.snapshot().profile.unlocked,1);assert.equal(afterReset.g.snapshot().profile.records.endless,0);assert.equal(afterReset.g.snapshot().profile.tutorialDone,false);
owner.g.restoreProgress();assert.equal(owner.g.snapshot().profile.unlocked,2);assert(owner.g.snapshot().profile.records.expedition>0);assert(owner.g.snapshot().profile.tutorialDone);owner.g.resetProgress();assert.equal(JSON.parse(resetStore.get('orbit.backup.v2')).profile.unlocked,2);
// Retain the exact-tangent regression across rotated and translated segments.
for(let i=0;i<20000;i++){
 const a=i*.7919,r=80,ux=Math.cos(a),uy=Math.sin(a),nx=-uy,ny=ux,p={x:350+i*.5,y:-55-i*.1,r};
 const x=p.x+nx*r-ux*100,y=p.y+ny*r-uy*100;
 assert(g.segmentCircle(x,y,x+ux*200,y+uy*200,p)!==null);
 assert.equal(g.segmentCircle(x+nx*.001,y+ny*.001,x+ux*200+nx*.001,y+uy*200+ny*.001,p),null);
}
assert(!html.includes('gravity-time'));assert(!html.includes('Орбита сжимается'));assert(!html.includes('ОРБИТА СЖИМАЕТСЯ'));
console.log(`PASS: interactive completed/current sectors, zoom and pan; first-system-only tutorial and paused gravity; reversible reset and stale-tab protection; 13 spiral galaxies × 77 systems; 1001 unique deterministic systems, ${worldCount} worlds; bounded catalog navigation; added real routes and late-game completion; final campaign boundary; fictional atlas and save/reload; old repeating-level migration; intact planets on departure; full-revolution grace; entry and pause; persistent progress/import/records; corrupt or blocked storage; 20,000 exact tangencies.`);
