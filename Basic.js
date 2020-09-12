  var Connected = window.navigator.onLine;
  let can = document.getElementById('a');
  let ctx = can.getContext('2d');
  let can1 = document.getElementById('b');
  let ctx1 = can1.getContext('2d');
  let width,height;
  let Map_object_Array = [],Blood_Text=[],Weapon=[];
  let NextDoor = [];
  let KeyIn =[];
  let MousedownA=[];
  let KeyEvent=0;
  let MouseDown=0;
  let PI = Math.PI;
  let AngleRadian=a=>PI/360*a;
  let RandInt=a=>Math.random()*a|0;
  let RandIntBetween=(a,b)=>a+RandInt(b-a+1);
  let max =(a,b)=>(a>b)?a:b;
  let min =(a,b)=>(a<b)?a:b;
  let PLAYER,End,ES=':Are you ok?',CT=0,TT='',TEN;
  let Time = new Timer();
//Life
function ProgressLine(ctx,pos,l,ml,size,line=2,color='#1db'){
  ctx.beginPath();
  ctx.save();
  ctx.lineWidth=line;
  ctx.moveTo(pos.x,pos.y-5);
  let a = (l/ml);
  ctx.strokeStyle=a>.5?color:a<.3?'#d43':'#db1';
  ctx.lineTo(pos.x+(l/ml)*size,pos.y-5);
  ctx.stroke();
  ctx.restore();
  ctx.closePath();
}
function DrawImageT(ctx,pos,TX,TY,TileSize){
  ctx.drawImage(tileImage,TX*16,TY*16,16,16,pos.x,pos.y,TileSize,TileSize);
}
///// Too many pics using array to store
function PushFrame(a,r) {
  let s=[],count=0;
  for(var i =0;i<a.length;i++){
    let b = [];
    for(var j=0;j<a[i];j++){
      b.push(count);
      count++;
    }
    s.push(b);
  }
  return s;
}
function DrawText(ctx,x,y,Text,color,s){
  ctx.save();
  ctx.fillStyle= color;
  ctx.strokeStyle = '#BEB';
  ctx.font = s+'px Arial Black';
  ctx.fillText(Text,x,y);
  ctx.strokeText(Text,x,y);
  ctx.restore();
}
class Timer{
  constructor(){this.T=0;}
  Add(T){this.T+=T;}
  Zero(){this.T=0;}
  Big(A){this.T>A;}
}
//Learn a lot from B O U N C E B A C K(2019) Author "https://github.com/KilledByAPixel/BounceBack"
//////
//////
class PositionXY{
  constructor(x,y,c=32){this.x=x;this.y=y;this.c=c;}
  SubstractV(a){this.x-=a.x;this.y-=a.y;return this;}
  Copy(){return new PositionXY(this.x,this.y,this.c);}
  Set(a){this.x=a.x;this.y=a.y;}
  AddV(v){this.x+=v.x;this.y+=v.y;}
  Direction(a){
    if(a==1)
      this.y-=this.c*4;
    if(a==2)
      this.x-=this.c*4;
    if(a==3)
      this.y+=this.c*4;
    if(a==4)
      this.x+=this.c*4;
    return this.Copy();
  }
  Multiply(s=1){let A = s/Math.hypot(this.x,this.y);this.x *=A;this.y *=A;return this;}
  Center(){return new PositionXY(this.x+this.c/2,this.y+this.c/2);}
  Distance(a){return Math.hypot(this.x - a.x, this.y - a.y);}
  Touch(a){let C = a.c;let s = this.c;return(this.x+s)>a.x&&(a.x+a.c)>this.x&&(this.y+C)>a.y&&(a.y+C)>this.y;}
  Rotate(){return (Math.abs(this.x)>Math.abs(this.y))?(this.x>0?0:1):(this.y>0?2:3);}
}
class StrokeText{
  constructor(pos,Damage){
    this.x = pos.x;
    this.y = pos.y;
    this.AT = new Timer();
    this.YY = .5;
    this.Damage = Damage;
    Blood_Text.push(this);
  }
  Update(){
    if (this.AT.Big(3)){this.Destroy();return}
    this.AT.Add(.1);
    this.YY+=.1;
  }
  Render(){
    DrawText(ctx,this.x,this.y-this.YY,this.Damage,'#d13',20);
  }
  Destroy(){
    Blood_Text.splice(Blood_Text.indexOf(this),1);
  }
}
class object{
  constructor(x,y,size=32){
    this.pos = new PositionXY(x,y,size);
    this.old = new PositionXY(x,y,size);
    Map_object_Array.push(this);
  }
  CollisionR(e){
    return this.pos.Touch(e.pos);
  }
  Destroy(){
    let a = Map_object_Array.indexOf(this);
    if(a){
    Map_object_Array.splice(a,1);
    }
  }
}
