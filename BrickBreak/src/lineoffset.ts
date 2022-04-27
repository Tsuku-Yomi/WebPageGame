export namespace offset{
    export const SETTING_LINE_SIZE_WITH_SCREEN=0.85;
    export const SETTING_LINE_NUM=7;
    export const SETTING_SHOOTER_DISTANCE_FRONT=128;
    export var ZERO_LINE_OFFSET;
    export var LINE_WIDTH;
    export var SHOOTER_POS;
    export var BALL_RECYCLE_LINE;
    //start->zero
    export function GetSpawnPos(x:number,y:number,size:number){
        return vec2(
            ZERO_LINE_OFFSET+x*LINE_WIDTH+LINE_WIDTH*size/2,
            y*LINE_WIDTH+LINE_WIDTH*size/2
        );
    }
    export function InitOffset(){
        ZERO_LINE_OFFSET=((1-SETTING_LINE_SIZE_WITH_SCREEN)/2)*width();
        LINE_WIDTH=SETTING_LINE_SIZE_WITH_SCREEN*width()/SETTING_LINE_NUM;
        SHOOTER_POS=vec2(center().x,height()-SETTING_SHOOTER_DISTANCE_FRONT);
        BALL_RECYCLE_LINE=height()-SETTING_SHOOTER_DISTANCE_FRONT+1;
    }
}