/////Fix Map>>using code W L F to record. 
let CheckMap = ["13W", "13L", "13A", "1A11F", "2A11F", "11F2A", "12F1A", "1A",'12F'];
let DirectionMap = ['0344444444471',"34444444444471", "0666666666682", "07666666666682", "03444444444447", "34444444444447", "07666666666668", "76666666666681", "6666666666661", "0666666666666",'169D','169F','13W144F13A','13W156F','156F13A'];
let FloorArea =['A4AA5AA1A','3D2A5AA1A','3D2A5A3E2','6C91A5A38','62A5A47C8','62A7D4A78','49A5B97C8','AAAAAAA0A'];
let KeyPos =[{x:608,y:300},{x:30,y:100},{x:30,y:100},{x:30,y:100},{x:500,y:100},{x:608,y:600},{x:30,y:100},{x:0,y:0}];
let Door_=[[{x:608,y:0,F:1,I:0},{x:608,y:0,F:1,I:0}],[{x:608,y:0,F:2,I:0},{x:0,y:192,F:3,I:1}],[{x:1024,y:0,F:3,I:0},{x:192,y:832,F:0,I:0}],[{x:192,y:800,F:4,I:0},{x:608,y:384,F:7,I:3}],[{x:1024,y:416,F:5,I:0},{x:608,y:384,F:7,I:1}],[{x:608,y:384,F:7,I:2},{x:1024,y:416,F:6,I:0}],[{x:608,y:0,F:7,I:0},{x:78,y:0,F:7,I:4}]];
let Level=A=>{
  let e = FloorArea[A];
  let X=0,Y=0;
  for(var i =0;i<e.length;i++){
    let Index = e[i];
    if(X==3){
      X=0;
      Y++;
    }
    if(Index=='A')Index=10;
    if(Index=='B')Index=11;
    if(Index=='C')Index=12;
    if(Index=='D')Index=13;
    if(Index=='E')Index=14;
    MAP_create(DirectionMap[Index],X*416,Y*416,13,13,32,A+1);
    X++;
  }
  if(A<7){
  for(var i=0;i<2;i++)
    new door(Door_[A][i].x,Door_[A][i].y,Door_[A][i].F,Door_[A][i].I);
  }
  let sort = (a,b)=> a.Ally-b.Ally;
  Map_object_Array.sort(sort);
  new MAP_FIX(KeyPos[A].x,KeyPos[A].y,7,3,3,40);
}
/////
////  Map generator 
////The concept is from LZW zip algorithm.
////But there is a difference in that its line(width and height) are fixed W, H

function MAP_create(floor,startX,startY,MAPWIDTH,MAPHEIGHT,TileSize,A){
  let tempsum =0;
  let new_record = [];
  let EnemyCount = A<3?A:A<8?3:0;
  for(var i =0;i<floor.length;i++){
    if(isNaN(floor[i])){
      new_record.push({x:tempsum,y:floor[i]});
      tempsum = 0;
    }else{
      tempsum=tempsum*10+parseInt(floor[i]);
    }
  }
  let X=startX;
  for(var i =0;i<new_record.length;i++){
    for(var j =0;j<new_record[i].x;j++,X+=TileSize){
      if(X>=MAPHEIGHT*TileSize+startX){
        startY+=TileSize;
        X = startX;
      }
      if (new_record[i].y=='W') {
        new MAP_OBJECT(X,startY,9,2,5,32);
      }else if(new_record[i].y=='A'){
        new MAP_OBJECT(X,startY,10,2,5,32);
      }else if(new_record[i].y=='D'){
      }else if(new_record[i].y=='L')
        new MAP_OBJECT(X,startY,11,2,5,32);
      else{
        new MAP_OBJECT(X,startY,RandTwo(12,13),2,4,32);
        let newPosx = X+RandTwo(0,14);
        let newPosy = startY+RandTwo(0,14);
        if(RandInt(9)>7){
          new MAP_FIX(newPosx,newPosy,8,3,RandTwo(8,9),20);
        }else{
          if(RandInt(5)==3&&EnemyCount>0&&newPosx!=625){
            if(A<2){
              new Dragon(newPosx,newPosy,32,30);
            }else{
              let AA = RandInt(4);
              if(AA==1)new Dragon(newPosx,newPosy,32,250)
              if(AA==2)new Tyrannosaur(newPosx,newPosy,32,150);
              if(AA==3)new Wizard(newPosx,newPosy,32,200);
              if(A>5&&RandInt(10)==1)new Boss(newPosx+64,newPosy+64,60,500);
            }
            EnemyCount--;
          }
        }
      }
    }
  }
}
class MAP_OBJECT extends object{
  //0-3:red-yellow key,4:floor,5,6,7>wall,8 door 9 bottle 10 barrel
  constructor(x,y,tx,ty,Ally=0,collisionSize,Life=1){
    super(x,y,collisionSize-4);
    this.Life = Life;
    this.MaxLife = Life;
    this.Ally=Ally;
    this.C=collisionSize;
    this.tx= tx;
    this.ty= ty;
    this.Attack = 0;
    this.R=0;
    this.Treasure = 0;
  }
  Die(){return !this.Life}
  Damage(d){
    if (this.Die())return 0;
    this.Life = max(this.Life-d,0);
    if(!this.Life){
      for(var i=0;i<10;i++)
        new Dead(this.pos,this.C);
      for(var i =0;i<this.Treasure;i++){
          let x = this.pos.x + RandTwo(-this.C,this.C);
          let y = this.pos.y + RandTwo(-this.C,this.C);
          let type = RandIntBetween(0,2);
          new MAP_FIX(x,y,type+11,3,type,20);
      }
      this.Destroy();
      SoundList(1)
    }
  }
  Render(){
    DrawImageT(ctx,this.pos,this.tx,this.ty,this.C);
  }
}
class MAP_FIX extends MAP_OBJECT{
  //x,y,tx,ty,Ally=0,collisionSize=32,Life=1
  constructor(x,y,tx,ty,Ally=0,c=32,Life=1){
    super(x,y,tx,ty,Ally,c,Life);
    this.Frame = new PositionXY(0,0);
    this.Treasure = RandInt(6%2);
  }
  Damage(a){
    super.Damage();
    for(var i =0;i<this.Treasure;i++){
        let x = this.pos.x + RandIntBetween(-25,25);
        let y = this.pos.y + RandIntBetween(-25,25);
        let type = RandIntBetween(0,2);
        new MAP_FIX(x,y,type+11,3,type,20);
    }
  }
  Update(){
      if(this.Ally<=3){
        this.pos.y+= this.Frame.y;
      if(this.pos.y>this.old.y+1||this.Frame.y>1){
        this.Frame.y-=.1;
      }else{
        this.Frame.y+=.1;
      }
    }else{
      Map_object_Array.forEach(e=>{
        let T = (this!=e&&e.pos!=null)?this.CollisionR(e):0;
        if(T&&e.Ally>=5&&e!=this&&this.Ally!=3){
          this.Life--;
          this.Damage(0);
        }
      });
      this.tx = this.Ally>8?9:10;
    }
  }
}
class door extends MAP_OBJECT{
  constructor(x,y,F,I){
    super(x,y,8,3,8,32);
    this.F = F;
    this.I = I;
    NextDoor.push(this);
  }
  GoNext(){
    if (!this.I||!Connected){
      NextFloor(this.F,this.I);
    }
  }
  Render(){
    if (!this.I||!Connected){
      super.Render();
    }
  }
}
