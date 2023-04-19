let chart;
let log = [];
window.addEventListener('DOMContentLoaded', () => {
  var options = {
    element: 'line-chart',
    data: log,
    xkey: 'tick', 
    ykeys: ['time'],
    labels: ['Response'],
    resize: true,
    smooth: true,
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
  chart = new Morris.Line(options);
  document.getElementById("active").addEventListener("input", (e) => {
    if(e.target.checked) ping();
  });
  setTimeout(ping, 1000);
});

async function ping() {
  if(document.getElementById("active").checked){
    let r = await getPingTime();
    if(!r.error){
      log.push({
        tick: new Date().getTime(),
        time: r.duration
      });
      document.getElementById("time").textContent = `ping ${r.length}byte responce ${r.duration}ms(${r.speed})Kbps`
    }else{
      log.push({
        tick: new Date().getTime(),
        time: null,
        message: r.error
      });
      document.getElementById("time").textContent = `error!:${r.error}`
    }
    if(log.length > 100) log = log.slice(log.length - 100);
    chart.setData(log);
    setTimeout(ping, 1000);
  }
}

async function getPingTime() {
  const start = new Date();
  let result;
  try {
    const res = await fetch(`${location.href}/res/data.txt`);
    const end = new Date();
    const duration = (end - start);
    const length = res.headers.get("Content-Length");
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
