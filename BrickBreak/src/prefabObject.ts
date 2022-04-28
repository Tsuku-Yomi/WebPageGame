//by tsukuYomi

/// <reference path = "./tmath.ts" />
/// <reference path ="./pool.ts" />
/// <reference path ="./layersetting.ts"/>
import { GameObj, KaboomCtx, PosComp, Shape, Vec2 } from "kaboom";
import { layersetting } from "./layersetting";
import { offset } from "./lineoffset";
import { pool } from "./pool";
import { tmath } from "./tmath";

declare let origin:KaboomCtx['origin'];

export namespace prefab{
    export class Buttle implements pool.IPoolObject{
        public static BULLTE_SCALE=0.5;
        public static BULLTE_SPRITE_ID="hatjsgdsdcndy";
        public static BULLTE_SPEED=10;//per frame pixel
        public static BULLTE_TAIL_SHADOW_NUM=5;
        public poolId: number;
        public gameObject=add([
            "Buttle",
            sprite(Buttle.BULLTE_SPRITE_ID),
            pos(),
            area({shape:"circle"}),
            scale(Buttle.BULLTE_SCALE),
            z(layersetting.ENTITY_LAYER),
            origin("center"),
            {
                towardVec:vec2(0,0),
                attack:1
            }
        ]);
        public bullteShadowArray=Array<GameObj>(Buttle.BULLTE_TAIL_SHADOW_NUM);
        constructor(){
            for(let i=0;i<Buttle.BULLTE_TAIL_SHADOW_NUM;++i){
                this.bullteShadowArray[i]=add([
                    sprite(Buttle.BULLTE_SPRITE_ID),
                    pos(),
                    z(layersetting.ENTITY_LAYER),
                    scale(Buttle.BULLTE_SCALE),
                    opacity((Buttle.BULLTE_TAIL_SHADOW_NUM-i)/(Buttle.BULLTE_TAIL_SHADOW_NUM+1)),
                    origin("center"),
                ])
            }
            this.ResetSelf();
        }
        public ResetSelf(): void {
            this.gameObject.hidden=true;
            this.bullteShadowArray.forEach((obj:GameObj)=>{
                obj.hidden=true;
            });

        }
        public Init(pos:Vec2,face:Vec2){
            this.gameObject.hidden=false;
            this.bullteShadowArray.forEach((obj:GameObj)=>{
                obj.hidden=false;
                obj.moveTo(pos);
            });
            this.gameObject.moveTo(pos);
            this.gameObject.towardVec=tmath.Normalized(face);
        }
        public ButtleUpdate():void{
            //if in pool, return
            if(this.gameObject.hidden) return;
            //else move
            if(this.gameObject.pos.x<0)this.gameObject.towardVec.x=Math.abs(this.gameObject.towardVec.x);
            if(this.gameObject.pos.x>width()) this.gameObject.towardVec.x=-Math.abs(this.gameObject.towardVec.x);
            if(this.gameObject.pos.y<offset.SETTING_ENEMY_SHOW_LINE)this.gameObject.towardVec.y=Math.abs(this.gameObject.towardVec.y);
            if(this.gameObject.pos.y>height()) this.gameObject.towardVec.y=-Math.abs(this.gameObject.towardVec.y);

            this.gameObject.moveBy(
                this.gameObject.towardVec.x*Buttle.BULLTE_SPEED,
                this.gameObject.towardVec.y*Buttle.BULLTE_SPEED
            );
            for(let i=Buttle.BULLTE_TAIL_SHADOW_NUM-1;i>0;--i){
                this.bullteShadowArray[i].moveTo(this.bullteShadowArray[i-1].pos);
            }
            this.bullteShadowArray[0].moveTo(this.gameObject.pos);
        }
        
        public OnButtleHit(obj:GameObj<PosComp>){
            this.gameObject.towardVec=tmath.GetReflectionVector(
                this.gameObject.towardVec,
                tmath.GetNormalVector(
                    this.gameObject.pos,
                    obj.pos
                )
            );
        }
    }

    export class Enemy implements pool.IPoolObject{
        
        public static ENEMY_SPRITE_ID="floatncu";
        public static ENEMY_EFFECT_SPRITE_ID="textisalie";
        //public static ENEMY_DOWN_SPEED=1;//per piexl frame
        public poolId: number;

        public gameObject=add([
            "Enemy",
            sprite(Enemy.ENEMY_SPRITE_ID),
            pos(),
            z(layersetting.ENTITY_LAYER),
            area({shape:"circle"}),
            scale(offset.ENEMY_SCALE),
            //text("1",{size:12}),
            origin("center"),
            {
                moveClick:0,
                hp:10,
            }
        ])
        public gameObjectEffect=add(
            [
                pos(),
                scale(offset.ENEMY_SCALE),
                origin("center"),
                sprite(Enemy.ENEMY_EFFECT_SPRITE_ID),
                text("1",{
                    size:15
                }),
                z(layersetting.HUB_LAYER),
            ]
        )
        public constructor(){
            this.ResetSelf();
        }

        public ResetSelf(): void {
            this.gameObject.hidden=true;
            this.gameObjectEffect.hidden=true;
        }

        public Init(hp:number,pos:Vec2,areaType:Shape,size:number,buff?:number):void{
            if(areaType=='circle'){
                this.gameObject.play("cir");
                this.gameObject.area.shape="circle";
            }else{
                this.gameObject.play("rect");
                this.gameObject.area.shape="rect";
            }
            this.gameObject.scaleTo(size*offset.ENEMY_SCALE);
            this.gameObjectEffect.scaleTo(size*offset.ENEMY_SCALE);
            this.gameObjectEffect.hidden=false;
            this.gameObject.hidden=false;
            this.gameObjectEffect.pos=pos;
            this.gameObject.pos=pos;
            this.gameObject.hp=hp;
        }

        public EnemyUpdate():void{
            if(this.gameObject.hidden) return;
            this.gameObjectEffect.text=String(this.gameObject.hp);
            this.gameObject.moveBy(0,offset.ENEMY_DROP_SPEED*dt());
            this.gameObjectEffect.pos=this.gameObject.pos;
        }

        public OnBeHit(obj:GameObj){
            this.gameObject.hp-=obj.attack;
        }
    }    
}

