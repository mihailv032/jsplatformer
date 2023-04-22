import {RENDERING_DISTANCE} from './constants.js'

/*
The screen class will handl all the animations
and render all the graphics 
*/
export default class Screen {
  constructor(canvas,world){
    this.buffer = document.createElement("canvas").getContext("2d")
    this.context = canvas.getContext("2d")

    this.getTexture = (name) => tiles.get(name)

    this.player = world.player
    this.world = world
    this.update = this.update.bind(this)
    this.buffer.canvas.height = world.cameraHeight//world.height
    this.buffer.canvas.width = world.cameraWidth//world.width

    this.animations = {

    }
    this.flagAnimation = {delay:0,totalFrames:9,currentFrame:0,delayThreshold:3} //technically door is not an object from the world so it will be drawn here

    this.update = this.update.bind(this)
  }
  
  #handlAnimation(object,texture){
    if (object[texture] == undefined){ debugger}
    if (object[texture].delay == object[texture].delayThreshold){
      //check if at the last frame
      object[texture].currentFrame == object[texture].totalFrames ? object[texture].currentFrame=0 : object[texture].currentFrame++
      object[texture].delay = 0
    }else {
      object[texture].delay += 1
    }
//    console.log(object)
    return object[texture].currentFrame
  }
  #drawPlayer(){
    const delay = 3 //w8 3 cycles bofore drawing the next frame of animation
    let texture; //will be used to render  
    let textureName //will be used to get the info about the animation from playeranimation obj
    if(this.player.attacks){
      textureName="attack" 
      if(this.player.lookingDirection === "right"){ texture = "mcAttackRight"+this.player.animations[textureName].currentFrame
      }else texture = "mcAttackLeft"+this.player.animations[textureName].currentFrame;
    }else if(this.player.xVelocity == 0){
      textureName = "idle"
      if(this.player.lookingDirection === "right" ){texture = "mcIdleRight"}
      else texture = "mcIdleLeft"
    }else{
      textureName = "run" //both runs have the same amount of frames 
                            //instead of creating another object for run left just use the one for normal run
      if(this.player.xVelocity > 0){
        texture = "mcRunRight"
      }else{
        texture = "mcRunLeft"
      }
    }
    texture = texture + this.#handlAnimation(this.player.animations,textureName)
    let playerX=this.#findAbsolutePosition(this.player.x)//this.player.x;
//    console.log(playerX)
	  const playerY = this.#findAbsoluteYPosition(this.player.y)+7
    this.buffer.fillStyle = this.player.health > 70 ? "#009614" : this.player.health > 30 ? "#ab5b00" : "#fc030f" //defines the colours for the hp bar
    this.buffer.fillRect(playerX, playerY-3, (this.player.width*(this.player.health/100) ), 2) //hp bar
    this.buffer.drawImage(this.getTexture(texture),playerX, playerY, this.player.width, this.player.height); 
  }

  #drawMushroom(object){

    let textureName="run"; 
    let texture = object.xVelocity > 0 ? "mushroomRunRight" : "mushroomRunLeft";

    if(object.xVelocity == 0 ){
      textureName="death"
      texture="mushroomDeath"
    }    
    texture = texture+String(this.#handlAnimation(object.animations,textureName))
    const mushroomX = this.#findAbsolutePosition(object.x)
    const muchroomY = this.#findAbsoluteYPosition(object.y)
    this.buffer.fillStyle = object.health > 50 ? "#009614" : "#fc030f"
    this.buffer.fillRect(mushroomX, Math.floor(muchroomY+5), (object.width*(object.health/100) ), 2) //hp bar
    this.buffer.drawImage(this.getTexture(texture),mushroomX,muchroomY+7,16,16)
  }
  #drawPlant(plant){
    let textureName = plant.vector > 0 ? "plantLeft" : "plantRight"
    let texture = textureName + String(this.#handlAnimation(plant.animations,textureName))

    const plantX = this.#findAbsolutePosition(plant.x)
    const planY = this.#findAbsoluteYPosition(plant.y)
    this.buffer.fillRect(Math.floor(plantX), Math.floor(planY+2), (plant.width*(plant.health/100) ), 2) //hp bar
    this.buffer.drawImage(this.getTexture(texture),plantX,planY+7,16,16)
  }
  #drawCoin(coin){
    let textureName = "rotate"
    let texture = "coin"
    texture = texture+this.#handlAnimation(coin.animations,textureName)
    const coinX = this.#findAbsolutePosition(coin.x)
    const coinY = this.#findAbsoluteYPosition(coin.y)
    this.buffer.drawImage(this.getTexture(texture),coinX,coinY+4,16,16)
  }
  #drawFlag(){
    if (this.flagAnimation.delay == this.flagAnimation.delayThreshold){
      //check if at the last frame
      this.flagAnimation.currentFrame == this.flagAnimation.totalFrames ? this.flagAnimation.currentFrame=0 : this.flagAnimation.currentFrame++
													      this.flagAnimation.delay = 0
    }else {
      this.flagAnimation.delay += 1
    }
    const texture = "flag"
    const flagX = this.#findAbsolutePosition(window.level.endGame[0]*16)
    const flagY = this.#findAbsoluteYPosition(window.level.endGame[1]*16)
    this.buffer.drawImage(this.getTexture(`${texture}${this.flagAnimation.currentFrame}`),flagX,flagY+4,16,16)
  }
  #findAbsolutePosition(pos){return this.world.cameraWidth - (this.world.cameraX[1] - pos)};
  #findAbsoluteYPosition(pos){return this.world.cameraHeight - (this.world.cameraY[1] - pos)}
  #drawBackground(instruction){
    const xStart = instruction.ranges[0]*16 <= this.world.cameraX[0] ? 0 : instruction.ranges[0]-(this.world.cameraX[0]/16),
	  xEnd = instruction.ranges[1]*16 >= this.world.cameraX[1] ? this.world.cameraWidth/16 : this.#findAbsolutePosition(instruction.ranges[1]*16)/16,
	  yStart = instruction.ranges[2]*16 < this.world.cameraY[0] ? 0 : instruction.ranges[2]-(this.world.cameraY[0]/16),
	  yEnd= instruction.ranges[3]*16 > this.world.cameraY[1] ? this.world.cameraHeight/16 : this.#findAbsoluteYPosition(instruction.ranges[3]*16)/16,
	  texture=instruction.tile
//    debugger
    if(instruction.ranges[0] === 3 && instruction.ranges[1] === 5) debugger;
    for( let x=xStart;x<=xEnd; x++ ){
      for( let y=yStart;y<=yEnd;y++){
        this.buffer.drawImage(this.getTexture(texture),(x*16),y*16,16,16)
      }
    }
  }

  #drawLevel(){
//    this.#draw(this.level.background[0])
    window.level.background.forEach( item => {
      if(item.ranges[1]*16 < this.world.cameraX[0]){return};
      if(item.ranges[0]*16 > this.world.cameraX[1]) return;

      this.#drawBackground(item)
    })
    window.level.ground.forEach( item => {
      if(item.ranges[1]*16 < this.world.cameraX[0]){return};
      if(item.ranges[0]*16 > this.world.cameraX[1]) return;
//      if(item.ranges[3] > this.world.cameraY[0]) return;
//      if(item.ranges[4] > this.world.cameraY[1]) return;

      this.#drawBackground(item)
    })

  }
  kurwa(){
//    for(let i =0; i<=this.world.cameraWidth; i++){
//      this.buffer.fillStyle="#ffffff"
//      this.buffer.fillRect(i,200,16,16)
//    }
    this.buffer.fillStyle="#ffffff"
    this.buffer.fillRect(this.world.cameraWidth-RENDERING_DISTANCE,5,16,16)
    this.buffer.fillRect(this.world.cameraX[1],5,16,16)
  }
  update(){
    let objects = this.world.objects
    this.#drawLevel()
    this.#drawFlag()
    this.#drawPlayer()

    this.kurwa()
    for(let key in objects[0]){
      this.#drawCoin(objects[0][key])
    }
    for(let key in objects[1]){
      this.#drawMushroom(objects[1][key])
    }
    for(let key in objects[2]){
      this.#drawPlant(objects[2][key])
    }

    this.buffer.drawImage(this.getTexture("plantBullet"),50,50,16,16)//test
    this.buffer.fillStyle="#ffffff"
    this.buffer.font = "6px 'Press Start 2P', cursive"
    this.buffer.fillText(`Time Left: ${this.world.timer}s`,this.buffer.canvas.width-100,30)
    this.buffer.fillText(`Score: ${this.world.score}`,this.buffer.canvas.width-100,45)
    //apply the changes 
    this.context.drawImage(this.buffer.canvas, 0, 0, this.buffer.canvas.width, this.buffer.canvas.height, 0, 0, this.context.canvas.width, this.context.canvas.height)

  }
  setAnimations(){//called before the start of every level to set all the textures
    let objects = this.world.objects
    this.player.animations["idle"] = new Animation(3) //mc
    this.player.animations["run"] = new Animation(5)
    this.player.animations["attack"] = new Animation(6)

    for( let key in objects[0]){//strawberry
      objects[0][key].animations["rotate"] = new Animation(15,1)
    }
    let mushroom = objects[1]
    for(let n in objects[1]){//mushroom
        mushroom[n].animations["run"] = new Animation(6)
        mushroom[n].animations["death"] = new Animation(3,4)
    }
    let plant = objects[2]
    for(let n in objects[2]){//plant
        plant[n].animations["plantLeft"] = new Animation(7)
        plant[n].animations["plantRight"] = new Animation(7)
    }
  }

  onResize(width,height,worldheightwidthratio) {
    return;
    if (height / width > worldheightwidthratio) {
      this.context.canvas.height = width * worldheightwidthratio;
      this.context.canvas.width = width;
    } else {
      this.context.canvas.height = height;
      this.context.canvas.width =height / worldheightwidthratio;
    }
  }
}

class Animation {
constructor(totalFrames,delayThreshold=3){
    this.delayThreshold = delayThreshold
    this.delay = +1
    this.totalFrames = totalFrames
    this.currentFrame = +1
  }
}

class Tiles{
  constructor(dy,dx,...textures){
    this.tileset = textures
    this.width = dx
    this.height = dy
    this.tiles = new Map()
    this.tileColision = [] //why is this here ?

    this.get = this.get.bind(this)
    this.add = this.add.bind(this)
  }
  add(name,x,y,tilesetId,width=16,height=16,animationFrameNumber=false,addBothSides=false){
    //animation frame number is used to indicate the frame of animation if tile is statis leave as false

    //if addBothSides is true 2 copies will be added for right and left hand side
    //initial position always should be right
    const buffer = document.createElement('canvas');            
    buffer.width = this.width
    buffer.height = this.height
    let passedName = name; //needed for addBothSidesCase as the inital name will be modified
    const context = buffer.getContext('2d')
    if(addBothSides){
      context.translate(width, 0);
      context.scale(-1, 1);
      name = `${name}Left`
    }
    context.drawImage(this.tileset[tilesetId],
      x,y,
      width,height,
      0,0,
      this.width,this.height
    )
    if(animationFrameNumber !== false){ name = `${name}${animationFrameNumber}`}
    this.tiles.set(name,buffer)
    if(addBothSides){this.add(`${passedName}Right`,x,y,tilesetId,width,height,animationFrameNumber,false)}
  }
  get(name){
    if(this.tiles.has(name)){
      return this.tiles.get(name)
    }else{
      alert(`sry no ${name}`)
    }
  }
}

export let tiles;
function loadImage(url) { 

    return new Promise( res => {
    const image = new Image()
      addEventListener('load', () => {
      res(image)
    })
    image.src = url
  })
}

async function getTexture(){
  let mc
  let textures
  let mushrooms
  let coin
  let flag
  let plant
  loadImage("./textures/mcSprites.png").then( img => {
    mc = img
  })
  loadImage("./textures/mushroomSpritesTest.png").then( img => {
	  mushrooms = img
  })
  loadImage("./textures/finishFlag.png").then(img => flag = img)
  loadImage("./textures/finishFlag.png").then(img => flag = img)
  loadImage("./textures/plant.png").then( img => plant = img)
  loadImage("./textures/tileset.png").then(img => {
    textures = img
  })

  await loadImage("./textures/klubnika.png").then( img => coin=img )
    tiles =new Tiles(16,16,textures,mc,mushrooms,coin,flag,plant)
  //main sprites 0
  //mc 1
  //mushroom 2 
  //coin (strwaberry) 3
  //flag 4
  //plant 5
}
await getTexture()
  tiles.add("ground",80,240,0)
  tiles.add("groundGrass",48,224,0)
  tiles.add('topGroundGrass',242,224,0)
  tiles.add('background',368,224,0)
  tiles.add("lightDarkGround",368,160,0)

  tiles.add('grassTopRightCorner',128,32,0)
  tiles.add("grassTopLeftCorner",64,32,0)
  tiles.add("grassInnerTopRightCorner",208,224,0)
  tiles.add("grassTopRightCornerOutter",544,272,0)

  tiles.add("grassBottomRightCornerOutter",560,272,0)
  tiles.add('grassBottomRightCorner',256,272,0)
  tiles.add('grassBottomLeftCorner',208,272,0)
  tiles.add("leafBottomLeftCorner",64,96,0)

  tiles.add("grassVertical",256,256,0)
  tiles.add("grassVerticalRight",208,256,0)

  tiles.add("greenLeaf",480,176,0)
  tiles.add("leafBottomLeftCorner",496,176,0)
  tiles.add("leafVertical",496,160,0)
  tiles.add("leafTopLeftCorner",464,144,0)

  tiles.add("mcRun",0,16,1 ,16,16,0,true) 
  tiles.add("mcRun",16,16,1,16,16,1,true)
  tiles.add("mcRun",32,16,1,16,16,2,true)
  tiles.add("mcRun",48,16,1,16,16,3,true)
  tiles.add("mcRun",64,16,1,16,16,4,true)
  tiles.add("mcRun",80,16,1,16,16,5,true)
  
  tiles.add("mcIdle",0,80,1,16,16,0,true)
  tiles.add("mcIdle",16,80,1,16,16,1,true)
  tiles.add("mcIdle",32,80,1,16,16,2,true)
  tiles.add("mcIdle",48,80,1,16,16,3,true)

  tiles.add("mcAttack",0,64,1 ,16,16,0,true)
  tiles.add("mcAttack",16,64,1,16,16,1,true)
  tiles.add("mcAttack",32,64,1,16,16,2,true)
  tiles.add("mcAttack",48,64,1,16,16,3,true)
  tiles.add("mcAttack",64,64,1,16,16,4,true)
  tiles.add("mcAttack",80,64,1,16,16,5,true)
  tiles.add("mcAttack",96,64,1,16,16,6,true)
,16,16,0
  tiles.add("mushroomRun",16,0,2 ,16,16,0,true)
  tiles.add("mushroomRun",32,0,2 ,16,16,1,true)
  tiles.add("mushroomRun",48,0,2 ,16,16,2,true)
  tiles.add("mushroomRun",64,0,2 ,16,16,3,true)
  tiles.add("mushroomRun",80,0,2 ,16,16,4,true)
  tiles.add("mushroomRun",96,0,2 ,16,16,5,true)
  tiles.add("mushroomRun",114,0,2,16,16,6,true)

  tiles.add("mushroomDeath",0,32,2 ,16,16,0)
  tiles.add("mushroomDeath",16,32,2,16,16,1)
  tiles.add("mushroomDeath",32,32,2,16,16,2)
  tiles.add("mushroomDeath",48,32,2,16,16,3)


  tiles.add("plant",0,44,5,44,44  ,0,true)
  tiles.add("plant",44,44,5,44,44 ,1,true)
  tiles.add("plant",88,44,5,44,44 ,2,true)
  tiles.add("plant",132,44,5,44,44,3,true)
  tiles.add("plant",176,44,5,44,44,4,true)
  tiles.add("plant",220,44,5,44,44,5,true)
  tiles.add("plant",264,44,5,44,44,6,true)
  tiles.add("plant",308,44,5,44,44,7,true)

  tiles.add("plantBullet",0,86,5,44,44)
  //technically its a strawberry
  tiles.add("coin",8,8,3  ,16,16,0)
  tiles.add("coin",40,8,3 ,16,16,1)
  tiles.add("coin",72,8,3 ,16,16,2)
  tiles.add("coin",104,8,3,16,16,3)
  tiles.add("coin",168,8,3,16,16,4)
  tiles.add("coin",200,8,3,16,16,5)
  tiles.add("coin",232,8,3,16,16,6)
  tiles.add("coin",264,8,3,16,16,7)
  tiles.add("coin",296,8,3,16,16,8)
  tiles.add("coin",328,8,3,16,16,9)
  tiles.add("coin",360,8,3,16,16,10)
  tiles.add("coin",392,8,3,16,16,11)
  tiles.add("coin",424,8,3,16,16,12)
  tiles.add("coin",456,8,3,16,16,13)
  tiles.add("coin",488,8,3,16,16,14)
  tiles.add("coin",520,8,3,16,16,15)

  tiles.add("flag",0,0,4,64,64  ,0)
  tiles.add("flag",64,0,4,64,64 ,1)
  tiles.add("flag",128,0,4,64,64,2)
  tiles.add("flag",192,0,4,64,64,3)
  tiles.add("flag",256,0,4,64,64,4)
  tiles.add("flag",320,0,4,64,64,5)
  tiles.add("flag",384,0,4,64,64,6)
  tiles.add("flag",448,0,4,64,64,7)
  tiles.add("flag",512,0,4,64,64,8)
  tiles.add("flag",576,0,4,64,64,9)
