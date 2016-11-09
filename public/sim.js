/**
 * Created by frederickmacgregor on 05/11/2016.
 */
// module aliases
var Engine = Matter.Engine,
    Render = Matter.Render,
    World = Matter.World,
    Bodies = Matter.Bodies,
    Vector = Matter.Vector;

// create an engine
var engine = Engine.create();
engine.world.gravity.y = 0;
// create a renderer
var render = Render.create({
    element: document.body,
    engine: engine
});

// create two boxes and a ground
var boxA = Bodies.rectangle(400, 200, 200, 15, 0.5);
var boxB = Bodies.rectangle(450, 50, 80, 80);
boxB.collisionFilter.group = -1;
boxA.collisionFilter.group = -1;
Matter.Body.setVelocity(boxB, {x:0.1, y:5});
var ground = Bodies.rectangle(400, 610, 810, 60, { isStatic: true });

// add all of the bodies to the world
World.add(engine.world, [boxA, boxB, ground]);

Matter.Body.setPosition(boxB, {x:400, y:300});
// run the engine
Engine.run(engine);

// run the renderer
Render.run(render);