//By tsukuYomi
/// <reference path = "./tmath.ts" />
/// <reference path ="./pool.ts" />
/// <reference path ="./prefabObject.ts" />


import kaboom from "kaboom";
import { pool } from "./pool";
import { prefab } from "./prefabObject";

kaboom();

loadSprite(prefab.Buttle.BULLTE_SPRITE_ID,"/sprite/buttle.png");

let buttlePool:pool.ObjectPool<prefab.Buttle>=new pool.ObjectPool<prefab.Buttle>(prefab.Buttle);

let t=buttlePool.GetObject();
t.Init(center(),vec2(-4,-3));

onUpdate(()=>{
    buttlePool.forEach((obj)=>{
        obj.ButtleUpdate();
    })
})