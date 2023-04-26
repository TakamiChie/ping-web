window.addEventListener('DOMContentLoaded', () => {
  Array.from(document.getElementsByClassName("savecontrols")).forEach((e) => {
    let v = localStorage.getItem(e.id);
    switch (e.tagName) {
      case "INPUT":
        switch(e.type){
          case "checkbox":
            e.checked = v;
            break;
          default:
            e.value = v;
            break;
        };
        break;
      case "SELECT":
        e.value = v;
        break;
    }
    e.addEventListener("input", (el) => {
      let v;
      switch (el.target.tagName) {
        case "INPUT":
          v = el.target.type == "checkbox" ? el.target.checked : el.target.value;
          break;
        case "SELECT":
          v = el.target.value;
          break;
      }
      localStorage.setItem(el.target.id, v);
    });
  });
});