//By tsukuYomi
/// <reference path = "./tmath.ts" />
/// <reference path ="./pool.ts" />
/// <reference path ="./prefabObject.ts" />
/// <reference path ="./lineoffset.ts" />
/// <reference path ="layersetting.ts"/>

import kaboom, { KaboomCtx, Vec2 } from "kaboom";
import { layersetting } from "./layersetting";
import { offset } from "./lineoffset";
import { pool } from "./pool";
import { prefab } from "./prefabObject";
import { tmath } from "./tmath";

type Randi = ((n: number) =>  number) | ((a: number, b: number) => number)

declare let randi: Randi
declare let origin:KaboomCtx['origin'];
kaboom();

const SHOOTER_SPRITE_ID="ifimdjcanulvme";
const AIMLINE_SPRITE_ID="cnoenrcvhuo";

loadSprite(prefab.Buttle.BULLTE_SPRITE_ID,"/sprite/buttle.png");
loadSprite(prefab.Enemy.ENEMY_SPRITE_ID,"/sprite/enemy.png",{sliceX:2,anims:{
    cir:{
        from:0,
        to:0
    },
    rect:{
        from:1,
        to:1
    }
}});
loadSprite(SHOOTER_SPRITE_ID,"/sprite/shooter.png");
loadSprite(AIMLINE_SPRITE_ID,"/sprite/aimline.png");
loadSprite(prefab.Enemy.ENEMY_EFFECT_SPRITE_ID,"/sprite/bufficon.png",{
    sliceX:5,anims:{
        empty:{
            from:0,
            to:0
        },
        attackup:{
            from:1,
            to:1
        },
        buttlenumup:{
            from:2,
            to:2
        },
        frozen:{
            from:3,
            to:3
        },
        star:{
            from:4,
            to:4
        }
    }
});
offset.InitOffset();


var SHOOTER_COLD_DOWN=10;
var BIG_ENEMY_COLD_DOWN=10;
var MID_ENEMY_COLD_DOWN=3;
var SUM_COLD_DOWN=3;
var FROZEN_TIME=5;

let starCount=0;
let score=0;
let spawnColddown=0;
let bigCooldown=BIG_ENEMY_COLD_DOWN;
let midCooldown=MID_ENEMY_COLD_DOWN;
let sumCooldown=SUM_COLD_DOWN;
let spawnArr=Array<number>(offset.SETTING_LINE_NUM);
for(let i=0;i<offset.SETTING_LINE_NUM;++i){
    spawnArr[i]=0;
}
let buttlePool:pool.ObjectPool<prefab.Buttle>=new pool.ObjectPool<prefab.Buttle>(prefab.Buttle);
let EnemyPool:pool.ObjectPool<prefab.Enemy>=new pool.ObjectPool<prefab.Enemy>(prefab.Enemy);
let isFrozen=false;

let gameState=0;
/*
0->GAME_MENU
1->GAME_RUN
2->GAME_OVER
3->GAME_PAUSE
*/

const shooter=add(
    [
        "shooter",
        sprite(SHOOTER_SPRITE_ID),
        pos(offset.SHOOTER_POS),
        rotate(90),
        origin("center"),
        {
            buttleNum:30,
            attack:1,
            face:vec2(0,-1),
            colddown:0,
        },
        z(layersetting.SHOOTER_LAYER),
    ]
);
shooter.hidden=true;
const aimLine=add(
    [
        sprite(AIMLINE_SPRITE_ID),
        pos(offset.SHOOTER_POS),
        origin("right"),
        rotate(90),
        z(layersetting.HINTLINE_LAYER),
    ]
)
shooter.hidden=true;


onUpdate(shooterUpdate);

let inputLock=false;
let inputLockId;

onTouchStart((id,pos)=>{
    if(!inputLock){
        updateShooterRotato(pos);
        inputLock=true;
        inputLockId=id;
    }
})
onTouchEnd((id,pos)=>{
    if(inputLockId==id){
        inputLock=false;
    }
})
onTouchMove((id,pos)=>{
    if(id==inputLockId)
        updateShooterRotato(pos);
});
onMouseDown(updateShooterRotato);

onUpdate(()=>{
    if(gameState!=1) return;
    buttlePool.forEach((obj)=>{
        if(obj.gameObject.hidden) return;
        obj.ButtleUpdate();
        if(obj.gameObject.pos.y>=offset.BALL_RECYCLE_LINE){
            shooter.buttleNum++;
            buttlePool.DestroyObject(obj);
        }
    })
})

onUpdate(()=>{
    if(gameState!=1) return;
    EnemyPool.forEach((obj)=>{
        if(obj.gameObject.hidden) return;
        obj.EnemyUpdate(isFrozen);
        if(obj.gameObject.hp<=0){
            EnemyPool.DestroyObject(obj);
        }
        if(obj.gameObject.pos.y>width()+20){
            EnemyPool.DestroyObject(obj);
        }
    })    
})

onUpdate(SpawnEnemy);

onCollide("Buttle","Enemy",(objA,objB)=>{
    if(objA.hidden||objB.hidden) return;
    score++;
    if(objB.area.shape=="circle")
    objA.towardVec=tmath.GetReflectionVector(
        objA.towardVec,
        tmath.GetNormalVector(
            objA.pos,
            objB.pos
        )
    )
    else{
        let dx=Math.abs(objA.pos.x-objB.pos.x);
        let dy=Math.abs(objA.pos.y-objB.pos.y);
        if(dx>dy){
            objA.towardVec.x*=-1;
        }else{
            objA.towardVec.y*=-1;
        }
    }
    objB.hp-=objA.attack;
})



/*/test fun//
// let t=buttlePool.GetObject();
// t.Init(center(),vec2(1,0));
onMousePress((pos)=>{
    let r=EnemyPool.GetObject();
    r.Init(15,pos,(randi(0,2)==1)?"circle":"rect");
})

/*/// function 

function shooterUpdate(){
    if(gameState!=1) return;
    if(shooter.colddown>0)shooter.colddown-=1;
    if(shooter.buttleNum>0&&shooter.colddown<=0){
        shooter.colddown=SHOOTER_COLD_DOWN;
        shooter.buttleNum--;
        let tmp=buttlePool.GetObject();
        tmp.Init(offset.SHOOTER_POS,shooter.face,shooter.attack);
    }
}

function updateShooterRotato(activePos:Vec2){
    if(gameState!=1) return;
    if(activePos.y>=shooter.pos.y) return;
    if(activePos.x==shooter.pos.x) {
        shooter.angle=90;
        shooter.face=vec2(0,-1);
        aimLine.angle=shooter.angle;
        return;
    }
    let tvec=vec2(Math.abs(activePos.x-offset.SHOOTER_POS.x),Math.abs(activePos.y-offset.SHOOTER_POS.y));
    let deg=rad2deg(Math.atan(tvec.y/tvec.x));
    debug.log(String(deg));
    shooter.face=tmath.Normalized(vec2(activePos.x-offset.SHOOTER_POS.x,activePos.y-offset.SHOOTER_POS.y));
    if(activePos.x<shooter.pos.x)
        shooter.angle=deg;
    else
        shooter.angle=180-deg; 
    aimLine.angle=shooter.angle;
}

function SpawnEnemy(){
    if(gameState!=1) return;
    if(spawnColddown<=0){
        spawnColddown+=offset.SPAWN_COLD_DOWN;
    }else{
        if(!isFrozen)
            spawnColddown-=dt();
        return;
    }
    if(sumCooldown<=0){
        if(bigCooldown<=0){
            if(chance(0.5)){
                let tmp=randi(0,offset.SETTING_LINE_NUM-2);
                EnemyPool.GetObject().Init(10,offset.GetSpawnPos(tmp,3),chance(0.5)?"circle":"rect",3);
                spawnArr[tmp]=spawnArr[tmp+1]=spawnArr[tmp+2]=3;
                sumCooldown=SUM_COLD_DOWN;
                bigCooldown=BIG_ENEMY_COLD_DOWN;
            }
        }
        if(midCooldown<=0&&sumCooldown<=0){
            if(chance(0.5)){
                let tmp=randi(0,offset.SETTING_LINE_NUM-1);
                EnemyPool.GetObject().Init(10,offset.GetSpawnPos(tmp,2),chance(0.5)?"circle":"rect",2) ;
                spawnArr[tmp]=spawnArr[tmp+1]=2;
                sumCooldown=SUM_COLD_DOWN;
                midCooldown=MID_ENEMY_COLD_DOWN;
            }
        }
    }
    for(let i=0;i<offset.SETTING_LINE_NUM;++i){
        if(spawnArr[i]==0&&chance(0.85)){
            EnemyPool.GetObject().Init(10,offset.GetSpawnPos(i,1),chance(0.5)?"circle":"rect",1) ;
        }else{
            spawnArr[i]--;
        }
            
    }
    sumCooldown--;
    bigCooldown--;
    midCooldown--;
    
}
//TODO
function GameStateController(state:number){
    gameState=state;
    switch(state){
        case 0:
        let btnStart=add([
            
        ])
        //尝试销毁结算界面
        //生成主页按钮
            break;
        case 1:
        //尝试销毁主页按钮
        //显示HUB，GUI，shooter
            break;
        case 2:

        //尝试销毁暂停界面
        //隐藏HUB,GUI,shooter
        //生成结算界面
            break;
        case 3:
        //生成暂停界面
            break;
    }
}

//TODO 特效

function GetBuff(pos:Vec2,type:number){
    switch(type){
        case 1:
            shooter.attack++;
        case 2:
            shooter.buttleNum++;
        case 3:
            isFrozen=true;
            wait(FROZEN_TIME,()=>{
                isFrozen=false;
            })
        case 4:
            starCount++;
    }
}
