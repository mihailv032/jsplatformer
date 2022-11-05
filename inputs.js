export default class Cfg {
  constructor(player){
    this.player = player
    this.nOfKeyPressed = 0;
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
    if (this.keys.indexOf(String(event.keyCode)) === -1) return;
    if (event.keyCode == 32) { this.bindings[32].pressed=false; return null;}
    if(this.nOfKeyPressed === 1){this.player.stop()};
    this.nOfKeyPressed--;
    this.bindings[event.keyCode].pressed = false 
    return;
  }
  handlOnKeyDown(event){
    if (this.keys.indexOf(String(event.keyCode)) === -1) return;
    if(this.bindings[event.keyCode].pressed) return;
    console.log(this.keys.indexOf(String(event.keyCode)) === -1)
    this.nOfKeyPressed++;
    this.player.stop();
    this.bindings[String(event.keyCode)].press();
    return;
  }
}

class Button{
  constructor(action){
    this.action = () => action()
    this.pressed = false 
  }
  press(){
    this.pressed = true
    this.action()
  }
}
