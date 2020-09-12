<script>
onmousedown=e=>{
  let a = e.which;
  MousedownA[a]=new PositionXY((e.x-width/2),(e.y-height/2));
  MouseDown=1;
}
onmouseup=e=>{MouseDown=0;MousedownA=[];}
onmousemove=e=>{}
oncontextmenu=e=>false
onkeydown=e=>{
  var i = e.which;
  var a=[87,83,65,68];
  KeyEvent=a.indexOf(i)>=0?1:0;
  KeyIn[i]=1;
}
onkeyup=e=>{
  KeyIn[e.which]=0;
  KeyEvent=KeyIn.some(e=>e!=0)?1:0;
}
</script>
