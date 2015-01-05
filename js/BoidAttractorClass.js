var BoidFlock = function(targDiv, opt_config){

var _privates = {
    boids : [],
    obsticles : [],
    width : 1000,
    height:1000,
    flockSize : 100,
    startColour:{r:100,g:0,b:255},
    endColour:{r:255,g:0,b:50},
    tweenColours:true
}

    var _config = opt_config || {};

    for(var value in _config){
        //Underscore properties are not to be changed.
        if(String(value).charAt(0) != '_') _privates[value] = _config[value];
    }

    var BoidAttractorClass = function(sketch){

        sketch.setup = function() {
            sketch.createCanvas(_privates.width, _privates.height);

            //BoidFlock._onConfigSet.call(this)

            var _boidConfig =     {startColour:_privates.startColour,
            endColour:_privates.endColour,
            tweenColours:_privates.endColour}

            // Add an initial set of boids into the system
            for (var i = 0; i < _privates.flockSize; i++) {
                _privates.boids[i] = new Boid(sketch.random(sketch.width), sketch.random(sketch.height), sketch, _boidConfig);
            }
//            var _obsticle   = new Obsticle(200, 500,_privates.boids,sketch, {repulsion:.3} );
//            var _obsticle2  = new Obsticle(400, 400,_privates.boids, sketch);
//            _obsticle2.setRepulsion(.003);
//            var _obsticle3  = new Obsticle(450, 450,_privates.boids, sketch);
//            _obsticle3.setRepulsion(-.003);
//            _privates.obsticles       = [_obsticle, _obsticle2, _obsticle3];
        }

        sketch.draw = function() {
            sketch.background(51, 3);

            for(var i=0; i<_privates.obsticles.length; i++){
                _privates.obsticles[i].render();
            }

            // Run all the boids
            for (var i = 0; i < _privates.boids.length; i++) {
                _privates.boids[i].run(_privates.boids);
            }
        }
        sketch.addAttractor = function(x,y,opt_config){
            var config = opt_config || {};
            var _obsticle  = new Obsticle(x, y,_privates.boids, sketch, config);
            _privates.obsticles.push(_obsticle);
        }
        sketch.setWidth = function(value){
            _privates.width = value;
        }
        sketch.getWidth = function(){
            return _privates.width
        }

    }
    return new p5(BoidAttractorClass, targDiv);
}

//Static classes
BoidFlock._onConfigSet = function(conig){

    for(var value in arguments[0]){
        //Underscore properties are not to be changed.
        if(String(value).charAt(0) != '_') this[value] = arguments[0][value];
    }
}


// An obsticle to be avoided or to act as anb attractor

function Obsticle(x,y,flock, sketch, opt_config){
    this.sketch = sketch
    this._flock = flock;
    this.rad = 16;
    this.xpos = x;
    this.ypos = y;
    this.excusionZone = 100;
    this.repulsion = .0140;
    this.position = this.sketch.createVector(this.xpos, this.ypos)
    this.colour = {r:0,g:100, b:100};

    if(opt_config) BoidFlock._onConfigSet.call(this, opt_config);
}

Obsticle.prototype = {
    update : function(){
        for( var i=0; i<this._flock.length; i++){
            var f = this._flock[i];
            var vec = this.sketch.createVector(f.position.x, f.position.y);
            var exclusion = this.sketch.createVector(this.position.x,this.position.y);
            vec.sub(exclusion);
            if(vec.mag() < this.excusionZone ){
                this.sketch.stroke(255, 0,0);
                //line(this.position.x, this.position.y, f.position.x, f.position.y);
                //stroke(100, 255,0)
                //line(this.position.x, this.position.y, exclusion.x, exclusion.y);
                vec.mult(this.repulsion)
                this._flock[i].applyForce(vec);
            }
        }
    },
    setRepulsion : function(value){
        this.repulsion = value;
    },
    getRepulsion : function(){
        return this.repulsion
    },
    render : function(){
        this.update();
        this.sketch.fill(this.colour.r, this.colour.g, this.colour.b);
        this.sketch.noStroke();
        this.sketch.ellipse(this.xpos, this.ypos, this.rad, this.rad);
    }

}



// Boid class
// Methods for Separation, Cohesion, Alignment added
function Boid(x, y, sketch, opt_config) {
    this.sketch = sketch
    this._bounceBorders = true;
    this.acceleration = this.sketch.createVector(0, 0);
    this.velocity = p5.Vector.random2D();
    this.position = this.sketch.createVector(x, y);
    this.r = 3.0;
    this.maxspeed = 3;    // Maximum speed
    this.maxforce = 0.15; // Maximum steering force
    if(opt_config) BoidFlock._onConfigSet.call(this, opt_config);


}

Boid.prototype.run = function(boids) {
    this.flock(boids);
    this.update();
    this.borders();
    this.render();
}

// Forces go into acceleration
Boid.prototype.applyForce = function(force) {
    this.acceleration.add(force);
}

// We accumulate a new acceleration each time based on three rules
Boid.prototype.flock = function(boids) {
    var sep = this.separate(boids); // Separation
    var ali = this.align(boids);    // Alignment
    var coh = this.cohesion(boids); // Cohesion
    // Arbitrarily weight these forces
    sep.mult(2.5);
    ali.mult(1.0);
    coh.mult(1.0);
    // Add the force vectors to acceleration
    this.applyForce(sep);
    this.applyForce(ali);
    this.applyForce(coh);
}

// Method to update location
Boid.prototype.update = function() {
    // Update velocity
    this.velocity.add(this.acceleration);
    // Limit speed
    this.velocity.limit(this.maxspeed);
    this.position.add(this.velocity);
    // Reset accelertion to 0 each cycle
    this.acceleration.mult(0);
}

// A method that calculates and applies a steering force towards a target
// STEER = DESIRED MINUS VELOCITY
Boid.prototype.seek = function(target) {
    var desired = p5.Vector.sub(target, this.position); // A vector pointing from the location to the target
    // Normalize desired and scale to maximum speed
    desired.normalize();
    desired.mult(this.maxspeed);
    // Steering = Desired minus Velocity
    var steer = p5.Vector.sub(desired, this.velocity);
    steer.limit(this.maxforce); // Limit to maximum steering force
    return steer;
}

// Draw boid as a circle
Boid.prototype.render = function() {
    // Draw a triangle rotated in the direction of velocity
    var theta = this.velocity.heading() + this.sketch.radians(90);
    this.sketch.fill(0,255,255);
    this.sketch.stroke(200);
    this.sketch.push();
    this.sketch.translate(this.position.x,this.position.y);
    this.sketch.rotate(theta);
    this.sketch.beginShape();
    this.sketch.vertex(0, -this.r*2);
    this.sketch.vertex(-this.r, this.r*2);
    this.sketch.vertex(this.r, this.r*2);
    this.sketch.endShape(this.sketch.CLOSE);
    this.sketch.ellipse(0,0,3, 20);
    this.sketch.pop();
}

// Wraparound
Boid.prototype.borders = function() {
    if(this._bounceBorders){
        if (this.position.x < -this.r){
            this.position.x = this.r;
            this.velocity.x *= -1
        }
        if (this.position.y < -this.r){
            this.position.y =  this.r;
            this.velocity.y *= -1
        }
        if (this.position.x > this.sketch.width + this.r){
            this.position.x = this.sketch.width-this.r;
            this.velocity.x *= -1
        }
        if (this.position.y > this.sketch.height + this.r) {
            this.position.y = this.sketch.height-this.r;
            this.velocity.y *= -1
        }
    }else{
        if (this.position.x < -this.r) this.position.x = this.sketch.width + this.r;
        if (this.position.y < -this.r) this.position.y = this.sketch.height + this.r;
        if (this.position.x > this.sketch.width + this.r) this.position.x = -this.r;
        if (this.position.y > this.sketch.height + this.r) this.position.y = -this.r;
    }
}

// Separation
// Method checks for nearby boids and steers away
Boid.prototype.separate = function(boids) {
    var desiredseparation = 25.0;
    var steer = this.sketch.createVector(0, 0);
    var count = 0;
    // For every boid in the system, check if it's too close
    for (var i = 0; i < boids.length; i++) {
        var d = p5.Vector.dist(this.position, boids[i].position);
        // If the distance is greater than 0 and less than an arbitrary amount (0 when you are yourself)
        if ((d > 0) && (d < desiredseparation)) {
            // Calculate vector pointing away from neighbor
            var diff = p5.Vector.sub(this.position, boids[i].position);
            diff.normalize();
            diff.div(d); // Weight by distance
            steer.add(diff);
            count++; // Keep track of how many
        }
    }
    // Average -- divide by how many
    if (count > 0) {
        steer.div(count);
    }

    // As long as the vector is greater than 0
    if (steer.mag() > 0) {
        // Implement Reynolds: Steering = Desired - Velocity
        steer.normalize();
        steer.mult(this.maxspeed);
        steer.sub(this.velocity);
        steer.limit(this.maxforce);
    }
    return steer;
}

// Alignment
// For every nearby boid in the system, calculate the average velocity
Boid.prototype.align = function(boids) {
    var neighbordist = 50;
    var sum = this.sketch.createVector(0, 0);
    var count = 0;
    for (var i = 0; i < boids.length; i++) {
        var d = p5.Vector.dist(this.position, boids[i].position);
        if ((d > 0) && (d < neighbordist)) {
            sum.add(boids[i].velocity);
            count++;
        }
    }
    if (count > 0) {
        sum.div(count);
        sum.normalize();
        sum.mult(this.maxspeed);
        var steer = p5.Vector.sub(sum, this.velocity);
        steer.limit(this.maxforce);
        return steer;
    } else {
        return this.sketch.createVector(0, 0);
    }
}

// Cohesion
// For the average location (i.e. center) of all nearby boids, calculate steering vector towards that location
Boid.prototype.cohesion = function(boids) {
    var neighbordist = 50;
    var sum = this.sketch.createVector(0, 0); // Start with empty vector to accumulate all locations
    var count = 0;
    for (var i = 0; i < boids.length; i++) {
        var d = p5.Vector.dist(this.position, boids[i].position);
        if ((d > 0) && (d < neighbordist)) {
            sum.add(boids[i].position); // Add location
            count++;
        }
    }
    if (count > 0) {
        sum.div(count);
        return this.seek(sum); // Steer towards the location
    } else {
        return this.sketch.createVector(0, 0);
    }
}