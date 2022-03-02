
const canvas = document.querySelector('#bg');
const ctx = canvas.getContext('2d');

const width = window.innerWidth;
const height = window.innerHeight;

const btn = document.querySelector('.btn-twitch');

canvas.width = width;
canvas.height = height;

ctx.fillStyle = '#efefef';
ctx.strokeStyle = '#9146ff02'
ctx.lineWidth = 3;
ctx.fillRect(0, 0, width, height);


const particles = [];
const max = 2000;
const speed = 30;

for (let i = 0; i < max; i++) {
  particles.push({
    x: Math.random() * (width),
    y: Math.random() * (height),
    l: Math.random() * speed,
    xs: -27 + Math.random() * 5 + 25,
    ys: Math.random() * 1 + speed
  })
}

const clear = () => {
  ctx.clearRect(0, 0, width, height);
}

const move = () => {
  for(let i = 0; i < particles.length; i++) {
    let part = particles[i];
     part.x += part.xs;
     part.y += part.ys;
    if(part.x > width || part.y > height) {
      part.x = Math.random() * width;
      part.y = -1;
    }
  }
}
const draw = () => {
  clear();
  for (let i = 0; i < particles.length; i++) {
    const part = particles[i];
    ctx.beginPath();
    ctx.moveTo(part.x, part.y);
    ctx.lineTo(part.x + part.l * part.xs, part.y + part.l * part.ys);
    ctx.stroke();
  }
  move();
  window.requestAnimationFrame(draw)
}
draw();
