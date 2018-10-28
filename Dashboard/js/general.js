function w3_toggle() {
  var toggle = document.getElementById("mySidebar");
  if (toggle.style.display === "none") {
    document.getElementById("dashboard-contents").style.marginLeft = "15%";
    document.getElementById("mySidebar").style.width = "15%";
    document.getElementById("mySidebar").style.display = "block";
  } else {
    document.getElementById("dashboard-contents").style.marginLeft = "0%";
    document.getElementById("mySidebar").style.display = "none";
    document.getElementById("openNav").style.display = "inline-block";
  }
}

function check() {
    console.log(window.innerWidth + "px");
    if (window.innerWidth <= 933) {
        document.getElementById("dashboard-contents").style.marginLeft = "0%";
        document.getElementById("mySidebar").style.display = "none";
        document.getElementById("openNav").style.display = "inline-block";

        if (window.innerWidth <= 759) {

        }
    } else {
        document.getElementById("dashboard-contents").style.marginLeft = "15%";
        document.getElementById("mySidebar").style.width = "15%";
        document.getElementById("mySidebar").style.display = "block";
        document.getElementById("openNav").style.display = "none";
    }
}

// Due date will be computed from the formName
function getFormDueDate (formName) {
    return pawsDB.collection("formDeadlines").doc(formName).get().then(function(doc) {
        if (doc.exists) {
            const docData = doc.data();
            return getFormattedDate(docData.deadline.toDate());
        } else {
            // doc.data() will be undefined in this case
            console.log("No such document!");
        }
    }).catch(function(error) {
        console.log("Error getting document:", error);
    });
}

function getDateFromTimestamp (timestamp) {
    const month = timestamp.substring(0, 2);
    const day = timestamp.substring(2, 4);
    const year = timestamp.substring(4, 8);
    const hour = timestamp.substring(8, 10);
    const minute = timestamp.substring(10, 12);
    const second = timestamp.substring(12, 14);

    const date = new Date (year, month - 1, day, hour, minute, second, 0);
    return date;
}

function getFormattedDate (date) {
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const year = date.getFullYear().toString().substr(-2);

    const fullDate = month + "/" + day + "/" + year;
    return fullDate;
}

