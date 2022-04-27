//By tsukuYomi
/// <reference path = "./tmath.ts" />
/// <reference path ="./pool.ts" />
/// <reference path ="./prefabObject.ts" />
/// <reference path ="lineoffset.ts" />

import kaboom, { KaboomCtx, Vec2 } from "kaboom";
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
offset.InitOffset();


var SHOOTER_COLD_DOWN=10;
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
        }
    ]
);

const aimLine=add(
    [
        sprite(AIMLINE_SPRITE_ID),
        pos(offset.SHOOTER_POS),
        origin("right"),
        rotate(90),
        z(-1),
    ]
)



onUpdate(shooterUpdate);
onMouseDown(updateShooterRotato);

onUpdate(()=>{
    buttlePool.forEach((obj)=>{
        if(obj.gameObject.hidden) return;
        obj.ButtleUpdate();
        if(obj.gameObject.pos.y>=height()-1){
            shooter.buttleNum++;
            buttlePool.DestroyObject(obj);
        }
    })
})

onUpdate(()=>{
    EnemyPool.forEach((obj)=>{
        if(obj.gameObject.hidden) return;
        //obj.EnemyUpdate();
        if(obj.gameObject.hp<=0){
            EnemyPool.DestroyObject(obj);
        }
    })    
})

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

//test fun//

onMousePress((pos)=>{
    let r=EnemyPool.GetObject();
    r.Init(15,pos,(randi(0,2)==1)?"circle":"rect");
})




// function 

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
