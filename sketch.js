//global variables to biund to the proper canvases
let canvas;
let ctx;
let canv;
let ctx2;

function run(imgFile) {
  canvas=document.getElementById('canvas');
  ctx=canvas.getContext('2d');

  canv=document.getElementById('dithCanvas');
  ctx2=canv.getContext('2d');
  //create image object
  let img=new Image();
  img.onload=function() {
    //when it loads size canvas
    canvas.width=img.width;
    canvas.height=img.height;
    //when it loads size canvas
    canv.width=img.width;
    canv.height=img.height;
    //draw image unalterd on proper canvas
    ctx.drawImage(img,0,0);
    //get the image data to apply dither to
    let imData=ctx.getImageData(0,0,img.width,img.height);
    //draw dithered version on proper canvas
    let test=floydSteinberg(imData);
    ctx2.putImageData(test,0,0);
  }

  //read the file
  let reader=new FileReader();
  reader.onload=function(){
    //when it is read set img's source to the image in the file
    img.src=reader.result;
  }
  reader.readAsDataURL(imgFile.files[0]);
}

function saveDith(){
  //save the dithered canvas as png
  canv.toBlob(function(blob){
    let tes=window.URL.createObjectURL(blob);
    let downloadElement = document.createElement('a');
    downloadElement.href=tes;
    downloadElement.download="FSDithered.png";
    downloadElement.style = "display: none";
    downloadElement.click();
    window.URL.revokeObjectURL(tes);
  });
}


function floydSteinberg(img){
  //value 1 less than the possible number values(eg. if 8 possible values for RGBA than this is 7)
  let factor=Number(document.getElementById('factor').value);
  for(let y=0;y<img.height;y++){
    for(let x=0;x<img.width;x++){
      //for each pixel
      //get its index in img.data
      let red=y*img.width*4+x*4;
      //make copy to modify to new values(RGBA)
      let newpix=[img.data[red], img.data[red+1], img.data[red+2], img.data[red+3]];
      for(let i=0;i<newpix.length;i++){
        //for each value in the pixel(RGBA)
        //calculate new value
        newpix[i]=Math.round(factor*newpix[i]/255)*(255/factor);
        //if actually wanted to lower bits would not multiply by 255/factor, but other wise all values would be low and everything would be dark and couldn't visualize effects as well
        //calculate error between old and new value
        let error=img.data[red+i]-newpix[i];
        //update value to new value
        img.data[red+i]=newpix[i];
        //change surrounding pixels(if they exist)
        if(x!=0&&y!=img.height-1&&x!=img.width-1){//maybe apply to pixels that do exist
          let ind=red+4;
          img.data[ind+i]+=error*7/16;
          ind=red+4*img.width;
          img.data[ind+i]+=error*5/16;
          ind-=4;
          img.data[ind+i]+=error*3/16;
          ind+=8;
          img.data[ind+i]+=error*1/16;
        }
      }
    }
  }
  return img;
}
