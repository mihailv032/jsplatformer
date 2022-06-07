import {RenderEngine, PhysicsEngine} from "./engines.js"
import World from "./world.js"
import Screen from "./screen.js"
import Cfg from './inputs.js'

async function getJson(url){
  let req = await fetch(url)
  if(req.ok){
    let json = await req.json()
    return json
  }else{
    alert("kuraw no json file nahui")
  }
}
const level = await getJson("./level.json")
let currentLevel = 2

const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');


/*
window.level will be used as global variable across all the modules to get the current level 
so when you change the levels you change it from one place for all of the objects

the value will be changed by the world class in the update method when the player reaches the end of the level
*/
window.level = level[currentLevel]

canvas.width = document.documentElement.clientWidth 
canvas.height = document.documentElement.clientHeight * 0.7


const world = new World(level,retry,nextLevel)
const cfg = new Cfg(world.player)
const screen = new Screen(canvas,world)
const physicsEngine = new PhysicsEngine(world)
const renderEngine = new RenderEngine(30,world.update,screen.update,physicsEngine)

const retryBtn = document.getElementById("retry") 
retryBtn.addEventListener("click", click => { restartLevel();document.getElementById("popup").style.display="none"; })
window.addEventListener("keydown", cfg.handlOnKeyDown)
window.addEventListener('keyup',cfg.handlOnKeyUp)
window.addEventListener('resize', () => screen.onResize(document.documentElement.clientWidth, document.documentElement.clientHeight, world.height / world.width))

function startLevel(){
//  currentLevel == 3 ? alert("endGame") : currentLevel++

  world.populateWorld()
  screen.setAnimations()
  physicsEngine.fillCollisionTable()
  renderEngine.start()
}

function retry(){
  setTimeout( () => renderEngine.stop(), 0) //yes
  document.getElementById("popup").style.display = "flex";
  document.getElementById("score").innerHTML += world.score
//  document.getElementById("time").innerHTML += world.timer
}
function restartLevel(){
  world.populateWorld()
  world.player.health = 1
  screen.setAnimations()
  renderEngine.start()
}

function nextLevel(){
  renderEngine.stop()
  currentLevel += 1
  window.level = level[currentLevel]
  world.player.health = 1 //
  world.collisionTable = {}
  startLevel()
}
startLevel()



