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
let currentLevel = 1

const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');

const popup = document.getElementById("popup")

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
retryBtn.addEventListener("click", click => { popup.style.display="none";restartLevel(); })
window.addEventListener("keydown", cfg.handlOnKeyDown)
window.addEventListener('keyup',cfg.handlOnKeyUp)
window.addEventListener('resize', () => screen.onResize(document.documentElement.clientWidth, document.documentElement.clientHeight, world.height / world.width))

let timer;

function startLevel(){
  timer = setInterval(() => {
    world.timer--
  }, 1000);
//  currentLevel == 3 ? alert("endGame") : currentLevel++

  world.populateWorld()
  screen.setAnimations()
  physicsEngine.fillCollisionTable()
  renderEngine.start()
}

function retry(finish=false){
  setTimeout( () => renderEngine.stop(), 0) //yes
  popup.style.display = "flex";
  document.getElementById("title").innerHTML = finish ? "Finish" : "Game Over"
  document.getElementById("score").innerHTML = `Score: ${world.score}`
  document.getElementById("time").innerHTML = `Time Left: ${world.timer}s`
  currentLevel = 1
  window.level = level[currentLevel]
}
function restartLevel(){
  renderEngine.stop()
  world.populateWorld()
 
  world.player.health = 1
  world.score = 0
  world.timer=window.level.timer

  screen.setAnimations()
  renderEngine.start()
}

function nextLevel(){
  renderEngine.stop()
  currentLevel += 1

  setTimeout( () => renderEngine.stop(),0)
  if (currentLevel == 3){
    clearInterval(timer)
    retry(true)
    return;
  }else { 
    currentLevel += 1
  }
  world.clearWorld()
  physicsEngine.clearCollisionTable()
  window.level = level[currentLevel]
  world.timer = window.level.timer
//  world.player.health = 1 //

  //start lvl will set a new interval so we need to clear the old one to prevent mu
  clearInterval(timer)
  startLevel()
}
startLevel()



