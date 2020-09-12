class Man extends MAP_OBJECT{
  constructor(x,y,tx,ty,Ally,c,Life,attack=0,speed=1){
    super(x,y,tx,ty,Ally,c,Life);
    this.AttackT = new Timer();
    this.Power_time = new Timer();
    this.Attack = attack;
    this.speed = speed;
    this.R = 1;
    this.WalkFrame = 0;
    this.Damage_time = new Timer();
    this.Damage_time.Add(2);
    this.FlashFrame = 0;
    this.Touch=0;
    this.Treasure = RandInt(c/4);
  }
  moving(){
    let VX = new PositionXY(0,0);
    if(this.R==0){
      VX.x+=this.speed;
    }
    if(this.R==1){
      VX.y-=this.speed;
    }
    if(this.R==2){
      VX.x-=this.speed;
    }
    if(this.R==3){
      VX.y+=this.speed;
    }
    return VX;
  }
  Reflect(R,D,on=0){
    on==1?this.R = R>1?R-2:R+2:0;
    this.pos.AddV(this.moving());
    new StrokeText(this.pos.Center(),D);
  }
  Update(){
    Map_object_Array.forEach(e=>{
      if (e.pos==null)return;
      let Friend = e.Ally;
      let this_ = this.Ally;
      let Tou = (this!=e)?this.CollisionR(e):0;
      let Sm = this_>=5;
      // 5 : wall 6:main sword fire  7 enemy  8 Fire?
      // else object bottle barrawl
      // 0-4 no touch   
      if(Friend==5&&Tou){this.pos.Set(this.old);this.Touch=1;}
      if(Tou&&Friend>=6&&this.Damage_time.Big(1)&&Friend<8){
        this.pos.Set(this.old);
        this.Touch=1;
        if(!this.FlashFrame&&Friend!=this_){
          this.FlashFrame=1;
          this.Damage_time.Zero();
          this.Reflect(e.R,e.Attack,this_==5?1:0);
          this.Damage(e.Attack);
        }
      }    
      if(this.Ally==6&&Friend<4&&Tou){
          this.Pick(Friend);
          e.Destroy();
        }
    });
  }
  Render(){
    ctx.save();
    if(this.FlashFrame&&this.Ally<8){
      ctx.rect(this.pos.x,this.pos.y,this.C,this.C);
      ctx.globalCompositeOperation = "destination-out";
      ctx.clip();
      this.Damage_time.Add(.04);
      if(this.Damage_time.Big(1)){
          this.FlashFrame=0;
      }
    }
    super.Render();
    ctx.restore();
    ProgressLine(ctx,this.pos,this.Life,this.MaxLife,this.C);
  }
}
class Fireball{
    constructor(pos,Epos,Ally,c,AttackD=1,type=1){
      this.pos = new PositionXY(pos.x,pos.y,c).Center();
      this.c =c;
      this.type = type;
      this.Ally = Ally;
      this.Epos = Epos.Copy();
      this.Epos.SubstractV(this.pos);
      this.Frame = 50;
      this.VX = this.Epos.Multiply(3);
      this.Attack = AttackD;
      Weapon.push(this);
    }
    CollisionC(e){
      return this.pos.Distance(e);
    }
    Update(){
      this.pos.AddV(this.VX);
      if(!this.Frame){this.Destroy();}
      if(this.Frame)
      Map_object_Array.forEach(e=>{
        let T = (this!=e&&e.pos!=null)?this.CollisionC(e.pos):1e9;
        if(e.Ally==5&&T<this.c)this.Destroy();
        if(e.Ally>=8&&T<this.c){e.Life--;e.Damage(0);}
        if(T<this.c+e.collisionSize/2&&e.Ally>5&&e.Ally<8&&e.Ally!=this.Ally&&e.Damage_time.Big(1)){
          e.FlashFrame=1;
          e.Damage_time.Zero();
          e.Reflect(e.R,this.Attack,e.Ally==6?1:0);
          e.Damage(this.Attack);
          e.FlashFrame=1;
          if (this.type==0){
            e.speed=max((e.speed*10-2)/10,0);
            new EffectText(e.pos,'Slow..',1);
          }
          this.Destroy();
        }
      });
      this.Frame--;
    }
    Render(){
      let tx = this.type==1?1:2;
      DrawImageT(ctx,this.pos,tx,3,this.c);
    }
    Destroy(){
      Weapon.splice(Weapon.indexOf(this),1);
    }
}
class Boss extends Man{
  //constructor(x,y,tx,ty,Ally,c,Life,attack=0,speed=1)
  constructor(x,y,c,Life,scale=2){
    super(x,y,3,2,7,(c*1.2),Life,50,.5/scale);
      this.c = c;
      this.AttackTime = new Timer();
      this.FireTime = new Timer();
      this.AE=[3,5];
      // Fire 1 Follow 2 0 lucky
      this.AttackModel = 0;
  }
  Update(){
    let a = PLAYER.pos.Copy();
    let newPos = this.pos.Copy();
    let Closer = newPos.Distance(a);
    let Ol = newPos.Copy();
    this.R = newPos.SubstractV(a).Rotate();
    let VX = a.Copy().SubstractV(Ol).Multiply(3);
    super.Update();
    if(this.Touch){
        this.Touch=0;
    }
    else{
        this.old.Set(this.pos);
    }
    if(this.AttackTime.Big(1)){
        if(this.AttackModel==1){
             for(var i =0;i<4;i++){
               new Fireball(this.pos.Copy(),a.Direction(RandTwo(0,4)),this.Ally,20,RandTwo(20,this.Attack),RandInt(2));
            }
            SoundList(4);
            this.FireTime.Add(1);
        }
        if(this.AttackModel==2){
          this.pos.AddV(VX);
          this.FireTime.Add(.1);
        }
        if(this.AttackModel==0){this.FireTime.Add(.5);}
        if(this.FireTime.Big(3)){
          this.AttackModel=RandTwo(0,2);
          this.AttackTime.Zero();
        }
    }else{
        this.pos.AddV(this.moving());
        this.FireTime.Zero();
    }
    this.AttackTime.Add(.01);
  }
  Render(){
    ctx.save();
    if(this.FlashFrame&&this.Ally<8){
      ctx.rect(this.pos.x,this.pos.y,this.c,this.c);
      ctx.globalCompositeOperation = "destination-out";
      ctx.clip();
      this.Damage_time.Add(.04);
      if(this.Damage_time.Big(1)){
          this.FlashFrame=0;
      }
    }
    let tx = this.AE[this.AttackTime.Big(.3)?0:1];
    ctx.drawImage(tileImage,tx*16,2*16,32,32,this.pos.x,this.pos.y,this.c,this.c);
    ctx.restore();
    ProgressLine(ctx,this.pos,this.Life,this.MaxLife,this.C);
  }
}
class Dragon extends Man{
  //constructor(x,y,tx,ty,Ally,c,Life,attack=0,speed=1)
  constructor(x,y,c,Life){
    //super(x,y,tx,ty,Ally,c,Life);
    super(x,y,8,1,7,c,Life,25);
    this.WalkFrame=100;
  }
  Update(){
    // shot 
    if(this.pos.Distance(PLAYER.pos)>400)return;
    super.Update();
    this.AttackT.Add(.01); 
    if (this.AttackT.Big(2)){
      this.tx = 10;
      this.WalkFrame--;
      //Attack
      let a = PLAYER.pos.Copy();
      let newPos = this.pos.Copy();
      newPos.SubstractV(PLAYER.pos);
      let R = newPos.Rotate()%2==0?0:1;
      if(this.WalkFrame%30==0){
        for(var i =R;i<R+3;i++){
          new Fireball(this.pos.Copy(),a.Direction(i),this.Ally,20,RandTwo(15,this.Attack),1);
        }
        SoundList(4);
      }
    }else if(this.AttackT.Big(.4)){
      this.tx = 9;
    }
    if(!this.WalkFrame){
      this.tx = 8;  
      this.AttackT.Zero();
      this.WalkFrame=100;
    }
  }
  Render(){
    super.Render();
    this.tx ==9? DrawImageT(ctx,this.pos.Center(),2,3,this.AttackT.curTime*5):0;
  }
}
//No attack Justing moving
class Tyrannosaur extends Man{
  constructor(x,y,c,Life){
    super(x,y,0,2,7,c,Life,35);
    this.WalkFrame = 150;
    this.R = 3;
    this.AE=[0,1,2,7];
  }
  AutoSearch(){
    this.speed = .4;
    if(this.WalkFrame<-150){
      this.R = RandTwo(0,3);
      this.WalkFrame=150;
    }
    this.WalkFrame--;
    this.pos.AddV(this.moving());
  }
  Update(){
    // bite
    let Closer = this.pos.Distance(PLAYER.pos);
    if (Closer>400)return;
    super.Update();
    if(this.Touch){
      this.Touch=0;
    }
    else{
      this.old.Set(this.pos);
    }
    if(Closer>200)this.AutoSearch();
    else{
      let newPos = this.pos.Copy();
      newPos.SubstractV(PLAYER.pos);
      if(this.WalkFrame<0){
        this.AutoSearch();  
      }else{
        if(this.WalkFrame%60==5)this.R = newPos.Rotate();
        this.speed = 1;
        this.pos.AddV(this.moving());
        this.WalkFrame--;
      }
    }
    this.tx = this.AE[this.R];
  }
}
//x,y,tx,ty,Ally,c,Life,attack=0,speed=1
class Wizard extends Man{
  constructor(x,y,c,Life){
    super(x,y,0,1,7,c,Life,20,15);
      this.WalkFrame = 50;
      this.R = 1;
      this.speed=1;
      this.AttackTime = new Timer();
      this.AE=PushFrame([2,2,2,2],8);
  }
  AttackFire(C){
    if(this.AttackTime.Big(1)&&C<200){
      //
      //attack
      //pos,Epos,Ally,c,AttackD=1,count=1
      new Fireball(this.pos.Copy(),PLAYER.pos.Copy(),this.Ally,20,RandTwo(10,this.Attack),0);
      this.R = this.pos.Copy().SubstractV(PLAYER.pos).Rotate();
      this.AttackTime.Zero();
      SoundList(5);
    }
    this.AttackTime.Add(.01);
  }
  Update(){
    // bite
    let Closer = this.pos.Distance(PLAYER.pos);
    let Frame = this.WalkFrame%60;
    if (Closer>300)return;
    super.Update();
    if(this.Touch){
      this.Touch=0;
    }else{
      this.old.Set(this.pos);
    }
    if(this.WalkFrame<-10&&Closer>200){
      this.R = RandTwo(0,3);
      this.WalkFrame=50;
    }
    else{
      let newPos = this.pos.Copy();
      newPos.SubstractV(PLAYER.pos.Copy());
      if(this.WalkFrame<0){
          this.AttackFire(Closer);
          Frame=RandTwo(10,50);
      }else{
        if(Frame==5)this.R = newPos.Rotate();
        this.pos.AddV(this.moving());
      } 
    }
    this.WalkFrame--;
    let d = this.AE[this.R];
    this.tx = d[Frame>30?0:1];
  }
}
