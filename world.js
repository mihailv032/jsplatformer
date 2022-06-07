import {Enemy, Player,Coin} from "./creatures.js"
//import { PhysicsEngine } from "./engines.js"

export default class World{
  constructor(level,retry,nextLevel){
    this.height = 288 //height to width ratio should be 1:3
    this. width = 896 //max width 56 max height 18
    this.score = 0
    this.level = level,
    this.currentLevel = 1
    this.retry = () => retry()
    this.nextLevel = () => nextLevel()
    this.delete = this.delete.bind(this)
    this.player = new Player(0,0)//the passed params are the spawn points coordinates
    this.objects = [ //objects are all the enemies and the obstacles in the world e.g fireball 
      //the array will be filled with pseudo arrays
      {//first arr will have all the enemies
//        "0":new Enemy("mushroom",this.width-7*16,this.height-80, () => this.delete(0,0)),
      },
      {},//second array will store all the coins
      {}//third arr should have things like fireballs 
  ]
    
    //Collision table will store all the coordinates of all the objects that need collision detection (everything but the sky and the ground)
    //the values will be setted by the display function during the first render 
    //the object will be used by the physics engine to check for any collisions
    this.collisionTable = {} //todo move this to physicsengine class

    this.populateWorld = this.populateWorld.bind(this)
    this.update = this.update.bind(this)//update gets called from the render which makes the context (this) get lost 
    this.increaseScore = this.increaseScore.bind(this)
  }
  delete(indexInArr,objectIndex){
//    console.log(`${indexInArr} ${objectIndex}`)
    if(this.objects[indexInArr][objectIndex].deathKd == 0){
      delete this.objects[indexInArr][objectIndex] 
    }else{
      this.objects[indexInArr][objectIndex].deathKd -= 1
    }
  }
  increaseScore(){
    this.score += 5
  }
  populateWorld(){

    console.log(window.level)
    this.player.x = window.level.mcSpawn[0]*16//set the spawn spoints here
    this.player.y = window.level.mcSpawn[1]*16
    window.level.mushrooms.forEach( (mushroom,index) => {
      this.objects[0][index] = new Enemy("mushroom",mushroom.x*16,mushroom.y*16,mushroom.bariers, () => this.delete(0,index) )
    })
    window.level.coins.forEach( ([x,y],index) => {
      this.objects[1][index] = new Coin(x*16,y*16, () => this.delete(1,index), () => this.increaseScore())
    });
  }
  update(){
    this.player.update()
    if(this.player.health <= 0){
      this.retry()
    }else if(this.player.x == window.level.endGame[0]*16){
      console.log(this.player)
      if(this.player.y == window.level.endGame[1]*16){
        this.nextLevel()
      }
    }
    for(let key in this.objects[0]){//only the enemies have an inner state to update 
      this.objects[0][key].update()
    }
  } 
}
