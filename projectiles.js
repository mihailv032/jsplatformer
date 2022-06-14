class Projectile {
  constructor(x,y,vector,speed=3){
    this.x = x
    this.y = y 
    this.vector = vector
    this.speed = speed*vector
  }

  update(){
    this.x += speed
  }
}


class FireBall {

}
