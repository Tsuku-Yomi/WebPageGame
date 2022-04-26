//by tsukuYomi

/// <reference path = "./tmath.ts" />
/// <reference path ="./pool.ts" />
import { GameObj, KaboomCtx, Vec2 } from "kaboom";
import { pool } from "./pool";
import { tmath } from "./tmath";

declare let origin:KaboomCtx['origin'];

export namespace prefab{
    export class Buttle implements pool.IPoolObject{
        public static BULLTE_SPRITE_ID="hatjsgdsdcndy";
        public static BULLTE_SPEED=2;//per frame pixel
        public static BULLTE_TAIL_SHADOW_NUM=5;
        public poolId: number;
        public gameObject=add([
            "Buttle",
            sprite(Buttle.BULLTE_SPRITE_ID),
            pos(),
            area({shape:"circle"}),
            origin("center"),
            {
                towardVec:vec2(0,0),
            }
        ]);
        public bullteShadowArray=Array<GameObj>(Buttle.BULLTE_TAIL_SHADOW_NUM);
        constructor(){
            for(let i=0;i<Buttle.BULLTE_TAIL_SHADOW_NUM;++i){
                this.bullteShadowArray[i]=add([
                    sprite(Buttle.BULLTE_SPRITE_ID),
                    pos(),
                    opacity((Buttle.BULLTE_TAIL_SHADOW_NUM-i)/(Buttle.BULLTE_TAIL_SHADOW_NUM+1)),
                    origin("center"),
                ])
            }
            this.ResetSelf();
        }
        public Create(): pool.IPoolObject {
            return new Buttle();
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
            if(this.gameObject.pos.y<0)this.gameObject.towardVec.y=Math.abs(this.gameObject.towardVec.y);
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
        //TODO fku
        public OnButtleHit(){}
    }

    export class Enemy implements pool.IPoolObject{
        
        public static ENEMY_SPRITE_ID="floatncu";
        public static ENEMY_DOWN_SPEED=1;//per piexl frame
        public poolId: number;

        public gameObject=add([
            "Enemy",
            sprite(Enemy.ENEMY_SPRITE_ID),
            pos(),
            area({shape:"circle"}),
            text("life"),
            origin("center"),
            {
                moveClick:0,
                hp:10,
            }
        ])
        
        public constructor(){
            this.ResetSelf();
        }

        public Create(): pool.IPoolObject {
            return new Enemy();
        }

        public ResetSelf(): void {
            this.gameObject.hidden=true;
        
        }

        public Init(hp:number,pos:Vec2):void{
            this.gameObject.pos=pos;
            this.gameObject.hp=hp;
        }

        public EnemyUpdate():void{
            if(this.gameObject.hidden) return;

            if(++this.gameObject.moveClick>=Enemy.ENEMY_DOWN_SPEED){
                this.gameObject.moveClick=0;
                this.gameObject.moveBy(0,1);
            }

        }
    }    
}

