export default class Cfg {
  constructor(player){
    this.player = player
    this.keyPressed=false
    this.bindings = {
      "87": new Button(this.player.moveLeft),
      "83": new Button(this.player.moveRight),
      "32": new Button(this.player.jump),
      "65": new Button(this.player.moveRight),
      "68": new Button(this.player.moveLeft),
      "13": new Button(this.player.attack)
    }
    this.keys = Object.keys(this.bindings)
    this.handlOnKeyDown = this.handlOnKeyDown.bind(this)

    this.handlOnKeyDown = this.handlOnKeyDown.bind(this)
    this.handlOnKeyUp = this.handlOnKeyUp.bind(this)
  }

  handlOnKeyUp(event){
    if (event.keyCode == 32) { this.bindings[32].pressed=false;return null;}
    if( this.keys.find( (key) => key == event.keyCode ) ){
      this.bindings[event.keyCode].pressed = false 
      this.player.stop()
    }
  }
  handlOnKeyDown(event){
    if( this.keys.find( (key) => key == event.keyCode) && !this.bindings[event.keyCode].pressed ){
      this.bindings[event.keyCode].pressed = true
      this.keyPressed = true
//      this.bindings["87"]()
//      alert(this.bindings[event.keyCode].act)
      this.bindings[event.keyCode].action()
    }
//    alert(this.player.xVelocity)
  }
  
}

class Button{
  constructor(action){
    this.action = () => action()
    this.pressed = false 
  }
}