let chart;
let log = [];
let events = [];
let alertSound = new Audio("/res/alert.wav");
let enabledAlert = false;
window.addEventListener('DOMContentLoaded', () => {
  var options = {
    element: 'line-chart',
    data: log,
    xkey: 'tick', 
    ykeys: ['time'],
    labels: ['Response'],
    resize: true,
    smooth: true,
    events: events,
    eventLineColors: ["red"],
    eventLineWidth: "5px",
    goalLineColors: ["green", "red"],
    goalStrokeWidth: "3px",
    hoverCallback: function(index, options, content) {
      let data = options.data[index];
      let message = `${dayjs(data.tick).format("HH:mm:ss")}<br>`;
      message += data.message ? "Ping Error" : `duration:${data.time}ms`;
      return message;
    },
    xLabelFormat: function(x) {
      return dayjs(x).format("m:ss");
    }
  };
  document.getElementById("threshold").value = localStorage.getItem("threshold") ? localStorage.getItem("threshold") : "-1";
  chart = new Morris.Line(options);
  document.getElementById("active").addEventListener("input", (e) => {
    if(e.target.checked) ping();
  });
  document.getElementById("threshold").addEventListener("change", (e) => {
    localStorage.setItem(e.target.id, e.target.value);
    updateGoalValue();
  });
  setTimeout(ping, 1000);
});

async function ping() {
  let label;
  if(document.getElementById("active").checked){
    let r = await getPingTime();
    let record;
    if(!r.error){
      record = {
        tick: new Date().getTime(),
        time: r.duration
      };
      if(isWarning(record)){
        warning(record);
      }
      label = `ping ${r.length}byte responce ${r.duration}ms(${r.speed}Kbps)`
    }else{
      record = {
        tick: new Date().getTime(),
        time: null,
        message: r.error
      };
      warning(record);
      label = `error!:${r.error}`;
    }
    log.push(record);
    while(log.length > 100){
      if(log.shift().tick == events[0]) events.shift();
    }
    chart.setData(log);
    const [min, max, avg] = getMinMax();
    updateGoalValue();
    document.getElementById("time").textContent = `${label}(${max}ms～${min}ms/avg:${avg.toFixed(2)}ms)`; 
    setTimeout(ping, 1000);
  }
}

async function getPingTime() {
  const start = new Date();
  let result;
  try {
    const res = await fetch(`${location.href}/res/data.txt`, {cache: "no-store"});
    const end = new Date();
    const duration = (end - start);
    let length = parseInt(res.headers.get("Content-Length"));
    for (const [name, value] of res.headers.entries()) {
      length += name.length + value.length;
    }
    result = {
      duration: duration,
      length: length,
      speed: (length * 8 / (duration / 1000) / 1024).toFixed(2)
    };
  } catch (error) {
    console.log(error);
    result = {error:error};
  }
  return result;
}

function updateGoalValue() {
  const [_,__,avg] = getMinMax();
  const g = [avg];
  const n = document.getElementById("threshold").value;
  if(n != -1) g.push(n);
  chart.options.goals = g;
}

function getMinMax(){
  const times = log.map((v) => v.time).filter((v) => v != null);
  const max = Math.min(...times);
  const min = Math.max(...times);
  const avg = times.reduce((a,b) => {return a+b},0) / times.length;
  return [min, max, avg];
}

function isWarning(record) {
  let v = parseInt(document.getElementById("threshold").value);
  return v != -1 && v < record.time;
}

function warning(record) {
  events.push(record.tick);
  if (document.getElementById("alert").checked) alertSound.play();
}