
export class RenderEngine{
  constructor(fps,updateWorld,updateScreen,physicsEngine){
    this.fps = fps;

    this.time = 0;
    this.timePastFromLastUpdate = 0

    this.worldUpdated = false

    /*

    TODO: move the collision table from world class to renderengine class 

    */
    this.updateWorld = updateWorld
    this.updateScreen = updateScreen
    this.physicsEngine = physicsEngine
    this.start = this.start.bind(this)
    this.stop = this.stop.bind(this)

    this.cycle = this.cycle.bind(this)
  }

  #worldUpdate(){
    while( this.timePastFromLastUpdate >= this.fps){//update every 30sec
      this.updateWorld()

      this.physicsEngine.collisionDetection()//check if after the updates in the world the are no colisions
      this.timePastFromLastUpdate -= this.fps //update multiple times if last update was 60+ ms ago
      this.worldUpdated = true
    }
  }

  #updateScreen(){
    if(this.worldUpdated){//only update the display after changes in world occured
      this.worldUpdated = false
      this.updateScreen()
    }else { //just for testing purposes // delete the whole if the else block is never executed
      alert('kurwa match')
    }

  }

  #render(timeStamp){// render cycles happen here 
    this.#worldUpdate()
    this.#updateScreen()
    this.animationFrameId = requestAnimationFrame( this.cycle )
  }

  cycle(timeStamp){
    this.timePastFromLastUpdate += timeStamp - this.time //this might not work
    this.time = timeStamp //if anything is wrong with the rendering check here first

    if (this.timePastFromLastUpdate >= this.fps * 3) {
      this.timePastFromLastUpdate = this.fps;
    }

    if (this.timePastFromLastUpdate < this.fps){//if 30ms didn't pass dont call render
      this.animationFrameId = requestAnimationFrame( this.cycle )
      return;
    }

    this.#render(timeStamp)
    
  }

  start(){
//    this.physicsEngine.fillCollisionTable()
    this.timePastFromLastUpdate = this.fps
    this.time = window.performance.now()
    this.animationFrameId = requestAnimationFrame( this.cycle )
  }

  stop(){
    window.cancelAnimationFrame(this.animationFrameId)
//    this.worldUpdated= false
//    this.time =0
  }
}

/*


                PhYSICS ENGINE 




*/

 export class PhysicsEngine{ //there will be no physics in this game lol why is this here
  constructor(world){
    this.world = world
    this.player = world.player
    this.objects = world.objects

//    this.jumpingDelay=0 //todo make smooth jumping animation

    this.fillCollisionTable = this.fillCollisionTable.bind(this)
    this.collisionDetection = this.collisionDetection.bind(this)
  }

  collisionDetection(){
    this.#edgeCheck(this.player)
    this.#gravitationSimulation() 
    this.#objectsCollision()
    this.#plaerCollisionDetection()
  }

  #plaerCollisionDetection(){
    if(Math.round(this.player.x/16) in this.world.collisionTable){
      const pos = Math.round(this.player.x/16)
      if(this.world.collisionTable[pos].y[roundToTheNearestMultipleOfSixteen(this.player.y) ] !== undefined ){
        this.player.x = this.world.collisionTable[pos].y[roundToTheNearestMultipleOfSixteen(this.player.y) ][1]
        this.player.y = this.world.collisionTable[pos].y[roundToTheNearestMultipleOfSixteen(this.player.y) ][0]

        //when you jump on a platform you never land on it 
        //your x/y gets changed by the physics engine 
        //so you technically never land 
        //to fix this just make sure to explicitaly set jumping to false and velocity to 0
        if(this.player.jumping){ this.player.jumping=false; this.player.yVelocity=0} //bug fix 

      }else {
      }
    }
  }
  #objectsCollision(){
    let objects = this.world.objects
    for(let key in objects[0]){
      this.#edgeCheck(objects[0][key])
      if ( roundToTheNearestMultipleOfSixteen(objects[0][key].x) == roundToTheNearestMultipleOfSixteen(this.player.x) ){
        if(this.player.jumping){
          if( roundToTheNearestMultipleOfSixteen(objects[0][key].y) == roundToTheNearestMultipleOfSixteen(this.player.y)+16){ 
            objects[0][key].takeDamage(1)
            return;
          }
        }
        if( roundToTheNearestMultipleOfSixteen(objects[0][key].y) == this.player.y){ 
//          alert("axe attacks")
        this.player.takeDamage()
      }
      }
    }
    for(let key in objects[1]){
      if(objects[1][key].x == roundToTheNearestMultipleOfSixteen(this.player.x)){
        if(objects[1][key].y == roundToTheNearestMultipleOfSixteen(this.player.y)){
          objects[1][key].scoreIncrease()
          objects[1][key].disintegrate()
        }
      }
    }
//    this.world.objects[1].forEach( object => { 
//      console.log(`${object.x} == ${roundToTheNearestMultipleOfSixteen(this.player.x)} `)
//   })
  }
  #edgeCheck(object){
    if (object.x < 0){
      object.x = 0
      object.xVelocity = 0
      return;
    }
    if (object.x + object.width > this.world.width){
      object.x = this.world.width - object.width
      object.velocity = 0
      return;
    }
    if(object.y < 0){
      object.y = 0
      return;
    }
    if(object.y > this.world.height-this.player.height){
      object.y = this.world.height-this.player.height
      object.yVelocity=0
      object.jumping=false
    }
  }

  #gravitationSimulation(){ 
    if (this.player.jumping){
      this.player.yVelocity = 3 //faling
      this.player.jumpingTime = 0 
      return;
    }   

    if( !(Math.round(this.player.x/16) in this.world.collisionTable) ){
      this.player.y = this.world.height-this.player.height-32 //-32 is the lowest point where the player can stand
      this.player.yVelocity = 0
      this.player.jumping = false
    }else if(this.world.collisionTable[Math.round(this.player.x/16)].y[ roundToTheNearestMultipleOfSixteen(this.player.y)+16 ] == undefined ){
      this.player.jumping = true
      this.player.yVelocity += 1
    }


  }
  fillCollisionTable(){
    window.level.ground.forEach( item => {
      const xStart = item.ranges[0]
      const xEnd =item.ranges[1]
      const yStart = item.ranges[2]
      const yEnd= item.ranges[3]
      
      for( let x=xStart;x<xEnd; x++ ){
        let xResolve=x*16+item.collisionResolve.x*16;
        for( let y=yStart;y<yEnd;y++){
          let yResolve=(y-item.collisionResolve.y)*16
          if(x in this.world.collisionTable){
            this.world.collisionTable[x].add(y*16,yResolve,xResolve)
          }else{
            this.world.collisionTable[x] = new CollisionObject(y*16,yResolve,xResolve)
          }
        }
      }
    })

  }
}

function roundToTheNearestMultipleOfSixteen(number){
  return Number.isInteger(number/16) ? number : Math.round(number/16)*16
}


class CollisionObject{
  constructor(y,yResolve,xResolve){
    this.y = {//sort of pseudo array ?? mb not really
      
    } 
                //kiss
    this.y[y] = [yResolve,xResolve]//tells the physics engine how to resolve the colision
    this.add = this.add.bind(this)
  }
  add(y,yResolve,xResolve){
    this.y[y] = [yResolve,xResolve]
  }
}

