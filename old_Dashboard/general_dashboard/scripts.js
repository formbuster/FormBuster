function w3_toggle() {
  var toggle = document.getElementById("mySidebar");
  if (toggle.style.display === "none") {
    document.getElementById("main-container-dashboard").style.marginLeft = "20%";
    document.getElementById("mySidebar").style.width = "20%";
    document.getElementById("mySidebar").style.display = "block";
  } else {
    document.getElementById("main-container-dashboard").style.marginLeft = "0%";
    document.getElementById("mySidebar").style.display = "none";
    document.getElementById("openNav").style.display = "inline-block";
  }
}

function check() {
    console.log(window.innerWidth + "px");
    if (window.innerWidth <= 933) {
        document.getElementById("main-container-dashboard").style.marginLeft = "0%";
        document.getElementById("mySidebar").style.display = "none";
        document.getElementById("openNav").style.display = "inline-block";

        if (window.innerWidth <= 600) {

        }
    } else {
        document.getElementById("main-container-dashboard").style.marginLeft = "20%";
        document.getElementById("mySidebar").style.width = "20%";
        document.getElementById("mySidebar").style.display = "block";
        document.getElementById("openNav").style.display = "none";
    }


}