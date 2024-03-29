import { Fish } from "./fish.js";
import { Target, Food } from "./target.js";
import { Ripple } from "./ripple.js";

export class FishPond {
  constructor(window, opts) {
    opts = opts || {};
    console.log(opts);
    this.window = window;
    this.debug = opts.debug ? opts.debug : false;
    this.selector = opts.selector ? opts.selector : "header";
    this.fishCount = opts.fishCount || 10;

    this.var = 0.001;
    this.opacity = 0.8;
    this.ops = this.opacity / 60;
    this.maxFood = 100;
    this.height = parseInt(document.querySelector(this.selector).clientHeight);
    this.width = this.window.innerWidth;
    console.log(this.height, this.width);
    this.vh = this.height / 100;
    this.vw = this.width / 100;
    this.c = 0;
    this.spots = [new Target(0, 0, 0)];
    for (let i = 1; i < 100; i++)
      this.spots.push(
        new Target(0, 0, 0, this.spots[i - 1], { debug: this.debug })
      );
    this.spots[0].nextSpot = this.spots[this.spots.length - 1];

    const initY = this.height / 2;
    const initX = this.width / 2;
    for (let i = 0; i < this.spots.length; i++) {
      this.spots[i].x = initX + Math.random() * initX * 3 * Math.cos(i);
      this.spots[i].y = initY + Math.random() * initY * 3 * Math.sin(i);
    }
    // for(let i = 0;i < Math.floor(this.spots.length) / 2;i++){
    //   this.spots[i].x = initX + ( Math.random() * initX * 2) * Math.cos(i);
    //   this.spots[i].y = initY + ( Math.random() * initY * 2) * Math.sin(i);
    // }
    // for(let i = Math.floor(this.spots.length / 2);i < this.spots.length;i++){
    //   this.spots[i].x = initX + (initX/4 + Math.random() * initX/1.5)*Math.cos(-i);
    //   this.spots[i].y = initY + (initY/3 + Math.random() * initY/2)*Math.sin(-i);
    // }

    this.foods = [];
    this.ripples = [];
    this.fish = [];
    // let fishCount = 1 + this.height * this.width / 70000;

    // for (let i = 0; i < fishCount; i++) {
    //     this.addFish();
    // }
    window.setInterval(this.addRemainingFish.bind(this), 3000);
  }

  addRemainingFish() {
    if (this.fish.length < this.fishCount) {
      this.addFish();
    }
  }
  start(canvas) {
    const ctx = canvas.getContext("2d");

    const startAnimation = () => {
      const h = this.height;
      const w = this.width;
      this.height = parseInt(
        document.querySelector(this.selector).clientHeight
      ); //this.window.innerHeight;
      this.width = this.window.innerWidth;
      canvas.height = this.height; //this.window.innerHeight;
      canvas.width = this.width;
      this.vh = this.height / 100;
      this.vw = this.width / 100;
      if (w !== this.width || h !== this.height) {
        const initY = this.height / 2;
        const initX = this.width / 2;
        for (let i = 0; i < this.spots.length; i++) {
          this.spots[i].x = initX + Math.random() * initX * 3 * Math.cos(i);
          this.spots[i].y = initY + Math.random() * initY * 3 * Math.sin(i);
        }
        // const halfh = this.height / 2;
        // const halfw = this.width / 2;
        // for (let i = 0; i < Math.floor(this.spots.length) / 2; i++) {
        //     this.spots[i].x = halfw + (Math.random() * halfw) * Math.cos(i);
        //     this.spots[i].y = halfh + (Math.random() * halfh) * Math.sin(i);
        // }
        // for (let i = Math.floor(this.spots.length / 2); i < this.spots.length; i++) {
        //     this.spots[i].x = halfw + (halfw / 4 + Math.random() * halfw / 1.5) * Math.cos(-i);
        //     this.spots[i].y = halfh + (halfh / 3 + Math.random() * halfh / 2) * Math.sin(-i);
        // }
      }

      this.render(ctx);

      setTimeout(startAnimation, 1000 / 30);
    };
    startAnimation();
  }

  render(ctx) {
    // fishpond w/o bg color:
    // ctx.fillStyle='#4298B5';
    // ctx.fillRect(0, 0,this.width,this.height);
    this.fish.sort((a, b) => b.mass - a.mass);
    for (let i = 0; i < this.fish.length; i++) this.fish[i].render(ctx);
    for (let i = 0; i < this.ripples.length; i++) this.ripples[i].render(ctx);
    for (let i = 0; i < this.foods.length; i++) this.foods[i].render(ctx);
  }
  click(x, y) {
    let food = new Food(x, y, 3, undefined, { debug: this.debug });
    if (
      this.opacity < 0.2 &&
      x > 0 &&
      y > this.height - this.vh * 4 - this.fontSize * 0.5 &&
      x < this.vh * 4 + this.textWidth &&
      y <
        this.height -
          this.vh * 4 -
          this.fontSize * 0.5 +
          this.fontSize * 0.5 +
          4 * this.vh
    ) {
      this.addFish();
      this.var += 0.001;
    } else {
      if (this.foods.length < this.maxFood) this.foods.push(food);
      else {
        this.foods[0].value = -1;
        this.foods.shift();
        this.foods.push(food);
      }
      for (let i = 0; i < this.fish.length; i++) {
        this.fish[i].foodNotify(food);
      }
    }
  }
  addFish() {
    let hov = Math.random() * 2;
    let x, y, dir;
    if (hov > 1) {
      y = this.height / 2;
      hov = Math.random() * 2;
      if (hov > 1) {
        x = -50;
        dir = 0.0001;
      } else {
        x = 50 + this.width;
        dir = Math.PI;
      }
    } else {
      hov = Math.random() * 2;
      x = this.width / 2;
      if (hov > 1) {
        y = -100;
        dir = Math.PI / 2;
      } else {
        y = this.height + 100;
        dir = (Math.PI / 2) * 3;
      }
    }
    this.fish.push(
      new Fish({
        mass: 35 + Math.sqrt(Math.random() * 10000) + this.var,
        x: x,
        y: y,
        pond: this,
        direction: dir,
        debug: this.debug,
      })
    );
  }
  getClosestFood(x, y) {
    if (this.foods.length < 1) return null;
    let target = this.foods[0];
    for (let i = 1; i < this.foods.length; i++)
      if (this.foods[i].getDistance(x, y) < target.getDistance(x, y))
        target = this.foods[i];
    return target;
  }
  getSpot() {
    return this.spots[Math.floor(this.spots.length * Math.random())];
  }
  bite(x, y, radius, fish) {
    for (let i = 0; i < this.foods.length; i++) {
      if (this.foods[i].getDistance(x, y) < radius + 10) {
        this.foods[i].eaten(fish);
        this.foods.splice(i, 1);
        i--;
      }
    }
    if (fish.target && fish.target.value === 0)
      for (let i = 0; i < this.spots.length; i++)
        if (this.spots[i].getDistance(x, y) < 200) this.spots[i].eaten(fish);
  }
  ripple(x, y, size) {
    this.ripples.push(
      new Ripple(x, y, size, this, this.ripples.length, { debug: this.debug })
    );
  }
}
