import test from 'node:test';
import assert from 'node:assert/strict';
import {createState,movePlayer,engage,beginBattle,takeTurn,finishBattle,interact,saveGame,loadGame} from '../dist/office-rpg/rules.mjs';
import {blocked,findPath,POINTS} from '../dist/office-rpg/world.mjs';

test('walls and desks block movement; a clear tile permits one step',()=>{
 const s=createState();s.player.x=1;s.player.y=18;
 assert.equal(movePlayer(s,-1,0),false);assert.equal(s.player.x,1);
 assert.equal(movePlayer(s,1,0),true);assert.equal(s.player.x,2);
 assert.equal(blocked(3,10),true);
});
test('coffee, every coworker and the lift are reachable from reception',()=>{
 for(const p of Object.values(POINTS))assert.ok(findPath({x:14,y:17},p).length>0,JSON.stringify(p));
});
test('manager requires three unique departmental approvals',()=>{
 const s=createState();engage(s,'boss');assert.equal(s.dialogue.next,'explore');
 s.defeated=['hr','sales','product'];s.mode='explore';engage(s,'boss');assert.equal(s.dialogue.next,'battle');
});
test('matching evidence deals more damage to sales and one command gives one response',()=>{
 const a=createState(),b=createState();engage(a,'sales');beginBattle(a);engage(b,'sales');beginBattle(b);
 takeTurn(a,'receipts');takeTurn(b,'reply');assert.ok(a.battle.enemyHp<b.battle.enemyHp);
 assert.equal(a.battle.turn,1);assert.ok(a.player.hp<a.player.maxHp);
});
test('boundaries reduce the next response and cannot stack outside a turn',()=>{
 const a=createState(),b=createState();for(const s of[a,b]){engage(s,'hr');beginBattle(s);}
 takeTurn(a,'boundaries');takeTurn(b,'reply');assert.ok(a.player.hp>b.player.hp);
});
test('empty coffee does not consume a turn; recovery move has limited uses',()=>{
 const s=createState();engage(s,'sales');beginBattle(s);s.player.coffee=0;
 takeTurn(s,'coffee');assert.equal(s.battle.turn,0);
 for(let i=0;i<3;i++)takeTurn(s,'circle');const n=s.battle.turn;takeTurn(s,'circle');assert.equal(s.battle.turn,n);
});
test('victory grants one approval and recovery cannot remove it',()=>{
 const s=createState();engage(s,'hr');beginBattle(s);s.battle.enemyHp=1;takeTurn(s,'reply');assert.equal(s.battle.result,'won');finishBattle(s);assert.deepEqual(s.defeated,['hr']);
 engage(s,'sales');beginBattle(s);s.player.hp=1;takeTurn(s,'reply');assert.equal(s.battle.result,'lost');finishBattle(s);assert.deepEqual(s.defeated,['hr']);assert.ok(s.player.hp>0);assert.equal(s.mode,'explore');
});
test('fleeing ends combat without awarding an approval or immediate re-encounter',()=>{
 const s=createState();engage(s,'hr');beginBattle(s);takeTurn(s,'flee');finishBattle(s);assert.equal(s.defeated.length,0);assert.equal(s.mode,'explore');assert.ok(s.encounterGrace>0);
});
test('coffee station heals, then boss clearance lets the lift finish the game',()=>{
 const s=createState();s.player.hp=2;s.player.coffee=0;s.player.x=4;s.player.y=4;interact(s);assert.equal(s.player.hp,s.player.maxHp);assert.equal(s.player.coffee,2);
 s.mode='explore';s.defeated=['hr','sales','product','boss'];s.player.x=14;s.player.y=18;interact(s);assert.equal(s.mode,'complete');
});
test('saves survive reload, discard transient battles and reject corrupt positions',()=>{
 const s=createState();s.defeated=['hr'];s.player.hp=41;s.mode='battle';let loaded=loadGame(saveGame(s));assert.equal(loaded.mode,'explore');assert.equal(loaded.player.hp,41);assert.deepEqual(loaded.defeated,['hr']);
 loaded=loadGame('{invalid');assert.equal(loaded.player.hp,96);
 loaded=loadGame(JSON.stringify({version:1,player:{x:999,y:-5,hp:-10,coffee:500},defeated:['bogus','boss']}));assert.equal(loaded.player.x,14);assert.ok(loaded.player.hp>0);assert.equal(loaded.player.coffee,2);assert.equal(loaded.defeated.includes('boss'),false);
});
test('reload from the victory screen keeps the earned approval and recovery',()=>{
 const s=createState();engage(s,'hr');beginBattle(s);
 for(let i=0;i<4;i++)takeTurn(s,'boundaries');
 assert.equal(s.battle.result,'won');const restored=loadGame(saveGame(s));
 assert.deepEqual(restored.defeated,['hr']);assert.equal(restored.player.hp,94);
 assert.equal(s.mode,'battle');finishBattle(s);
 assert.equal(loadGame(saveGame(s)).player.hp,94);
});
test('reload from a loss recovers at coffee and keeps existing approvals',()=>{
 const s=createState();s.defeated=['hr'];engage(s,'sales');beginBattle(s);s.player.hp=1;
 takeTurn(s,'reply');const restored=loadGame(saveGame(s));
 assert.deepEqual(restored.defeated,['hr']);assert.deepEqual([restored.player.x,restored.player.y],[4,4]);
 assert.equal(restored.player.hp,96);assert.equal(restored.player.coffee,2);
});
