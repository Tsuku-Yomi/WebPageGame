export namespace offset{
    const SETTING_LINE_SIZE_WITH_SCREEN=0.85;
    const SETTING_LINE_NUM=7;
    const SETTING_SHOOTER_DISTANCE_FRONT=128;
    var ZERO_LINE_OFFSET=((1-SETTING_LINE_SIZE_WITH_SCREEN)/2)*width();
    var LINE_WIDTH=SETTING_LINE_SIZE_WITH_SCREEN*width()/SETTING_LINE_NUM;
    var SHOOTER_POS=vec2(center().x,width()-SETTING_SHOOTER_DISTANCE_FRONT);
    //start->zero
    export function GetSpawnPos(x:number,y:number,size:number){
        return vec2(x*LINE_WIDTH+LINE_WIDTH*size/2,y*LINE_WIDTH+LINE_WIDTH*size/2);
    }
}