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
    this.buffer.canvas.height = world.height
    this.buffer.canvas.width = world.width

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
      texture = "mcAttack"+this.player.animations[textureName].currentFrame
    }else if(this.player.xVelocity == 0){
      textureName = "idle"
      texture = "mcIdle"
    }else{
      textureName = "run" //both runs have the same amount of frames 
                            //instead of creating another object for run left just use the one for normal run
      if(this.player.xVelocity > 0){
        texture = "mcRun"
      }else{
        texture = "mcRunLeft"
      }
    }
    texture = texture + this.#handlAnimation(this.player.animations,textureName)
    this.buffer.fillStyle = this.player.health > 50 ? "#009614" : "#fc030f" //defines the colours for the hp bar
    this.buffer.fillRect(Math.floor(this.player.x), Math.floor(this.player.y+2), (this.player.width*(this.player.health/100) ), 2) //hp bar
    this.buffer.drawImage(this.getTexture(texture),Math.floor(this.player.x), Math.floor(this.player.y+7), this.player.width, this.player.height); 
  }

  #drawMushroom(object){

    let textureName="run"; 
    let texture = object.xVelocity > 0 ? "mushroomRun" : "mushroomRunLeft";

    if(object.xVelocity == 0 ){
      textureName="death"
      texture="mushroomDeath"
    }    
    texture = texture+String(this.#handlAnimation(object.animations,textureName))
    this.buffer.fillStyle = object.health > 50 ? "#009614" : "#fc030f"
    this.buffer.fillRect(Math.floor(object.x), Math.floor(object.y+2), (object.width*(object.health/100) ), 2) //hp bar
    this.buffer.drawImage(this.getTexture(texture),object.x,object.y+7,16,16)
  }
  #drawPlant(plant){
    let textureName = plant.vector > 0 ? "plantLeft" : "plantRight"
    let texture = textureName + String(this.#handlAnimation(plant.animations,textureName))

    this.buffer.fillRect(Math.floor(plant.x), Math.floor(plant.y+2), (plant.width*(plant.health/100) ), 2) //hp bar
    this.buffer.drawImage(this.getTexture(texture),plant.x,plant.y+7,16,16)
  }
  #drawCoin(coin){
    let textureName = "rotate"
    let texture = "coin"
    texture = texture+this.#handlAnimation(coin.animations,textureName)
    this.buffer.drawImage(this.getTexture(texture),coin.x,coin.y+4,16,16)
  }
  #drawBackground(instruction){
    const xStart = instruction.ranges[0]
    const xEnd =instruction.ranges[1]
    const yStart = instruction.ranges[2]
    const yEnd= instruction.ranges[3]
    const texture=instruction.tile

    for( let x=xStart;x<xEnd; x++ ){
      let y=yStart
      for( let y=yStart;y<yEnd;y++){
        this.buffer.drawImage(this.getTexture(texture),x*16,y*16,16,16)
      }
    }
  }
  #drawFlag(){
    if (this.flagAnimation.delay == this.flagAnimation.delayThreshold){
      //check if at the last frame
      this.flagAnimation.currentFrame == this.flagAnimation.totalFrames ? this.flagAnimation.currentFrame=0 : this.flagAnimation.currentFrame++
      this.flagAnimation.delay = 0
    }else {
      this.flagAnimation.delay += 1
    }
    let texture = "flag"

    this.buffer.drawImage(this.getTexture(`flag${this.flagAnimation.currentFrame}`),window.level.endGame[0]*16,(window.level.endGame[1]*16)+4,16,16)
  }
  #drawLevel(){
//    this.#draw(this.level.background[0])
    window.level.background.forEach( item => {
      this.#drawBackground(item)
    })
    window.level.ground.forEach( item => {
      this.#drawBackground(item)
    })

  }
  update(){
    let objects = this.world.objects
    this.#drawLevel()
    this.#drawFlag()
    this.#drawPlayer()

    for(let key in objects[1]){
      this.#drawCoin(objects[1][key])
    }
    for(let key in objects[0]){
      this.#drawMushroom(objects[0][key])
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

    let mushroom = objects[0]
    for(let n in objects[0]){//mushroom
        mushroom[n].animations["run"] = new Animation(6)
        mushroom[n].animations["death"] = new Animation(3)
    }
    let plant = objects[2]
    for(let n in objects[2]){//plant
        plant[n].animations["plantLeft"] = new Animation(7)
        plant[n].animations["plantRight"] = new Animation(7)
    }
    for( let key in objects[1]){//strawberry
      objects[1][key].animations["rotate"] = new Animation(15,1)
    }
  }

  onResize(width,height,worldheightwidthratio) {
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
  add(name,x,y,tilesetId,width=16,height=16){
    const buffer = document.createElement('canvas');
    buffer.width = this.width
    buffer.height = this.height

    buffer.getContext('2d').drawImage(this.tileset[tilesetId],
      x,y,
      width,height,
      0,0,
      this.width,this.height
      )
    
    this.tiles.set(name,buffer)
  }
  add64(name,x,y,tilesetId){
     const buffer = document.createElement('canvas');
    buffer.width = this.width
    buffer.height = this.height

    buffer.getContext('2d').drawImage(this.tileset[tilesetId],
      x,y,
      64,64,
      0,0,
      this.width,this.height
      )
    
    this.tiles.set(name,buffer)

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
  tiles.add('background',368,224,0)
  tiles.add("lightDarkGround",368,160,0)
  tiles.add("grassTopLeftCorner",64,32,0)
  tiles.add('grassBottomRightCorner',256,272,0)
  tiles.add("grassVertical",256,256,0)
  tiles.add("greenLeaf",480,176,0)
  tiles.add("leafBottomLeftCorner",496,176,0)
  tiles.add("leafVertical",496,160,0)
  tiles.add("leafTopLeftCorner",464,144,0)

  tiles.add("mcRun0",0,16,1) 
  tiles.add("mcRun1",16,16,1)
  tiles.add("mcRun2",32,16,1)
  tiles.add("mcRun3",48,16,1)
  tiles.add("mcRun4",64,16,1)
  tiles.add("mcRun5",80,16,1)

  tiles.add("mcRunLeft0",0,176,1)
  tiles.add("mcRunLeft1",16,176,1)
  tiles.add("mcRunLeft2",32,176,1)
  tiles.add("mcRunLeft3",48,176,1)
  tiles.add("mcRunLeft4",64,176,1)
  tiles.add("mcRunLeft5",80,176,1)
  
  tiles.add("mcIdle0",0,80,1)
  tiles.add("mcIdle1",16,80,1)
  tiles.add("mcIdle2",32,80,1)
  tiles.add("mcIdle3",48,80,1)

  tiles.add("mcAttack0",0,64,1)
  tiles.add("mcAttack1",16,64,1)
  tiles.add("mcAttack2",32,64,1)
  tiles.add("mcAttack3",48,64,1)
  tiles.add("mcAttack4",64,64,1)
  tiles.add("mcAttack5",80,64,1)
  tiles.add("mcAttack6",96,64,1)

  tiles.add("mushroomRun0",16,0,2)
  tiles.add("mushroomRun1",32,0,2)
  tiles.add("mushroomRun2",48,0,2)
  tiles.add("mushroomRun3",64,0,2)
  tiles.add("mushroomRun4",80,0,2)
  tiles.add("mushroomRun5",96,0,2)
  tiles.add("mushroomRun6",114,0,2)

  tiles.add("mushroomRunLeft0",16,16,2)
  tiles.add("mushroomRunLeft1",32,16,2)
  tiles.add("mushroomRunLeft2",48,16,2)
  tiles.add("mushroomRunLeft3",64,16,2)
  tiles.add("mushroomRunLeft4",80,16,2)
  tiles.add("mushroomRunLeft5",96,16,2)
  tiles.add("mushroomRunLeft6",114,16,2)

  tiles.add("mushroomDeath0",0,32,2)
  tiles.add("mushroomDeath1",16,32,2)
  tiles.add("mushroomDeath2",32,32,2)
  tiles.add("mushroomDeath3",48,32,2)

  tiles.add("plantLeft0",0,0,5,44,44)
  tiles.add("plantLeft1",44,0,5,44,44)
  tiles.add("plantLeft2",88,0,5,44,44)
  tiles.add("plantLeft3",132,0,5,44,44)
  tiles.add("plantLeft4",176,0,5,44,44)
  tiles.add("plantLeft5",220,0,5,44,44)
  tiles.add("plantLeft6",264,0,5,44,44)
  tiles.add("plantLeft7",308,0,5,44,44)

  tiles.add("plantRight0",0,44,5,44,44)
  tiles.add("plantRight1",44,44,5,44,44)
  tiles.add("plantRight2",88,44,5,44,44)
  tiles.add("plantRight3",132,44,5,44,44)
  tiles.add("plantRight4",176,44,5,44,44)
  tiles.add("plantRight5",220,44,5,44,44)
  tiles.add("plantRight6",264,44,5,44,44)
  tiles.add("plantRight7",308,44,5,44,44)

  tiles.add("plantBullet",0,86,5,44,44)
  //technically its a strawberry
  tiles.add("coin0",8,8,3)
  tiles.add("coin1",40,8,3)
  tiles.add("coin2",72,8,3)
  tiles.add("coin3",104,8,3)
  tiles.add("coin4",168,8,3)
  tiles.add("coin5",200,8,3)
  tiles.add("coin6",232,8,3)
  tiles.add("coin7",264,8,3)
  tiles.add("coin8",296,8,3)
  tiles.add("coin9",328,8,3)
  tiles.add("coin10",360,8,3)
  tiles.add("coin11",392,8,3)
  tiles.add("coin12",424,8,3)
  tiles.add("coin13",456,8,3)
  tiles.add("coin14",488,8,3)
  tiles.add("coin15",520,8,3)

  tiles.add("flag0",0,0,4,64,64)
  tiles.add("flag1",64,0,4,64,64)
  tiles.add("flag2",128,0,4,64,64)
  tiles.add("flag3",192,0,4,64,64)
  tiles.add("flag4",256,0,4,64,64)
  tiles.add("flag5",320,0,4,64,64)
  tiles.add("flag6",384,0,4,64,64)
  tiles.add("flag7",448,0,4,64,64)
  tiles.add("flag8",512,0,4,64,64)
  tiles.add("flag9",576,0,4,64,64)
