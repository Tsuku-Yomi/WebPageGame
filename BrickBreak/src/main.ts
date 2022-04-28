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


//Spirte load 
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
loadSprite(prefab.Effect.EFFECT_SPRITE_ID,"/sprite/effect.png",{
    sliceX:3,anims:{
        empty:{
            from:0,
            to:0
        },
        piece:{
            from:1,
            to:1
        },
        star:{
            from:2,
            to:2
        }

    }
})
///

offset.InitOffset();


var SHOOTER_COLD_DOWN=0.1;
var BIG_ENEMY_COLD_DOWN=10;
var MID_ENEMY_COLD_DOWN=3;
var SUM_COLD_DOWN=3;
var FROZEN_TIME=2;


let diff=1;
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
let EffectPool:pool.ObjectPool<prefab.Effect>=new pool.ObjectPool<prefab.Effect>(prefab.Effect);
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
        scale(offset.ENEMY_SCALE),
        rotate(90),
        origin("center"),
        text("",{size:28}),
        {
            buttleNum:10,
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
aimLine.hidden=true;
const scoreTable=add(
    [
        "score",
        text("0",{
            size:28
        }),
        origin("top"),
        pos(center().x,10),
        z(layersetting.MENU_LAYER)
    ]
);
scoreTable.hidden=true;
let starIcon=add([
    "star",
    sprite(prefab.Enemy.ENEMY_EFFECT_SPRITE_ID,{anim:"star"}),
    origin("topleft"),
    scale(0.5),
    pos(20,10),
    z(layersetting.MENU_LAYER),
])
starIcon.hidden=true;
let starTable=add([
    "star",
    text("0",{size:28}),
    origin("topleft"),
    pos(20,60),
    z(layersetting.MENU_LAYER)
]);
starTable.hidden=true;
let menuBg=add([
    "gamemenu",
    color(0,0,0),
    sprite(prefab.Effect.EFFECT_SPRITE_ID,{anim:"piece"}),
    scale(10),
    origin("bot"),
    pos(center().x,offset.ENEMY_SHOW_LINE),
    z(layersetting.MENU_BACKGROUND_LAYER)
]);
menuBg.hidden=true;

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
            GetBuff(obj.gameObject.pos,obj.gameObject.buff);
            EnemyPool.DestroyObject(obj);
        }
        if(obj.gameObject.pos.y>offset.SHOOTER_POS.y+20){
            //Fall
            EnemyPool.DestroyObject(obj);
        }
    })    
})

onUpdate(SpawnEnemy);

onCollide("Buttle","Enemy",(objA,objB)=>{
    if(objA.hidden||objB.hidden) return;
    score++;
    scoreTable.text=String(score);
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



//test fun//
// let t=buttlePool.GetObject();
// t.Init(center(),vec2(1,0));
// onMousePress((pos)=>{
//     let r=EnemyPool.GetObject();
//     r.Init(15,pos,(randi(0,2)==1)?"circle":"rect");
// })
GameStateController(0);
//// function 

function shooterUpdate(){
    if(gameState!=1) return;
    if(shooter.colddown>0)shooter.colddown-=dt();
    if(shooter.buttleNum>0&&shooter.colddown<=0){
        shooter.colddown=SHOOTER_COLD_DOWN;
        shooter.buttleNum--;
        shooter.text=String(shooter.buttleNum);
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
    //debug.log(String(deg));
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
                EnemyPool.GetObject().Init(diff*9,offset.GetSpawnPos(tmp,3),chance(0.5)?"circle":"rect",3);
                spawnArr[tmp]=spawnArr[tmp+1]=spawnArr[tmp+2]=3;
                sumCooldown=SUM_COLD_DOWN;
                bigCooldown=BIG_ENEMY_COLD_DOWN;
            }
        }
        if(midCooldown<=0&&sumCooldown<=0){
            if(chance(0.5)){
                let tmp=randi(0,offset.SETTING_LINE_NUM-1);
                EnemyPool.GetObject().Init(diff*4,offset.GetSpawnPos(tmp,2),chance(0.5)?"circle":"rect",2) ;
                spawnArr[tmp]=spawnArr[tmp+1]=2;
                sumCooldown=SUM_COLD_DOWN;
                midCooldown=MID_ENEMY_COLD_DOWN;
            }
        }
    }
    for(let i=0;i<offset.SETTING_LINE_NUM;++i){
        if(spawnArr[i]<=0&&chance(0.8)){
            let buff=0;
            if(chance(0.05)) buff=1;
            if(chance(0.05)) buff=2;
            if(chance(0.03)) buff=3;
            if(chance(0.15)) buff=4;
            EnemyPool.GetObject().Init(diff,offset.GetSpawnPos(i,1),chance(0.5)?"circle":"rect",1,buff) ;
        }else{
            spawnArr[i]--;
        }
            
    }
    diff++;
    sumCooldown--;
    bigCooldown--;
    midCooldown--;
    
}
//TODO


function GameStateController(state:number){
    const BUTTON_TEXT_SIZE=28;
    gameState=state;
    switch(state){
        case 0:
            destroyAll("gameovermenu");
            add([
                "startmenu",
                text("start",{size:BUTTON_TEXT_SIZE}),
                pos(center().x,center().y-100),
                origin("center"),
                area({shape:"rect"})
            ]).onUpdate(()=>{
                if(inputLock||isMouseDown()){
                    debug.log('bg1');
                    GameStateController(1);
                }
            });
            score=0;
            starCount=0;
            //shooter.attack=1;
            //shooter.buttleNum=5;
        //FINISH 尝试销毁结算界面
        //FINISH 生成主页按钮
            break;
        case 1:
        destroyAll("startmenu");
        //FINISH 尝试销毁主页按钮
        shooter.hidden=false;
        aimLine.hidden=false;
        scoreTable.hidden=false;
        starIcon.hidden=false;
        starTable.hidden=false;
        menuBg.hidden=false;
        //FINISH 显示HUB，GUI，shooter
            break;
        case 2:
        shooter.hidden=true;
        aimLine.hidden=true;
        scoreTable.hidden=true;
        starIcon.hidden=true;
        starTable.hidden=true;
        menuBg.hidden=true;
        buttlePool.Init();
        EnemyPool.Init();
        if(starCount>=101){
            let tmp=add([
                "gameovermenu",
                text("YOU WIN!! YOUR SCORE:"+String(score),{size:72}),
                origin("center"),
                pos(center()),
            ])
            wait(1,()=>{
                tmp.onUpdate(()=>{if(inputLock||isMouseDown()){
                        GameStateController(0);
                    }}
                    
                )
            });
        }else{
            let tmp=add([
                "gameovermenu",
                text("YOU LOSE,touch to try again,YOUR SCORE:"+String(score),{size:72}),
                origin("center"),
                pos(center()),
            ])
            wait(1,()=>{
                tmp.onUpdate(()=>{if(inputLock||isMouseDown()){
                        GameStateController(0);
                    }}
                )
            });
        }
            break;
        case 3:
            break;
    }
}

//TODO 特效

function GetBuff(pos:Vec2,type:number){
    switch(type){
        case 1:
            shooter.attack++;
            break;
        case 2:
            shooter.buttleNum++;
            break;
        case 3:
            isFrozen=true;
            wait(FROZEN_TIME,()=>{
                isFrozen=false;
            })
            break;
        case 4:
            starCount++;
            starTable.text=String(starCount);
            let tmp=EffectPool.GetObject();
            tmp.Init(pos,"star",offset.ENEMY_SCALE,vec2(30,20),1600);
            wait(0.5,()=>{
                EffectPool.DestroyObject(tmp);
            })
            break;
    }
}
