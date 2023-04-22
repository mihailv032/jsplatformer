import {Mushroom,Plant, Player,Coin} from "./creatures.js"
import {RENDERING_DISTANCE} from './constants.js'
//import { PhysicsEngine } from "./engines.js"

export default class World{
  constructor(level,retry,nextLevel){
    this.height = 288 //height to width ratio should be 1:3
    this. width = 896 //max width 56 max height 18
    this.cameraWidth = 256 
    this.cameraHeight = 128
    this.cameraX = [window.level.cameraX[0]*16,window.level.cameraX[1]*16]
    this.cameraY = [window.level.cameraY[0]*16,window.level.cameraY[1]*16]
    this.score = 0
    this.level = level,
    this.timer = window.level.timer
    this.currentLevel = 1
    this.retry = () => retry()
    this.nextLevel = () => nextLevel()
    this.delete = this.delete.bind(this)
    this.player = new Player(0,0)//the passed params are the spawn points coordinates
    this.objects = [ //objects are all the enemies and the obstacles in the world e.g fireball 
		     /*
			all the objects here are pseudo arrays
			which will store different objects like enemies,projectiles etc
			starting at index 0 
		      */
		     {},//coins
		     {},//mushrooms
		     {},//plants
		     {}//projectiles
    ]
    this.objectsPossition = {}
    this.populateWorld = this.populateWorld.bind(this)
    this.update = this.update.bind(this)//update gets called from the render which makes the context (this) get lost 
    this.increaseScore = this.increaseScore.bind(this)
  }
  delete(indexInArr,objectIndex){
    if(this.objects[indexInArr][objectIndex].deathKd == 0){
      delete this.objects[indexInArr][objectIndex] 
    }else{
      this.objects[indexInArr][objectIndex].deathKd -= 1
    }
  }
  increaseScore(){
    this.score += 5
  }
  addProjectile(){

  }
  clearWorld(){
    this.timer=window.level.timer
    this.score = 0
    this.player.health = 100
    this.objects = [{},{},{},{}]
    this.objectsPossition = {}
  }
  //more like init world
  populateWorld(){
    this.cameraX = [window.level.cameraX[0]*16,window.level.cameraX[1]*16]
    this.player.x = window.level.mcSpawn[0]*16//set the spawn spoints here
    this.player.y = window.level.mcSpawn[1]*16

    window.level.coins ? window.level.coins.forEach( ([x,y],index) => {//coins
      this.objects[0][index] = new Coin(x*16,y*16, () => this.delete(0,index), () => this.increaseScore())
    }) : null
    window.level.mushrooms ? window.level.mushrooms.forEach( (mushroom,index) => {//mushrooms
      this.objects[1][index] = new Mushroom(mushroom.x*16,mushroom.y*16,mushroom.bariers, () => this.delete(1,index) )
    }) : null 
    window.level.plants ? window.level.plants.forEach( (plant,index) => { //plants
      this.objects[2][index] = new Plant(plant.x*16,plant.y*16, plant.vector, () => this.delete(2,index) )
    }) : null
  }
  handleCameraX(){
    
    //if the player got to the end of the world
    if( (this.cameraX[1] + RENDERING_DISTANCE > this.width) && (this.cameraX[1] - this.player.baseXvelocity >= this.width) && (this.player.xVelocity >= 0)){
      this.cameraX[1] = this.width
      this.cameraX[0] = this.width-this.cameraWidth
    }else{
      if( ((this.player.x) >= this.cameraX[1] - RENDERING_DISTANCE) && (this.player.xVelocity > 0)){//should we move the camera
	//the and is needed for smooth camera transition
	this.cameraX[1] -= this.player.baseXvelocity //we substract because the player baseXvelocity is -4
	this.cameraX[0] -= this.player.baseXvelocity 
      }else if((this.player.xVelocity === 0) && ((this.player.x) >= (this.cameraX[1] - RENDERING_DISTANCE*1.5))){//center camera
	this.cameraX[1] -= this.player.baseXvelocity/1.5
	this.cameraX[0] -= this.player.baseXvelocity/1.5
      }
    }
    
    if( (this.cameraX[0] - RENDERING_DISTANCE < 0) && (this.cameraX[0] + this.player.baseXvelocity <= 0) && (this.player.xVelocity <= 0)){//end of the world case 
      //the and is needed for smooth camera transition
      this.cameraX[0] = 0;
      this.cameraX[1] = this.cameraWidth;
    }else{
      if( ((this.player.x) <= this.cameraX[0] + RENDERING_DISTANCE) && (this.player.xVelocity < 0)){//should we move the camera
	this.cameraX[1] += this.player.baseXvelocity
	this.cameraX[0] += this.player.baseXvelocity
      }else if((this.player.xVelocity === 0) && ((this.player.x) >= (this.cameraX[1] + RENDERING_DISTANCE*1.5))){
	this.cameraX[1] += this.player.baseXvelocity/1.5
	this.cameraX[0] += this.player.baseXvelocity/1.5
      }
      
    }
  }

  handleCameraY(){
    //move camera up 
    if(this.player.y < this.cameraY[0]){
      return;
      console.log(this.cameraY)
      this.cameraY[0] -= 10
      this.cameraY[1] -= 10
    }
  }

  update(){
    if(this.timer == 0){
      this.retry()
      return;
    }
    if(this.player.health <= 0){
      this.retry()
      return;
    }
    this.handleCameraX()
    this.handleCameraY()
    if(this.player.x == window.level.endGame[0]*16){
      if(this.player.y == window.level.endGame[1]*16){
        this.nextLevel()
	return;
      }
    }

    //RENDERING_DISTANCE=48
    //player.baseVelocity
    this.player.update()
    this.objects.slice(1).forEach( (object,index) => {//start from 1 objs as object at index 0 stores all the coins which do not need to be updated
      for(let key in object){//only the enemies have an inner state to update 
	object[key].update()
//	this.objectsPossition[object[key].x] = new objectPosition(object[key].y,[index,key]) //development 
      }
    })
  } 
}

class objectPosition{
  constructor(y,index){
    this.y = {
      index: index
    }
  }
}
