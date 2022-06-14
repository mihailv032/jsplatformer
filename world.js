import {Mushroom,Plant, Player,Coin} from "./creatures.js"
//import { PhysicsEngine } from "./engines.js"

export default class World{
  constructor(level,retry,nextLevel){
    this.height = 288 //height to width ratio should be 1:3
    this. width = 896 //max width 56 max height 18
    this.score = 0
    this.level = level,
    this.timer = window.level.timer
    this.currentLevel = 1
    this.retry = () => retry()
    this.nextLevel = () => nextLevel()
    this.delete = this.delete.bind(this)
    this.player = new Player(0,0)//the passed params are the spawn points coordinates
    this.objects = [ //objects are all the enemies and the obstacles in the world e.g fireball 
		     {},//coins
		     {},//mushrooms
		     {},//plants
		     {}//projectiles
    ]
    
    this.populateWorld = this.populateWorld.bind(this)
    this.update = this.update.bind(this)//update gets called from the render which makes the context (this) get lost 
    this.increaseScore = this.increaseScore.bind(this)
  }
  delete(indexInArr,objectIndex){
    console.log(`${indexInArr} ${objectIndex}`)
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
    this.objects = [{},{},{},{}]
  }
  populateWorld(){
    this.player.x = window.level.mcSpawn[0]*16//set the spawn spoints here
    this.player.y = window.level.mcSpawn[1]*16

    window.level.coins.forEach( ([x,y],index) => {
      this.objects[0][index] = new Coin(x*16,y*16, () => this.delete(0,index), () => this.increaseScore())
    });
    window.level.mushrooms.forEach( (mushroom,index) => {
      this.objects[1][index] = new Mushroom(mushroom.x*16,mushroom.y*16,mushroom.bariers, () => this.delete(1,index) )
    })
    window.level.plants.forEach( (plant,index) => {
      this.objects[2][index] = new Plant(plant.x*16,plant.y*16, plant.vector, () => this.delete(2,index) )
    })
  }
  update(){
    if(this.timer == 0){
      this.retry()
    }
    if(this.player.health <= 0){
      console.log(this.player.health)
      this.retry()
    }else if(this.player.x == window.level.endGame[0]*16){
      if(this.player.y == window.level.endGame[1]*16){
        this.nextLevel()
      }
    }
    this.player.update()
    this.objects.slice(1).forEach( object => {
      for(let key in object){//only the enemies have an inner state to update 
	object[key].update()
      }
    })
  } 
}
