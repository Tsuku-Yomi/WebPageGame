export namespace offset{
    export const SETTING_LINE_SIZE_WITH_SCREEN=1;
    export const SETTING_LINE_NUM=7;
    export const SETTING_SHOOTER_DISTANCE_FRONT=128;
    export const SETTING_ENEMY_SCALE_BLOCK=0.9;
    export const SETTING_SPRITE_WIDTH=64;        
    export const SETTING_ENEMY_SHOW_LINE=100;
    export const SETTING_TIME_BLOCK_DROP=7;

    export var SPAWN_COLD_DOWN;
    export var ZERO_LINE_OFFSET;
    export var LINE_WIDTH;
    export var SHOOTER_POS;
    export var BALL_RECYCLE_LINE;
    export var ENEMY_SCALE;
    export var ENEMY_DROP_SPEED;
    
    //start->zero
    // TODO fix pos
    export function GetSpawnPos(x:number,size:number){
        return vec2(
            ZERO_LINE_OFFSET+x*LINE_WIDTH+LINE_WIDTH*size/2,
            -LINE_WIDTH*size/2
        );
    }
    export function InitOffset(){
        ZERO_LINE_OFFSET=((1-SETTING_LINE_SIZE_WITH_SCREEN)/2)*width();
        LINE_WIDTH=SETTING_LINE_SIZE_WITH_SCREEN*width()/SETTING_LINE_NUM;
        SHOOTER_POS=vec2(center().x,height()-SETTING_SHOOTER_DISTANCE_FRONT);
        BALL_RECYCLE_LINE=height()-1;
        ENEMY_SCALE=SETTING_ENEMY_SCALE_BLOCK*LINE_WIDTH/SETTING_SPRITE_WIDTH;
        ENEMY_DROP_SPEED=(width()-SETTING_ENEMY_SHOW_LINE-SETTING_SHOOTER_DISTANCE_FRONT)/SETTING_TIME_BLOCK_DROP;
        SPAWN_COLD_DOWN=LINE_WIDTH/ENEMY_DROP_SPEED;
        debug.log(String(ENEMY_SCALE));
    }
}