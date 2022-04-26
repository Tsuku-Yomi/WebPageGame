//By tsukuYomi
/// <reference path = "./tmath.ts" />
/// <reference path ="./pool.ts" />
/// <reference path ="./prefabObject.ts" />


import kaboom from "kaboom";
import { pool } from "./pool";
import { prefab } from "./prefabObject";

kaboom();

loadSprite(prefab.Buttle.BULLTE_SPRITE_ID,"/sprite/buttle.png");
loadSprite(prefab.Enemy.ENEMY_SPRITE_ID,"/sprite/enemy.png");

let buttlePool:pool.ObjectPool<prefab.Buttle>=new pool.ObjectPool<prefab.Buttle>(prefab.Buttle);
let EnemyPool:pool.ObjectPool<prefab.Enemy>=new pool.ObjectPool<prefab.Enemy>(prefab.Enemy);

onUpdate(()=>{
    buttlePool.forEach((obj)=>{
        obj.ButtleUpdate();
    })
})

onUpdate(()=>{
    EnemyPool.forEach((obj)=>{
        obj.EnemyUpdate;
        if(obj.gameObject.hp<=0){
            EnemyPool.DestroyObject(obj);
        }
    })    
})

let t=buttlePool.GetObject();
t.Init(center(),vec2(-4,-3));

//test fun//

onMousePress((pos)=>{
    let r=EnemyPool.GetObject();
    r.Init(1,pos);
})

