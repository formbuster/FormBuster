function w3_toggle() {
  var toggle = document.getElementById("mySidebar");
  if (toggle.style.display === "none") {
    document.getElementById("main-container-dashboard").style.marginLeft = "15%";
    document.getElementById("mySidebar").style.width = "15%";
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

        if (window.innerWidth <= 759) {

        }
    } else {
        document.getElementById("main-container-dashboard").style.marginLeft = "15%";
        document.getElementById("mySidebar").style.width = "15%";
        document.getElementById("mySidebar").style.display = "block";
        document.getElementById("openNav").style.display = "none";
    }
}



