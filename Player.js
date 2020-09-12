let Main_Re;
class PlayerData{
  constructor(){
    //red blue yellow
    this.hold = [1,1,1,0];
    this.Life = 250;
    this.Power= 250;
    this.speed = 2;
    this.C = 32;
    this.Attack=25;
  }
  call(){
    if(localStorage.Life)this.Life=parseInt(localStorage.Life, 10);
    if(localStorage.Power)this.Power=parseInt(localStorage.Power, 10);
    if(localStorage.speed)this.speed=parseInt(localStorage.speed, 10);
    if(localStorage.array){
      let a = localStorage.array.split(',');
      this.hold =a.map(e=>+e.replace('[','').replace(']',''));
    }
    return this;
  }
}
class Player extends Man{
  constructor(x,y){
    let D = new PlayerData().call();
    super(x,y,0,0,6,D.C,D.Life,D.Attack,D.speed);
    this.hold = D.hold;
    this.Movement = new PositionXY(0,0);
    this.Power = D.Power;
    this.AE = PushFrame([3,4,3,4],14); 
    this.InputTime = new Timer();
    this.ItemTime=new Timer();
    this.ATT = 0;
    this.MaxLife = 250;
  }
  StoreItem(){
    localStorage.Life=this.Life;
    localStorage.Power=this.Power;
    localStorage.speed=this.speed;
    localStorage.array=JSON.stringify(this.hold);
  }
  UseItem(a){
    if(this.hold[a]==0)return;
    let heal = 50;
    this.hold[a]--;
    if(a==0)this.Life=min(this.Life+heal,this.MaxLife);
    if(a==1)this.Power=min(this.Power+heal,this.MaxLife);
    if(a==2)this.speed=min(this.speed+.5,3);
    SoundList(6);
    this.StoreItem();
  }
  Pick(a){
    this.hold[a]++;
    this.StoreItem();
    SoundList(3);
  }
  PushFire(pos){
    if(this.Power<20){SoundList(9);return;}
    this.R = pos.Rotate();
    pos.AddV(this.pos);
    for (var i=0;i<4;i++)
      new Fireball(this.pos,pos.Direction(i),6,20,RandTwo(20,this.Attack*2),1);
    this.Power-=20;
    SoundList(7);
  }
  Sword(){
    new Sword(this.pos.Copy(),this.pos.Copy(),6,this.R,RandTwo(20,30));
  }
  Update(){
    if(this.Die()){SoundList(2);return;}
    let MXY = new PositionXY(0,0);
    NextDoor.forEach(e=>{
      if(this.CollisionR(e)&&this.hold[3]!=0){
        this.UseItem(3);
        e.GoNext();
      }
    })
    super.Update();
    // 0 left 1 right
    if(MouseDown){
      if(this.AttackT.Big(5)&&MousedownA[1]){
        this.Sword();
        this.AttackT.Zero();
        SoundList(2);
      }
      if(this.Power_time.Big(7)&&MousedownA[3]!=null){
        this.PushFire(MousedownA[3]);
        this.Power_time.Zero();
        //UI time
        
      }
    }
    this.Power_time.Add(.1);
    this.AttackT.Add(.1);
    this.old.Set(this.pos);
    if(this.ItemTime.Big(1)){
    if(KeyIn[49])this.UseItem(0);
    if(KeyIn[50])this.UseItem(1);
    if(KeyIn[51])this.UseItem(2);
    this.ItemTime.Zero();
    }
    // UI Time 
    this.ItemTime.Add(.1);
    if(KeyIn[87]){
      this.R=1;
      MXY.y-=this.speed;
    }//top
    if(KeyIn[83]){
      this.R=3;
      MXY.y+=this.speed;
    }//down
    if(KeyIn[65]){
      this.R=2;
      MXY.x-=this.speed;
    }//left
    if(KeyIn[68]){
      this.R=0;
      MXY.x+=this.speed;
    }//right
    this.pos.AddV(MXY);
    if(KeyEvent){
      this.WalkFrame+=0.1;
    }
  }
  Render(){
    let Frame = this.WalkFrame%2|0;
    let l = this.AE[this.R].length;
    let d = this.AE[this.R];
    Frame += this.R==1||this.R==3?1:0;
      if(!KeyEvent){
        this.InputTime.Add(.05);
        this.WalkFrame=0;
      }else{
        this.InputTime.Zero();
      }
      if(this.InputTime.Big(1)){
        this.tx = d[0];
      }else{
        this.tx = d[Frame];
      }
      if(MouseDown){
        this.tx = d[l-1];
      }
    super.Render();
    this.DrawSword();
  }
  DrawSword(){
    ctx.save();
    let RADIUS = this.WalkFrame%2>1?45:40;
    let a = this.pos.Copy().Center();
    a.y+=this.C/8+8;
    if(!MouseDown){
    if (this.R!=0&&this.R!=3){
      a.x-=this.C/8;
      ctx.translate(a.x,a.y);
    }else{
      a.x+=this.C/8;
      ctx.translate(a.x+4,a.y);
      ctx.scale(-1,1);
    }
    }
    ctx.rotate(PI/45*RADIUS);
    DrawImageT(ctx,new PositionXY(0,0),0,3,this.C/2.5);
    ctx.restore();
  }
}
function Reset() {
  localStorage.Life=250;
  localStorage.Power=250;
  localStorage.speed=2;
  localStorage.hold=[1,1,1,0];
}
function EndAnimate(){
  var a = ['Tyrapitara','Chef meat is here.','Hmm..','Oh!Myhero!','hey,my stud muffin'];
  DrawText(ctx1,0,height/3,ES,'#19f',30);
  if(Time.Big(1)){
    cancelAnimationFrame(Main_Re);
    if(CT<a[End].length)
      TT+=a[End][CT];
    else{
      ctx1.fillRect(0,0,width,height);
      DrawText(ctx1,width/4,height/2,"End",'#000',200);
    }
    Time.Zero();
    CT++;
    DrawText(ctx1,0,height/3+99,":"+TT,'#f19',30);
  }
  Time.Add(.1);
  requestAnimationFrame(EndAnimate);
}
function NextFloor(F,I=0){
  Map_object_Array=[];
  NextDoor=[];
  Blood_Text=[];
  Level(F);
  PLAYER = new Player(625,1150);
  SoundList(8);
  if(F==7){
    let x=I>3?11:8,y=x==11?1:2;
    new Man(625,990,x,y,5,32,99);
    End = I;
    if(End==0)new Boss(500,990,32,1);
    EndAnimate();
  }
}
function PreDecode(){
  cancelAnimationFrame(Main_Re);
  NextFloor(0);
  main();
}
function PreUpdate(){
  Map_object_Array.forEach(e=>{
      e.Update();
      e.Render();
  });
  Blood_Text.forEach(e=>{
    e.Update();
    e.Render();
  })
  Weapon.forEach(e=>{
    e.Update();
    e.Render();
  })
}
function Center(pos){
    if(pos==null)return;
    let drawPos = new PositionXY(width/4,height/4);
    drawPos.SubstractV(pos);
    ctx.scale(2,2);
    ctx.translate(drawPos.x|0, drawPos.y|0);
}
function main(){
  width = can.width;
  height = can.height;
  Center(PLAYER.pos);
  PreUpdate();
  UI();
  Main_Re = requestAnimationFrame(main);
  if(PLAYER.Die()){
    DrawText(ctx1,width/6,height/2,"You Lose!",'#A30',200);
    DrawText(ctx1,width/3,height/2+100,"R To Restart!","#A30",100);
    Reset();
    if(KeyIn[82]){
      PreDecode();
    }
  }
}
function UI(){
  let a = 10;
  let tx =[0,1,2,11,12,13,7]; 
  ctx1.fillStyle='rgba(40,40,0,.7)';
  ctx1.fillRect(a,a,200,200);
  ProgressLine(ctx1,{x:a*2,y:a*18},PLAYER.Life,PLAYER.MaxLife,180,10);
  ProgressLine(ctx1,{x:a*2,y:a*20},PLAYER.Power,PLAYER.MaxLife,180,10,'#bcd');
  DrawText(ctx1,a*2,a*22,"Speed:"+PLAYER.speed,'#d43',30);
  DrawImageT(ctx1,{x:a*3,y:a},PLAYER.tx,0,150);
  ctx1.fillRect(width/4,height-a*10,width/4*2,a*9);
  for(var i=0;i<7;i++){
    let newPos = new PositionXY(width/4+i*116,(height-a*8));
    if(i>2){
      DrawText(ctx1,newPos.x,newPos.y,"X"+PLAYER.hold[i-3],'#d43',20);
    }else{
      if(i==0){
        let t = PLAYER.AttackT.curTime>5?5:PLAYER.AttackT.curTime;
        ProgressLine(ctx1,newPos,t,5,60,10);
      }
      if(i==1){
        let b = PLAYER.Power_time.curTime>5?5:PLAYER.Power_time.curTime;
        ProgressLine(ctx1,newPos,b,5,60,10);
      }
    }
    DrawImageT(ctx1,newPos,tx[i],3,60);
  }
}
Map_de();
