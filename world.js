import {Mushroom,Plant, Player,Coin} from "./creatures.js"
import {RENDERING_DISTANCE} from './constants.js'
//import { PhysicsEngine } from "./engines.js"

export default class World{
  constructor(level,retry,nextLevel){
    this.height = 288 //height to width ratio should be 1:3
    this. width = 896 //max width 56 max height 18
    this.cameraWidth = 448 
    this.cameraHeight = 288
    this.cameraX = [0,448]
    this.cameraY = [0,288]
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
  populateWorld(){
    this.player.x = window.level.mcSpawn[0]*16//set the spawn spoints here
    this.player.y = window.level.mcSpawn[1]*16

    window.level.coins ? window.level.coins.forEach( ([x,y],index) => {
      this.objects[0][index] = new Coin(x*16,y*16, () => this.delete(0,index), () => this.increaseScore())
    }) : null
    window.level.mushrooms ? window.level.mushrooms.forEach( (mushroom,index) => {
      this.objects[1][index] = new Mushroom(mushroom.x*16,mushroom.y*16,mushroom.bariers, () => this.delete(1,index) )
    }) : null 
    window.level.plants ? window.level.plants.forEach( (plant,index) => { 
      this.objects[2][index] = new Plant(plant.x*16,plant.y*16, plant.vector, () => this.delete(2,index) )
    }) : null
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
    if(this.player.x == window.level.endGame[0]*16){
      if(this.player.y == window.level.endGame[1]*16){
        this.nextLevel()
	return;
      }
    }
//    console.log(`${this.cameraWidth - RENDERING_DISTANCE} ${(this.cameraWidth)-(this.cameraX[1]-this.player.x)}`)
    if( ((this.cameraWidth)-(this.cameraX[1]-this.player.x)) >= this.cameraWidth - RENDERING_DISTANCE){//RENDERING_DISTANCE=48
      console.log('hre')
      if((this.cameraX[1]+ RENDERING_DISTANCE) > this.width){
	this.cameraX[1] += this.width - this.cameraX[1]//cameraShift
	this.cameraX[0] += this.width - this.cameraX[1]
      }else{
	this.cameraX[1] += RENDERING_DISTANCE
	this.cameraX[0] += RENDERING_DISTANCE
      }
    }
    if(this.player.x-RENDERING_DISTANCE < this.cameraX[0] ){
      if(this.player.x-RENDERING_DISTANCE > 0){;
	console.log("move camera back")
	this.cameraX[1] -= RENDERING_DISTANCE
	this.cameraX[0] -= RENDERING_DISTANCE
      }
    }
    
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

let x = {
  y: {
    f:"5"
  }
}

console.log(x.y.f)
