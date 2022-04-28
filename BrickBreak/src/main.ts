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

//TODO  生成函数

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
        shotspeedup:{
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

const shooter=add(
    [
        "shooter",
        sprite(SHOOTER_SPRITE_ID),
        pos(offset.SHOOTER_POS),
        rotate(90),
        origin("center"),
        {
            buttleNum:30,
            face:vec2(0,-1),
            colddown:0,
        },
        z(layersetting.SHOOTER_LAYER),
    ]
);

const aimLine=add(
    [
        sprite(AIMLINE_SPRITE_ID),
        pos(offset.SHOOTER_POS),
        origin("right"),
        rotate(90),
        z(layersetting.HINTLINE_LAYER),
    ]
)



onUpdate(shooterUpdate);
onMouseDown(updateShooterRotato);

onUpdate(()=>{
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
    EnemyPool.forEach((obj)=>{
        if(obj.gameObject.hidden) return;
        obj.EnemyUpdate();
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

// let t=buttlePool.GetObject();
// t.Init(center(),vec2(1,0));

/*/test fun//

onMousePress((pos)=>{
    let r=EnemyPool.GetObject();
    r.Init(15,pos,(randi(0,2)==1)?"circle":"rect");
})




/*/// function 

function shooterUpdate(){
    if(shooter.colddown>0)shooter.colddown-=1;
    if(shooter.buttleNum>0&&shooter.colddown<=0){
        shooter.colddown=SHOOTER_COLD_DOWN;
        shooter.buttleNum--;
        let tmp=buttlePool.GetObject();
        tmp.Init(offset.SHOOTER_POS,shooter.face);
    }
}

function updateShooterRotato(activePos:Vec2){
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
    if(spawnColddown<=0){
        spawnColddown+=offset.SPAWN_COLD_DOWN;
    }else{
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