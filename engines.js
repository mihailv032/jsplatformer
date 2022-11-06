
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
    this.playerJumpingTime = 0
    this.objects = world.objects

    this.collisionTable ={
    }

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
     const xpos = roundToNearestMultipleOfSixteen(this.player.x)/16
     const ypos = roundToNearestMultipleOfSixteen(this.player.y) 

     if(!(xpos in this.collisionTable)) return;
     if(this.collisionTable[xpos].y[ypos] === undefined ) return;

     //setting the x of the player to be = to his currect x -/+ the distance that he colided with the object
     // +/- 4 (velosity speed) so the collision with the obejct will look more smooth
     //the initial calculations looked like this: this.player.x = this.player.x - (xpos - (this.player.x/16))*16 + 4
     // however turns out it will always return a 4 so thats what i do to save resources
     if(this.player.lookingDirection === "right"){this.player.x = this.player.x - 4}
     else{this.player.x = this.player.x + 4}
     console.log(ypos)
     console.log(Math.round(this.player.y)+6)
     if (this.player.jumping){
       if(this.player.yVelocity > 0){this.player.y = ypos - 16}
       else this.player.y = ypos + 16
//       this.player.y = this.collisionTable[xpos].y[ypos][0] 
       
       //	this.player.stop()
       //when you jump on a platform you never land on it 
       //your x/y gets changed by the physics engine 
       //so you technically never land 
       //to fix this just make sure to explicitaly set jumping to false and yvelocity to 0
       this.player.jumping=false; this.player.yVelocity=0;this.playerJumpingTime=0 //bug fix 
     }else {
       this.player.stop()
     }
   }

  #objectsCollision(){
    let objects = this.world.objects
    for(let key in objects[1]){
//      this.#edgeCheck(objects[0][key]) //not really needed for this objects

      if ( roundToNearestMultipleOfSixteen(objects[1][key].x) == roundToNearestMultipleOfSixteen(this.player.x) ){
        if(this.player.yVelocity > 0){//if the player jumps on mushrooms head
          if( roundToNearestMultipleOfSixteen(objects[1][key].y)-16 ==  roundToNearestMultipleOfSixteen(this.player.y)){ 
            objects[1][key].takeDamage(100)
            return;
          }
        }
        if( roundToNearestMultipleOfSixteen(objects[1][key].y) == this.player.y){ 
          if(objects[1][key].health != 0){//mushrooms are alive for 9 frames after their hp reach 0 so they can play the death animation 
            console.log('attack')
            this.player.takeDamage()
          }
        }
      }
    }
    for(let key in objects[0]){
      if(objects[0][key].x == roundToNearestMultipleOfSixteen(this.player.x)){
        if(objects[0][key].y == roundToNearestMultipleOfSixteen(this.player.y)){
          objects[0][key].scoreIncrease()
          objects[0][key].disintegrate()
        }
      }
    }
//    this.world.objects[1].forEach( object => { 
//      console.log(`${object.x} == ${roundToNearestMultipleOfSixteen(this.player.x)} `)
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
    if(object.y < 18){//16 the size of the mc and 2 the height of the hp bar
      debugger
      object.jumping = true
      object.yVelocity = 3.3
      object.y = 18
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
      this.player.yVelocity < 0 ? this.playerJumpingTime++ : this.playerJumpingTime = 0
      if(this.playerJumpingTime  === 2){//for some reasone >= will make him fly
        this.player.yVelocity = -6
        return;
      }else if (this.playerJumpingTime == 5){
        this.player.yVelocity = -2 
      }else if(this.playerJumpingTime == 8){
        this.player.yVelocity = 3.3 //faling
        this.playerJumpingTime = 0 
      }
      return;
    }   
    if( (Math.round(this.player.x/16) in this.collisionTable) ){//technically should alway be true
      if(this.collisionTable[Math.round(this.player.x/16)].y[ roundToNearestMultipleOfSixteen(this.player.y)+16 ] == undefined ){
	//if there is no ground under the player 
	this.player.jumping = true
	this.player.yVelocity = 3.3

      }
    }else {
      alert("something went wrong")
    }
  }
  clearCollisionTable(){
    this.collisionTable={}
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
          if(x in this.collisionTable){
            this.collisionTable[x].add(y*16,yResolve,xResolve)
          }else{
            this.collisionTable[x] = new CollisionObject(y*16,yResolve,xResolve)
          }
        }
      }
    })

  }
}

function roundToNearestMultipleOfSixteen(number){
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

