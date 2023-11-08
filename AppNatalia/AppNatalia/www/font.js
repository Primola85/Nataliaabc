function callFont(data){

  var googlefonts="";
  var classname="";
  //funcion google
  function addfontLB(fontName){
   var fontArray = fontName.split("-");
   var getFont = fontArray[1];
   var forclass = getFont.replace(/_/g," ")
   var forgoogle = getFont.replace(/_/g,"+");
   classname += "."+fontName+", h1."+fontName+", div[class*='app_navigation']."+fontName+" a span, ."+fontName+" input, ."+fontName+" textarea, ."+fontName+" select, ."+fontName+" option, ."+fontName+" button{ font-family :'"+forclass+"', sans;}";
      if(googlefonts.indexOf(forgoogle)==-1){
          if(googlefonts.length>1){googlefonts+="|"}
          googlefonts +=forgoogle;
      }
  }

  var fontslistarry=data.split("$$");

  for (var i = 0; i < fontslistarry.length; i++) {
    var arrFont=fontslistarry[i];
      if(arrFont.indexOf("cp-")>-1 || arrFont.indexOf("nav-")>-1 || arrFont.indexOf("head-")>-1){
        addfontLB(arrFont);
        }
  }
  setTimeout(function(){
    console.log(googlefonts);
    document.getElementById("googleFonts").setAttribute("href", "https://fonts.googleapis.com/css?family="+googlefonts+"&display=swap");
       document.getElementById("googleCss").innerHTML=classname;


  },300);

}