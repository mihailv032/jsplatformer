
class Creature {
  constructor(x,y,disintegrate,height=16,width=16){

    this.x = x; //spawn points 
    this.y = y;

    this.animations = {} //the skin of the creature

    this.health = 100
    this.attacks = false

    this.damageKd = 0
    this.deathKd = 9 //the thingy will still be on the screen for 3 frams are death so it can play the death animation
    this.jumping = false //if the thing is jumping right now
    this.width = width;
    this.height = height,

    this.xVelocity = 0, //speed 
    this. yVelocity = 0

    this.disintegrate = () => disintegrate() //should be a method from the parrent to delete the object from the world

    this.jump = this.jump.bind(this)
    this.moveLeft = this.moveLeft.bind(this)
    this.moveRight = this.moveRight.bind(this)
  }

  moveLeft(){
    this.xVelocity -= -4;
  }
  moveRight(){
    this.xVelocity += -4;//default 1.5
  }
  jump(){
    if (!this.jumping){
      this.yVelocity -= 50
      this.jumping = true
    }
  }
  attack(damage=20){//the attack will be mainly handled by the physics engine when it will detect a colision between 2 creatures
    this.attack=true
  }
  takeDamage(damage=20){
    if(this.damageKd == 0){
      this.health -= damage
      this.damageKd = 10 //no damaga for 10 frames
    }
  }
  stop(){
    this.xVelocity = 0
  }
  update(){
    if(this.damageKd != 0){
      this.damageKd -=1 
    }
    if(this.health <= 0){
      this.stop()
      this.disintegrate()
    }
    this.x += this.xVelocity
    this.y += this.yVelocity
  }
}

export class Player extends Creature {
  constructor(x,y){
    super(x,y)
    this.update = this.update.bind(this)
  }
  update(){
    super.update()
  }
}

export class Enemy extends Creature{
  constructor(type,x,y,bariers,disintegrate){
    super(x,y,disintegrate)
    this.type = type
//    this.movesRight = movement.movesRight
    this.brain = this.brain.bind(this)
    this.bariers = bariers
  }
  moveLeft(){
    this.xVelocity += 2
  }
  moveRight(){
    this.xVelocity -= 2
  }
  brain(){
    if(this.x/16 == this.bariers[1]){
      this.stop()
      this.moveRight()
      return;
    }else if(this.x/16 == this.bariers[0]){
      this.stop()
      this.moveLeft()
      return;
    }
//    console.log(this.x)
 }
  update(){
//    console.log(this)
    this.brain()
    super.update()
  }
}

export class Coin{
  constructor(x,y,disintegrate,scoreIncrease){
    this.x = x
    this.y = y
    this.animations = {} 
    this.deathKd=0
    this.scoreIncrease = () => scoreIncrease()
    this.disintegrate = () => disintegrate()
  }

}