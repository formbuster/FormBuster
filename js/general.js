function w3_toggle () {
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

function check () {
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

// Get submission date from a Firebase "doc", in the format: MM/DD/YYYY
function getSubmDate (doc) {
    return getFormattedDate(getDateFromTimestamp(doc.id.toString().split('_')[1]));
}

// Get exact submission date and time from a Firebase "doc", in the format: MM/DD/YYYY at HH:MM:SS
function getExactSubmDate (doc) {
    return getExactDateAndTime(getDateFromTimestamp(doc.id.toString().split('_')[1]));
}

// Get the name of the form from a Firebase "doc"
function getFormName (doc) {
    return doc.id.toString().split('_')[0];
}

// Get a Promise containing the due date given the name of the form [actual due date will be computed later]
function getFormDueDate (formName) {
    return pawsDB.collection("formDeadlines").doc(formName).get().then(function(doc) {
        if (doc.exists) {
            const docData = doc.data();
            return docData.deadline.toDate();
        } else {
            // doc.data() will be undefined in this case
            console.log("No such document!");
        }
    }).catch(function(error) {
        console.log("Error getting document:", error);
    });
}

// Generate a Date object from a timestamp of the format: MMDDYYYYHHMMSS
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

// Get an exact date and time String representation of the Date object given
function getExactDateAndTime (date) {
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const year = date.getFullYear().toString();

    const hour = date.getHours();
    const min = date.getMinutes();
    const second = date.getSeconds();

    const formattedSubmDate = month + "/" + day + "/" + year + " at " + ("00" + hour).substr(-2,2) + ":"
        + ("00" + min).substr(-2,2) + ":" + ("00" + second).substr(-2,2);

    return formattedSubmDate;
}

// Get a formatted date String representation of a Date object, to show in the forms
function getFormattedDate (date) {
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const year = date.getFullYear().toString().substr(-2);

    const fullDate = month + "/" + day + "/" + year;
    return fullDate;
}

/* NOT BEING USED CURRENTLY, BUT MIGHT BE HELPFUL IN THE FUTURE */
function capitalizeStrings (str) {
    const strArray = str.split(" ");

    let newStr = "";
    for (let i = 0; i < strArray.length; i++) {
        let temp = strArray[i].toLowerCase();
        newStr += temp.charAt(0).toUpperCase() + temp.substring(1, temp.length);

        if (i < strArray.length - 1) {
            newStr += " ";
        }
    }

    return newStr;
}
