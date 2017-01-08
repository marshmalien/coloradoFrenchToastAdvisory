var map;
function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    zoom: 8,
    center: new google.maps.LatLng(39.63, -106.36),
    mapTypeId: 'terrain',
    radius: 10
  });
}

var cities = {
  Vail: [39.63, -106.36],
  Boulder: [40.02, -105.25],
  Denver: [39.76, -104.88],
  Aspen: [39.19, -106.83],
  Aurora: [39.7294, -104.8319],
  Avon: [39.6331, -106.5222],
  Durango: [37.15, -107.75],
  Fraser: [39.57, -105.50],
}

for (var [city, coords] of Object.entries(cities)) {
  var xhr = new XMLHttpRequest();
  xhr.open('GET', 'http://api.wunderground.com/api/c3a8e8342446539e/forecast/q/CO/'+ city +'.json', true);
  xhr.onload = heatCity.bind(null, xhr, city, coords);
  xhr.send();
};

function heatCity(xhr, city, coords) {
  var snowAmount = JSON.parse(xhr.response).forecast.simpleforecast.forecastday[0].snow_allday.cm;
  var heatmapData = [];
  if (snowAmount > 0) {
    console.log(city, snowAmount);
    var latLng = new google.maps.LatLng(coords[0], coords[1]);
    var marker = new google.maps.Marker({
      position: latLng,
      icon: 'bread.png',
      map: map
    });
    var weightedLoc = {
      location: latLng,
      weight: Math.pow(5, snowAmount)
    }
    heatmapData.push(weightedLoc);
  }
  var heatmap = new google.maps.visualization.HeatmapLayer({
    data: heatmapData,
    dissipating: false,
    map: map
  });
}

var COUNT = 400;
var masthead = document.querySelector('body');
var canvas = document.createElement('canvas');
var ctx = canvas.getContext('2d');
var width = masthead.clientWidth;
var height = masthead.clientHeight;
var i = 0;
var active = false;

function onResize() {
  width = masthead.clientWidth;
  height = masthead.clientHeight;
  canvas.width = width;
  canvas.height = height;
  ctx.fillStyle = '#FFF';

  var wasActive = active;
  active = width > 600;

  if (!wasActive && active)
    requestAnimFrame(update);
}

var Snowflake = function () {
  this.x = 0;
  this.y = 0;
  this.vy = 0;
  this.vx = 0;
  this.r = 0;

  this.reset();
}

Snowflake.prototype.reset = function() {
  this.x = Math.random() * width;
  this.y = Math.random() * -height;
  this.vy = 1 + Math.random() * 3;
  this.vx = 0.5 - Math.random();
  this.r = 1 + Math.random() * 2;
  this.o = 0.5 + Math.random() * 0.5;
}

canvas.style.position = 'absolute';
canvas.style.left = canvas.style.top = '0';

var snowflakes = [], snowflake;
for (i = 0; i < COUNT; i++) {
  snowflake = new Snowflake();
  snowflake.reset();
  snowflakes.push(snowflake);
}

function update() {

  ctx.clearRect(0, 0, width, height);

  if (!active)
    return;

  for (i = 0; i < COUNT; i++) {
    snowflake = snowflakes[i];
    snowflake.y += snowflake.vy;
    snowflake.x += snowflake.vx;

    ctx.globalAlpha = snowflake.o;
    ctx.beginPath();
    ctx.arc(snowflake.x, snowflake.y, snowflake.r, 0, Math.PI * 2, false);
    ctx.closePath();
    ctx.fill();

    if (snowflake.y > height) {
      snowflake.reset();
    }
  }

  requestAnimFrame(update);
}

// shim layer with setTimeout fallback
window.requestAnimFrame = (function(){
  return  window.requestAnimationFrame       ||
          window.webkitRequestAnimationFrame ||
          window.mozRequestAnimationFrame    ||
          function( callback ){
            window.setTimeout(callback, 1000 / 60);
          };
})();

onResize();
window.addEventListener('resize', onResize, false);

masthead.appendChild(canvas);
