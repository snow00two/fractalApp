/* Sierpinski gasket, Sierpinski carpet, Koch flake etc. ; 
 * compact and expanding or shrinking flow version--for video
 * version 0.3, 2026/02/18, snow00two,
 * \href{https://creativecommons.org/licenses/by-nc-nd/4.0/}{\ccbyncsa}
 */
/* canvas setting */
const WIDTH_CANVAS = 720 * 3/2  ; //=1080
const HEIGHT_CANVAS = 405 * 3/2 ; //=607.5
const CENTER_X = WIDTH_CANVAS/2 ;
const CENTER_Y = HEIGHT_CANVAS/2 ;
const QUARTER_Y = HEIGHT_CANVAS/4 ;

/* color setting */
const DARK_COLOR = [150,30,50];
const WHITE_COLOR = 255;
let backColor ;
let frontColor ;

/* expanding and shrinking factors */
const FACTOR_2 = 1.021897149; //=2^{1/32} computed in ./p5/maple1.mw
const FACTOR_3 = 1.034927767; //=3^{1/32}
const FACTOR_5 = 1.030532582; //=\tau^{16}=((3 + sqrt(5))/2)^{1/32}

/* Sierpinski gasket setting, abbr. 3 */
const BASE_SEGMENT_3 = 500;
const centerBase3 = BASE_SEGMENT_3/2;/* sqrt(3) is not defind here so we cannot define radius3 etc */
let height3;
let radius3;
let shift3Y;
let fixed3X;
let fixed3Y;

/* Sierpinski carpet setting, abbr. 4 */
const BASE_SEGMENT_4 = 450 ;
const FIXED_4_X = ( WIDTH_CANVAS - BASE_SEGMENT_4 ) / 2;
const FIXED_4_Y = ( HEIGHT_CANVAS - BASE_SEGMENT_4 ) / 2;

/* Pentagram carpet setting, abbr. 5 */
const BASE_SEGMENT_5 = 250 ;
const SHIFT_5_Y = 20;
let scale5 ;
let trans5Y ;
let rotate5 ;

/* Koch flake setting, abbr. 6  */
const BASE_SEGMENT_6 = 250 ;
const WIDTH_6 = BASE_SEGMENT_6/2 ;
let height6 ; 
let subHeight6 ;
let trans6X ;
let trans6Y ;

/* Koch curve setting, abbr. koch */
const BASE_SEGMENT_KOCH = 400;
const BASE_SEGMENT_KOCH_2 = 2 * BASE_SEGMENT_KOCH;
const BASE_SEGMENT_KOCH_3 = 3 * BASE_SEGMENT_KOCH;

/* variable for setup */
let figChoice ; 
let figureState;
let presentFigure ; /* variable keeping the present figure */
let previousFigure ; /* variable keeping the previous figure */
let flowState ;
let presentFlow ;
let stopSwitch ; 
let switchState ;/* variable for 'stopping' or 'ongoing'*/
let freezRatio ;/* variable keeping ratio to stop flow */
let colorChoice ;  
let choiceC ;/* variable for color scheme */
let rotationAngle ;
let altVar = 0;

function setup() {
  height3 = sqrt(3)* BASE_SEGMENT_3 / 2; /* sqrt(3) is defind here */
  radius3 = 2 * height3 /3 ; /* the radius of circumscribed circle  */
  fixed3X = ( WIDTH_CANVAS - BASE_SEGMENT_3 ) / 2 ;
  fixed3Y = ( HEIGHT_CANVAS - height3  ) / 2 ;
  shift3Y= ( HEIGHT_CANVAS - height3 ) / 3 ;

  scale5 = 2 /(3 + sqrt(5)) ; // 1/tau^2
  trans5Y = 2 * BASE_SEGMENT_5 * sin(3 * PI / 10);

  height6 = BASE_SEGMENT_6 * sqrt(3)/2 ;
  subHeight6 = height6 / 2 ;
  trans6X = BASE_SEGMENT_6 * 3/2 ;
  trans6Y = BASE_SEGMENT_6 * sqrt(3) / 2 ;

  figChoice = createSelect();/* object setting figure */
  figChoice.option('Random Figure', 'auto'); /* automatic */
  figChoice.option('Sierpinski gasket', 'gasket'); /* Sierpinski gasket */
  figChoice.option('Alt Sierpinski gasket', 'gasketAlt'); /* Sierpinski gasket */
  figChoice.option('Sierpinski carpet', 'carpet'); /* Sierpinski carpet */
  figChoice.option('Trinal Tree', 'carpetAlt'); /* alternative of Sierpinski carpet */
  figChoice.option('Pentagen carpet', 'pentagon'); /* pentagon carpet */
  figChoice.option('Alt Pentagen carpet', 'pentagonAlt')/* alternative of pentagon carpet */
  figChoice.option('Koch flake', 'hexagon'); /* Koch flake */
  figChoice.option('Alt Koch flake', 'hexagonAlt'); /*alternative of Koch flake *  figChoice.option('Koch curve', 'koch'); /* Koch curve */
  figChoice.option('Koch curve', 'koch'); /* Koch curve */
  figChoice.option('Alt Koch curve', 'kochAlt'); /*Alt Koch curve */
  figChoice.selected('auto');
  figChoice.position(10, 8);
  figChoice.changed( resetBackground ) ;

  flowChoice = createSelect();/* object setting flow type */
  flowChoice.option('Random flow', 'auto');
  flowChoice.option('compact', 'compact');
  flowChoice.option('expanding flow', 'expanding');
  flowChoice.option('shrinking flow', 'shrinking');
  flowChoice.selected('auto');
  flowChoice.position(200, 8);
  flowChoice.changed( resetBackground ) ;

  colorChoice = createSelect();/* object setting color scheme */
  // colorChoice.option('Random color','auto');colorChoice.option('normal color','normal');
  colorChoice.option('normal color','normal');
  colorChoice.option('reverse color','reverse');
  colorChoice.selected('normal');
  colorChoice.position(350, 8);
  colorChoice.changed( resetBackground ) ;

  rotationAngle = createSelect();
  rotationAngle.option('No rotation', 'noRot');
  rotationAngle.option('Pi rotation', 'piRot');
  rotationAngle.selected('noRot');
  rotationAngle.position(480, 8);
  rotationAngle.changed( resetBackground ) ;

  choiceC = colorChoice.value();
  if (choiceC =='normal' ){
    backColor = DARK_COLOR;
    frontColor = WHITE_COLOR;
  } else if (choiceC == 'reverse') {
    backColor = WHITE_COLOR;
    frontColor = DARK_COLOR;
  } 

  stopSwitch = createRadio();/* object setting ongoing or stopping */
  stopSwitch.option('ongoing');
  stopSwitch.option('stopping');
  stopSwitch.selected('ongoing');
  stopSwitch.position(590, 8);

  /* setting depending on machine */
  // if (presentFigure == 'carpet'){
  //   frameRate(0.3);
  // } else {
  //   frameRate(0.6);
  // }

  frameRate(0.6);
  createCanvas(WIDTH_CANVAS, HEIGHT_CANVAS);
  background(backColor);
}

let n = 0;
let scalE = 1;
let phaseF = 0;
let lengthF = 0; 

function draw() {
  choiceC = colorChoice.value();
  if (choiceC == 'normal' ){
    backColor = DARK_COLOR;
    frontColor = WHITE_COLOR;
  } else {
    backColor = WHITE_COLOR;
    frontColor = DARK_COLOR;
  }

  switchState = stopSwitch.value();

  figureState = figChoice.value(); //Problem: If we set the value in the setup, this program dose not work well. 
  let figureList = ['gasket','carpet','carpetAlt','pentagon', 'hexagon', 'koch'];
  if (figureState == 'auto' && n == 0){
    presentFigure = random(figureList); //presentFigure is a global varialble
    altVar = random([0,1]);
    lengthF = 1;
  } else if (figureState == 'auto'&& n > 0 ) { //it preseves the previous value 
    presentFigure = presentFigure; 
    altVar = altVar;
  } else {
    presentFigure = figureState;
    altVar = altVar; 
  }

  if (presentFigure == 'gasketAlt'){
    altVar = 1;
    presentFigure = 'gasket';
  } else if (presentFigure == 'pentagonAlt'){
    altVar = 1;
    presentFigure = 'pentagon';
  } else if (presentFigure == 'hexagonAlt'){
    altVar = 1;
    presentFigure = 'hexagon';
  } else if (presentFigure == 'kochAlt'){
    altVar = 1;
    presentFigure = 'koch';
  }

  let flowList = ['compact', 'expanding', 'shrinking'];
  flowState = flowChoice.value() ;
  if (flowState == 'auto' && n == 0){
    presentFlow = random(flowList) ;
  } else if(flowState == 'auto' && n > 0 ){
    presentFlow = presentFlow;
  } else  {
    presentFlow = flowState;
  }

  let rotVal = rotationAngle.value();
  if (rotVal == 'piRot'){
    translate(CENTER_X, CENTER_Y);
    rotate(PI);
    translate(-CENTER_X, -CENTER_Y);
  }
  
  background(backColor);

  if (presentFigure == 'gasket' && presentFlow == 'compact'){
    translate(CENTER_X, CENTER_Y - shift3Y);
    fill(frontColor);
    iterateTriangleS(n,altVar);

    let I = 9 ; //Number of iterations
    
    if( n < I ){
      n = freezingFrame(switchState,n);
    } else {
      background(backColor);
      n = 0 ;
    } 
  } else if (presentFigure == 'gasket'&& presentFlow == 'expanding'){
    if (altVar == 0) {
      translate(fixed3X ,fixed3Y) ;//the fixed point of this flow
    } else {
      translate(CENTER_X, CENTER_Y - shift3Y + radius3);
    }
    
    let I = 7 ; //Number of iterations
    if (phaseF == 0) {//phaseF == 0, full window Sierpinski gasket
      iterateTriangleSF(n, altVar);

      if( n < I ){
        n = freezingFrame(switchState,n);
      } else {
        phaseF = 1;
        scalE = 1 * FACTOR_2;
      }
    } else { //phaseF == 1, flow of Sierpinski gasket
      scale(scalE);
      freezRatio = freezingRatio(switchState, FACTOR_2);
      scalE = scalE * freezRatio;

      fill(frontColor);
  
      let J = 5;// change scale at J step
      if( n < I + J ){
        iterateTriangleSF(7, altVar);
      } else {
        iterateTriangleSF(8, altVar);
      }
      let N = 31 ; //=2^5 -1: Number of iterations 
      if( n < I + lengthF * N ){
        n = freezingFrame(switchState,n);
      } else {
        n = 0 ;
        phaseF = 0;
        scalE = 1;
      }
    }
  } else if (presentFigure == 'gasket'&& presentFlow == 'shrinking'){
    if (altVar == 0) {
      translate(fixed3X ,fixed3Y) ;//the fixed point of this flow
    } else {
      translate(CENTER_X, CENTER_Y- shift3Y + radius3);
    }
    let I = 8 ; //Number of iterations
    if (phaseF == 0) {//phaseF == 0 :full window Sierpinski gasket
      iterateTriangleSF(n, altVar);

      if( n < I ){
        n = freezingFrame(switchState,n);
      } else {
        phaseF = 1;
        scalE = 2 / freezingRatio(switchState, FACTOR_2);
      }
    } else { //phaseF == 1 :flow of Sierpinski gasket
      scale(scalE);
      freezRatio = freezingRatio(switchState, FACTOR_2);
      scalE = scalE / freezRatio;

      noStroke();
      fill(frontColor);
      let J = 25;// change scale at J step
      if( n < I + J ){
        iterateTriangleSF(8, altVar);
      } else {
        iterateTriangleSF(7, altVar);
      }

      let N = 31 ; //=2^5 -1: Number of iterations 
      if( n < I + lengthF * N ){
        n = freezingFrame(switchState,n);
      } else {
        n = 0 ;
        scalE = 2;
        phaseF = 0;
      }
    }
  } else if (presentFigure == 'carpet'&& presentFlow == 'compact'){ 
    translate(CENTER_X, CENTER_Y);
    fill(frontColor);
    noStroke();
    iterateSquareS(n) ;
    
    let I = 6 ; //Number of iterations: 
    if( n < I ){
      n = freezingFrame(switchState,n);
    } else {
      background(backColor);
      n = 0 ;
    }
  } else if (presentFigure == 'carpet'&& presentFlow == 'expanding') {
    translate(CENTER_X,FIXED_4_Y);

    let I = 6 ; //Number of iterations
    if (phaseF == 0) {//phaseF == 0 
      fill(frontColor);
      noStroke();
      iterateSquareSF(n);
   
      if( n < I ){
        n = freezingFrame(switchState,n);
      } else {
        phaseF = 1;
        scalE = 1 * FACTOR_3;
      }
    } else {//phaseF == 1 :flow of Sierpinski carpet
      scale(scalE);
      freezRatio = freezingRatio(switchState, FACTOR_3);
      scalE = scalE * freezRatio;

      fill(frontColor);
      noStroke();
      let J = 25;// change scale at J step
      if( n < I + J ){
        iterateSquareSF(5);
      } else {
        iterateSquareSF(6);
      }
      let N = 31 ; //=2^5 -1: Number of iterations 
      if( n < I + lengthF * N ){
        n = freezingFrame(switchState,n);
      } else {
        n = 0 ;
        scalE = 1;
        phaseF =0;
      }
    }
  } else if (presentFigure == 'carpet'&& presentFlow == 'shrinking') {
    translate(CENTER_X,FIXED_4_Y);

    let I = 6 ; //Number of iterations
    if (phaseF == 0) {//phaseF == 0 :full window Sierpinski carpet

      fill(frontColor);
      noStroke();
      iterateSquareSF(n);
     
      if( n < I ){
        n = freezingFrame(switchState,n);
      } else {
        phaseF = 1;
        scalE = 3 / FACTOR_3;
      }
    } else {//phaseF == 1 :flow of Sierpinski carpet
      scale(scalE);
      freezRatio = freezingRatio(switchState, FACTOR_3);
      scalE = scalE / freezRatio;

      noStroke();
      fill(frontColor);
      J = 25;
      if( n < I + J ){
        iterateSquareSF(6);
      } else {
        iterateSquareSF(5);
      }

      let N = 31 ; //=2^5 -1: Number of iterations 
      if( n < I + lengthF * N ){
        n = freezingFrame(switchState,n);
      } else {
        n = 0 ;
        scalE = 3;
        phaseF = 0;
      }
    } 
  } else if (presentFigure == 'carpetAlt'&& presentFlow == 'compact'){ 
    translate(CENTER_X, CENTER_Y);
    fill(frontColor);
    noStroke();
    iterateSquareAlt(n) ;
    
    let I = 7 ; //Number of iterations: 
    if( n < I ){
      n = freezingFrame(switchState,n);
    } else {
      background(backColor);
      n = 0 ;
    }
  } else if (presentFigure == 'carpetAlt'&& presentFlow == 'expanding') {
    translate(CENTER_X, CENTER_Y);
    let I = 6 ; //Number of iterations

    if (phaseF == 0) {//phaseF == 0 
      fill(frontColor);
      noStroke();
      iterateSquareAltF(n);
     
      if( n < I ){
        n = freezingFrame(switchState,n);
      } else {
        phaseF = 1;
        scalE = 1 * FACTOR_3;
      }
    } else {//phaseF == 1 :flow of alt carpet
      scale(scalE);
      freezRatio = freezingRatio(switchState, FACTOR_3);
      scalE = scalE * freezRatio;

      fill(frontColor);
      noStroke();
      let J = 10;// change scale at J step
      if( n < I + J ){
        iterateSquareAltF(5);
      } else {
        iterateSquareAltF(6);
      }
      let N = 31 ; //=2^5 -1: Number of iterations 
      if( n < I + lengthF * N ){
        n = freezingFrame(switchState,n);
      } else {
        n = 0 ;
        scalE = 1;
        phaseF = 0 ;
      }
    }
  } else if (presentFigure == 'carpetAlt'&& presentFlow == 'shrinking') {
    translate(CENTER_X, CENTER_Y);
    let I = 6 ; //Number of iterations

    if (phaseF == 0) {//phaseF == 0 :full window Alt carpet
      fill(frontColor);
      noStroke();
      iterateSquareAltF(n);
     
      if( n < I ){
        n = freezingFrame(switchState,n);
      } else {
        phaseF = 1;
        scalE = 3 / FACTOR_3;
      }
    } else {//phaseF == 1 :flow of Alt carpet
      scale(scalE);
      freezRatio = freezingRatio(switchState, FACTOR_3);
      scalE = scalE / freezRatio;

      noStroke();
      fill(frontColor);
      J = 25;
      if( n < I + J ){
        iterateSquareAltF(6);
      } else {
        iterateSquareAltF(5);
      }

      let N = 31 ; //=2^5 -1: Number of iterations 
      if( n < I + lengthF * N  ){
        n = freezingFrame(switchState,n);
      } else {
        n = 0 ;
        scalE = 3;
        phaseF = 0;
      }
    } 
  } else if (presentFigure == 'pentagon'&& presentFlow == 'compact'){
    translate(CENTER_X , CENTER_Y + SHIFT_5_Y);
    fill(frontColor);
    noStroke();
    iteratePentagonS(n, altVar) ;
    
    let I = 7 ; //Number of iterations: 
    if( n < I ){
      n = freezingFrame(switchState,n);
    } else {
      background(backColor);
      n = 0 ;
    }
  } else if (presentFigure == 'pentagon'&& presentFlow == 'expanding'){
    translate(CENTER_X,CENTER_Y + SHIFT_5_Y);
    let I = 6 ; //Number of iterations

    if (phaseF == 0) {//phaseF == 0 
      noStroke();
      iteratePentagonSF(n, altVar);//

      if( n < I ){
        n = freezingFrame(switchState,n);
      } else {
        phaseF = 1;
        scalE = 1 * FACTOR_5;
      }
    } else { //phaseF == 1 :flow 
      translate(0, -BASE_SEGMENT_5);
      scale(scalE);
      translate(0, BASE_SEGMENT_5);
      freezRatio = freezingRatio(switchState, FACTOR_5);
      scalE = scalE * freezRatio;

      fill(frontColor);
      noStroke();
      let J = 14;// change scale at J step
      if( n < I + J ){
        iteratePentagonSF(5, altVar);
      } else {
        iteratePentagonSF(6, altVar);
      }
    
      let N = 31 ; //=2^5 -1: Number of iterations 
      if( n < I + lengthF * N ){
        n = freezingFrame(switchState,n);
      } else {
        n = 0 ;
        scalE = 1;
        phaseF = 0 ;
      }
    }
  } else if (presentFigure == 'pentagon'&& presentFlow == 'shrinking'){
    translate(CENTER_X,CENTER_Y + SHIFT_5_Y);
    let I = 6 ; //Number of iterations

    if (phaseF == 0) {//phaseF == 0 :full window Sierpinski carpet
      fill(frontColor);
      noStroke();
      iteratePentagonSF(n,altVar);
     
      if( n < I ){
        n = freezingFrame(switchState,n);
      } else {
        phaseF = 1;
        scalE = (3 + sqrt(5))/(2 *FACTOR_5);
      }
    } else {//phaseF == 1 :flow of Sierpinski carpet
      translate(0, -BASE_SEGMENT_5);
      scale(scalE);
      translate(0, BASE_SEGMENT_5);

      freezRatio = freezingRatio(switchState, FACTOR_5);
      scalE = scalE / freezRatio;

      noStroke();
      fill(frontColor);
      J = 25;
      if( n < I + J ){
        iteratePentagonSF(6, altVar);
      } else {
        iteratePentagonSF(5, altVar);
      }

      let N = 31 ; //=2^5 -1: Number of iterations 
      if( n < I + lengthF * N ){
        n = freezingFrame(switchState,n);
      } else {
        n = 0 ;
        scalE = (3 + sqrt(5))/2;
        phaseF = 0;
      }
    } 
  } else if (presentFigure == 'hexagon'&& presentFlow == 'compact'){
    translate(CENTER_X,CENTER_Y);
    noStroke();
    fill(frontColor);
    iterateHexagonS(n, altVar);

    let I = 8 ; //Number of iterations
    if( n < I ){
      n = freezingFrame(switchState,n);
    } else {
      background(backColor);
      n = 0 ;
    }
  } else if (presentFigure == 'hexagon'&& presentFlow == 'expanding'){
    translate(CENTER_X,CENTER_Y);
    let I = 6 ; //Number of iterations

    if (phaseF == 0) {//phaseF == 0 :full window Sierpinski gasket
        iterateHexagonSF(n, altVar);
      if( n < I ){
        n = freezingFrame(switchState,n);
      } else {
        phaseF = 1;
        scalE = 1 * FACTOR_3;
      }
    } else { //phaseF == 1 :flow 
      translate(0, -trans6Y);
      scale(scalE);
      translate(0, trans6Y);
      freezRatio = freezingRatio(switchState, FACTOR_3);
      scalE = scalE * freezRatio;

      fill(frontColor);
      noStroke();
      let J = 14;// change scale at J step
      if( n < I + J ){
        iterateHexagonSF(5, altVar);
      } else {
        iterateHexagonSF(6, altVar);
      }
    
      let N = 31 ; //=2^5 -1: Number of iterations 
      if( n < I + lengthF * N ){
        n = freezingFrame(switchState,n);
      } else {
        n = 0 ;
        scalE = 1;
        phaseF = 0;
      }
    }
  } else if (presentFigure == 'hexagon'&& presentFlow == 'shrinking'){
    translate(CENTER_X,CENTER_Y);
    let I = 6 ; //Number of iterations

    if (phaseF == 0) {//phaseF == 0 
        iterateHexagonSF(n, altVar);

      if( n < I ){
        n = freezingFrame(switchState,n);
      } else {
        phaseF = 1;
        scalE = 3 / FACTOR_3;
      }
    } else { //phaseF == 1 :flow 
      translate(0, -trans6Y);
      scale(scalE);
      translate(0, trans6Y);
      freezRatio = freezingRatio(switchState, FACTOR_3);
      scalE = scalE / freezRatio;

      fill(frontColor);
      noStroke();
      let J = 25;// change scale at J step
      if( n < I + J ){
        iterateHexagonSF(6, altVar);
      } else {
        iterateHexagonSF(5, altVar);
      }
    
      let N = 31 ; //=2^5 -1: Number of iterations 
      if( n < I + lengthF * N ){
        n = freezingFrame(switchState,n);
      } else {
        n = 0 ;
        scalE = 3;
        phaseF = 0;
      }
    }
  } else if (presentFigure == 'koch'&& presentFlow == 'compact'){
    translate(CENTER_X,QUARTER_Y);
    fill(frontColor);
    generateKoch(BASE_SEGMENT_KOCH, altVar,n);

    let I = 11 ; //Number of iterations
    
    if( n < I ){
      n = freezingFrame(switchState,n);
    } else {
      background(backColor);
      n = 0 ;
    } 
  } else if (presentFigure == 'koch'&& presentFlow == 'expanding'){
    translate(CENTER_X, QUARTER_Y);
    fill(frontColor);
    let I = 11 ; //Number of iterations

    if (phaseF == 0) {//phaseF == 0 
      generateKoch(BASE_SEGMENT_KOCH_2, altVar, n);

      if( n < I ){
        n = freezingFrame(switchState,n);
      } else {
       phaseF = 1;
       if (altVar == 0){
        scalE = 1 * FACTOR_3;
       } else{
        scalE = 1 * FACTOR_5;
       }
      }
    } else { //phaseF == 1 :flow 
      scale(scalE);
      let scaleF ;
      if (altVar == 0){
        scaleF = FACTOR_3 ;
      } else {
        scaleF = FACTOR_5;
      }
      freezRatio = freezingRatio(switchState, scaleF);
      scalE = scalE * freezRatio;

      fill(frontColor);
      noStroke();
      let J = 10;// change scale at J step
      if( n < I + J ){
        generateKoch(BASE_SEGMENT_KOCH_2, altVar, 12);
      } else {
        generateKoch(BASE_SEGMENT_KOCH_2, altVar, 13);
      }
      let N = 31 ; //=2^4 -1: Number of iterations 
      if( n < I + lengthF * N ){
        n = freezingFrame(switchState,n);
      } else {
        n = 0 ;
        phaseF = 0;
        if (altVar == 0){
          scalE = 3;
        } else {
          scalE = 1/scale5;
        }
      }
    }
  } else if (presentFigure == 'koch'&& presentFlow == 'shrinking'){
    translate(CENTER_X,QUARTER_Y);
    fill(frontColor);
    let I = 12 ; //Number of iterations

    if (phaseF == 0) {//phaseF == 0 
      generateKoch(BASE_SEGMENT_KOCH_3, altVar, n);

      if( n < I ){
        n = freezingFrame(switchState,n);
      } else {
       phaseF = 1;
       if (altVar == 0){
        scalE = 3 / FACTOR_3;
       } else {
        scalE = 1/( scale5 * FACTOR_5) ;
       }
      }
    } else { //phaseF == 1 :flow 
      scale(scalE);//
      let scaleF ;
      if (altVar == 0){
        scaleF = FACTOR_3 ;
      } else {
        scaleF = FACTOR_5;
      }
      freezRatio = freezingRatio(switchState, scaleF);
      scalE = scalE / freezRatio;

      fill(frontColor);
      noStroke();
      let J = 24;// change scale at J step
      if( n < I + J ){
        generateKoch(BASE_SEGMENT_KOCH_3, altVar, 14);
      } else {
        generateKoch(BASE_SEGMENT_KOCH_3, altVar, 13);
      }
      
      let N = 31 ; //=2^4 -1: Number of iterations 
      if( n < I + lengthF * N ){
        n = freezingFrame(switchState, n);
      } else {
        n = 0 ;
        phaseF = 0;
        if (altVar == 0){
          scalE = 3;
        } else {
          scalE = 1/scale5;
        }
      }
    }
  }
}

function iterateTriangleS(num,alt){
  push();
    if (num < 1){
        fill(frontColor);
        noStroke();
        triangle(-BASE_SEGMENT_3 / 2, -radius3 /2, BASE_SEGMENT_3 /2,　-radius3 /2, 0, radius3 );
      //Here we erase the center reverse triangle 
    } else {
        scale( 1 / 2 );
        fill(frontColor);
        noStroke();
        for (let l=0;l < 3;l++){
          translate(0, radius3 );
          iterateTriangleS(num - 1,alt);
          translate(0, -radius3 );
          rotate(2*PI/3);
        }
        if (alt == 1){
          rotate(PI/3);
          scale( 1 / 2 );
        fill(frontColor);
        noStroke();
        for (let l=0;l < 3;l++){
          translate(0, radius3 );
          iterateTriangleS(num - 2, alt);
          translate(0, -radius3 );
          rotate(2*PI/3);      
        }
      } 
    }  
  pop();
} 

function iterateTriangleSF(num, alt){
  push();
    if (alt == 0){
      translate(- BASE_SEGMENT_3/2, radius3 /2 );
      noStroke();
      for (let i = 1; i < 3; i++){
        for (let j = 0 ; j < 3; j = j+i){
          /* j=0,1,2 if i=1, j=0, 2 if i=2 */
          iterateTriangleS(num, alt);
          translate(i * BASE_SEGMENT_3,0) ;//attention: move after drawing
        }
        translate(-3.5 * BASE_SEGMENT_3, 3 * radius3 /2 );//attention: move after drawing
      }
    } else {
      translate(0, - 2 * radius3 );
      // 3*radius3 /2(height of the basic triangle) + radius3 /2(center of gravity)
      scale(2);
      iterateTriangleS(num+1, alt);
    }
  pop();
}

function iterateSquareS(num){
  push();
    if (num == 0) {
      noStroke();
      fill(frontColor);
      square(-BASE_SEGMENT_4/2, -BASE_SEGMENT_4/2, BASE_SEGMENT_4 );
    } else {
      scale(1/3);
      translate(-BASE_SEGMENT_4, BASE_SEGMENT_4);
      for (let l=0;l < 4;l++){
        noStroke();
        fill(frontColor);
        iterateSquareS(num - 1);
        translate(BASE_SEGMENT_4,0);
        iterateSquareS(num - 1);
        translate(BASE_SEGMENT_4,0);
        rotate(-PI/2);
      }
      translate(-BASE_SEGMENT_4, -BASE_SEGMENT_4);
     }
   pop();
}

function iterateSquareSF(num){
  push();
    noStroke();
    fill(frontColor);
    translate(-BASE_SEGMENT_4, BASE_SEGMENT_4/2);
    iterateSquareS(num) ;
    translate ( BASE_SEGMENT_4,0) ;
    iterateSquareS(num) ;
    translate ( BASE_SEGMENT_4,0) ;
    iterateSquareS(num) ;
    translate(-2*BASE_SEGMENT_4,BASE_SEGMENT_4) ;
    iterateSquareS(num) ;
    translate ( 2*BASE_SEGMENT_4,0) ;
    iterateSquareS(num) ;
    translate ( - BASE_SEGMENT_4, -3 * BASE_SEGMENT_4 / 2 ) ;//back to (0,0)
  pop();
}

function iterateSquareAlt(num){
  push();
    if (num == 0) {
      noStroke();
      fill(frontColor);
      square(-BASE_SEGMENT_4/2, -BASE_SEGMENT_4/2, BASE_SEGMENT_4 );
    } else {
      scale(1/3);
      iterateSquareAlt(num - 1);
      translate(-BASE_SEGMENT_4, BASE_SEGMENT_4);
      for (let l=0;l < 4;l++){
        noStroke();
        fill(frontColor);
        iterateSquareAlt(num - 1);
        translate(2 * BASE_SEGMENT_4,0);
        rotate(-PI/2);
      }
      translate(-BASE_SEGMENT_4, -BASE_SEGMENT_4);
     }
   pop();
}

function iterateSquareAltF(num){
  push();
    noStroke();
    fill(frontColor);
    iterateSquareAlt(num);
      translate(-BASE_SEGMENT_4, BASE_SEGMENT_4);
      for (let l=0;l < 4;l++){
        noStroke();
        fill(frontColor);
        iterateSquareAlt(num );
        translate(2 * BASE_SEGMENT_4,0);
        rotate(-PI/2);
      }
      translate(-BASE_SEGMENT_4, -BASE_SEGMENT_4);//back to (0,0)
  pop();
}

function pentagoN(){
  push();
    for(i = 0; i < 5; i++){
      triangle(0,0, BASE_SEGMENT_5*cos(3* PI /10 ), BASE_SEGMENT_5*sin(3* PI /10 ), -BASE_SEGMENT_5*cos(3* PI /10), BASE_SEGMENT_5*sin(3* PI /10));
      rotate(2 * PI /5);
    }
    rotate(2* PI /5);
  pop();
}

function iteratePentagonS(num, alt){
  push();
    if (num <= 0){
      pentagoN();
    } else {
      scale(scale5);
      if (alt == 0){
        rotate(PI);
        iteratePentagonS(num-1, alt);
        rotate(PI);
      } 
      for (let i = 0; i < 5; i++){
        translate(0, -trans5Y);
        iteratePentagonS(num-1, alt);
        translate(0, trans5Y);
        rotate(-2 * PI/5);
      }
    }
  pop();
}

function iteratePentagonSF(num, alt){
  push();
    iteratePentagonS(num, alt);
    if (alt == 0){
      translate(0,trans5Y);
      rotate(PI);
      iteratePentagonS(num, alt);
      rotate(PI);
      translate(0,-trans5Y);
    }
    translate(BASE_SEGMENT_5*cos(3* PI /10 ), BASE_SEGMENT_5*sin(3* PI /10 ));
    translate(BASE_SEGMENT_5*cos( PI /10 ), BASE_SEGMENT_5*sin(PI /10 ));
    iteratePentagonS(num, alt);
    translate(-BASE_SEGMENT_5*cos( PI /10 ), -BASE_SEGMENT_5*sin(PI /10 ));
    translate(-BASE_SEGMENT_5*cos(3* PI /10 ), -BASE_SEGMENT_5*sin(3* PI /10 ));
    translate(-BASE_SEGMENT_5*cos(3* PI /10 ), BASE_SEGMENT_5*sin(3* PI /10 ));
    translate(-BASE_SEGMENT_5*cos( PI /10 ), BASE_SEGMENT_5*sin(PI /10 ));
    iteratePentagonS(num, alt);
  pop();
}

function hexagoN(){
  push();
    noStroke();
    fill(frontColor);
    for (let m=0; m < 6; m++){
      noStroke();
      triangle(0,0,WIDTH_6,height6,-WIDTH_6, height6);
      rotate(PI/3);
    }
  pop();
}

function iterateHexagonS(num,alt){
    push();
      if(num == 0){
        noStroke();
        fill(frontColor);
        hexagoN();
      } else {
          scale(1/3);
          if (alt == 0 ){
            noStroke();
            fill(frontColor);
            iterateHexagonS(num-1, alt);
          }
          if (alt == 0 ||alt == 1 ){
            for (let m=1; m < 7; m++){
              translate(0, 2 * height6);
              noStroke();
              iterateHexagonS(num-1, alt);
              translate(0, -2 * height6);
              rotate(PI/3);
            }
            translate(0, -2 * height6);
          } 
          // else {
          // 　scale(3);
          //   scale(1/2);
          //   //rotate(PI/2);
          //   for (let m=1; m < 4; m++){
          //     translate(WIDTH_6, height6);
          //     noStroke();
          //     iterateHexagonS(num-1, alt);
          //     translate(-WIDTH_6, -height6);
          //     rotate(2 * PI /3);
          //   }
          // }   
      }
    pop();
}

function iterateHexagonSF(num, alt){
  push();
    iterateHexagonS(num, alt);
    translate(trans6X,trans6Y);
    iterateHexagonS(num, alt);
    translate(-trans6X,-trans6Y);
    if (alt == 0){
      translate(0,2*trans6Y);
      iterateHexagonS(num, alt);
      translate(0,-2*trans6Y);
    }
    translate(-trans6X,trans6Y);
    iterateHexagonS(num, alt);
    translate(trans6X,-trans6Y);
  pop();
}

function iterateIsoTriangleS(cX,cY,lX,lY,rX,rY, ratio, num){
  push();
    if(num == 0){
      noStroke();
      fill(frontColor);
      triangle(cX,cY,lX,lY,rX,rY);
    } else {
      let nC1X = ratio* rX + (1-ratio) * lX;
      let nC1Y = ratio* rY + (1-ratio) * lY;
      let nC2X = ratio* lX + (1-ratio) * rX;
      let nC2Y = ratio* lY + (1-ratio) * rY;
      iterateIsoTriangleS(nC1X, nC1Y , cX , cY , lX, lY, ratio, num - 1);
      iterateIsoTriangleS(nC2X, nC2Y , cX , cY , rX, rY, ratio, num - 1);
    }
  pop();
}

function generateKoch(baseLength, alt, num) {
  if (alt == 0 ){
    iterateIsoTriangleS(0, 0,　-baseLength,　baseLength/sqrt(3),　baseLength,　baseLength/sqrt(3), 1/3, num);
  } else {
    iterateIsoTriangleS(0, 0,　-baseLength,　baseLength * tan(PI/5),　baseLength,　baseLength * tan(PI/5), scale5, num);
  }
}

function freezingFrame(sState,num){
  if ( sState == 'ongoing' ){ //'ongoing'
    return num + 1;
  } else if ( sState == 'stopping') {
    return num ;
  }
}

function freezingRatio(sState, rat){
  if ( sState == 'ongoing' ){ //'ongoing'
    return rat;
  } else if ( sState == 'stopping') {
    return 1 ;
  }
}

function resetBackground () {
  previousFigure = presentFigure;
  presentFigure = figChoice.value() ;

  /* setting depending on machine */
  if (presentFigure == 'carpet'){
    frameRate(0.3);
  } else {
    frameRate(0.5);
  }

  scalE = 1;
  scale(scalE);//reset scaleß
  
  background(backColor);
  n = 0;
  phaseF = 0;
}
