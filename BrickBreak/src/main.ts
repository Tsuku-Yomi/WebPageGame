//By tsukuYomi
/// <reference path = "./tmath.ts" />
/// <reference path ="./pool.ts" />
/// <reference path ="./prefabObject.ts" />


import kaboom from "kaboom";
import { pool } from "./pool";
import { prefab } from "./prefabObject";
import { tmath } from "./tmath";

kaboom();

loadSprite(prefab.Buttle.BULLTE_SPRITE_ID,"/sprite/buttle.png");
loadSprite(prefab.Enemy.ENEMY_SPRITE_ID,"/sprite/enemy.png");

let buttlePool:pool.ObjectPool<prefab.Buttle>=new pool.ObjectPool<prefab.Buttle>(prefab.Buttle);
let EnemyPool:pool.ObjectPool<prefab.Enemy>=new pool.ObjectPool<prefab.Enemy>(prefab.Enemy);

onUpdate(()=>{
    buttlePool.forEach((obj)=>{
        if(obj.gameObject.hidden) return;
        obj.ButtleUpdate();
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
    objA.towardVec=tmath.GetReflectionVector(
        objA.towardVec,
        tmath.GetNormalVector(
            objA.pos,
            objB.pos
        )
    )
    objB.hp-=objA.attack;
})

let t=buttlePool.GetObject();
t.Init(center(),vec2(1,0));

//test fun//

onMousePress((pos)=>{
    let r=EnemyPool.GetObject();
    r.Init(1,pos);
})


