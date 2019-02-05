function loadPage () {
    // Load "general_dashboard.html" and the rest of the page
    $('#generalDashboard').load("general_dashboard.html", function () {
        // Remove elements that don't apply for a Student
        document.getElementById("studentsBtn").remove();
        document.getElementById("formsManagementBtn").remove();

        // Attach the functions to each button
        document.getElementById("dashboardBtn").addEventListener("click", gotoDashboard);
        document.getElementById("draftsBtn").addEventListener("click", gotoDrafts);
        document.getElementById("formsBtn").addEventListener("click", gotoForms);
        document.getElementById("historyBtn").addEventListener("click", gotoHistory);

        // Load dashboard by default
        gotoDashboard();
    });
}

function gotoDashboard () {
    // Highlight only the dashboard button, because it is selected
    document.getElementById("dashboardBtn").className = btnHighlighted;
    document.getElementById("draftsBtn").className = btnNotHighlighted;
    document.getElementById("formsBtn").className = btnNotHighlighted;
    document.getElementById("historyBtn").className = btnNotHighlighted;

    // Clear "inProgressFormsList" and hide other pages
    document.getElementById("inProgressFormsList").innerHTML = '';
    document.getElementById("draftsPage").style.display = "none";
    document.getElementById("formsPage").style.display = "none";
    document.getElementById("historyPage").style.display = "none";

    // Update the page's title
    document.getElementById("pageTitle").innerHTML = "Dashboard";

    // Populate inProgress forms to "inProgressFormsList"
    const studentID = getUserName();
    getStudentForms("dashboardPage", "inProgressFormsList", studentID, "inProgressForms", displayFormReadMode);

    // Unhide "dashboardPage" and get the notifications
    document.getElementById("dashboardPage").style.display = "block";
    getNotifications();
}

function gotoDrafts () {
    // Highlight only the drafts button, because it is selected
    document.getElementById("dashboardBtn").className = btnNotHighlighted;
    document.getElementById("draftsBtn").className = btnHighlighted;
    document.getElementById("formsBtn").className = btnNotHighlighted;
    document.getElementById("historyBtn").className = btnNotHighlighted;

    // Clear "draftsList" and hide other pages
    document.getElementById("draftsList").innerHTML = '';
    document.getElementById("dashboardPage").style.display = "none";
    document.getElementById("formsPage").style.display = "none";
    document.getElementById("historyPage").style.display = "none";

    // Update the page's title
    document.getElementById("pageTitle").innerHTML = "Drafts";

    /* Todo: Populate the drafts of this student into "draftsList" right below this */
    const studentID = getUserName();
    getStudentForms("draftsPage", "draftsList", studentID, "drafts", displayFormReadMode);

    // Unhide "draftsPage" and get the notifications
    document.getElementById("draftsPage").style.display = "block";
    getNotifications();
}

function gotoForms () {
    // Highlight only the forms button, because it is selected
    document.getElementById("dashboardBtn").className = btnNotHighlighted;
    document.getElementById("draftsBtn").className = btnNotHighlighted;
    document.getElementById("formsBtn").className = btnHighlighted;
    document.getElementById("historyBtn").className = btnNotHighlighted;

    // Clear "formsList" and hide other pages
    document.getElementById("dashboardPage").style.display = "none";
    document.getElementById("draftsPage").style.display = "none";
    document.getElementById("formsList").innerHTML = '';
    document.getElementById("historyPage").style.display = "none";

    // Update the page's title
    document.getElementById("pageTitle").innerHTML = "Forms";

    /* Todo: Populate the forms list into "formsList" right below this */

    // Unhide "formsPage" and get the notifications
    document.getElementById("formsPage").style.display = "block";
    getNotifications();
}

function gotoHistory () {
    // Highlight only the history button, because it is selected
    document.getElementById("dashboardBtn").className = btnNotHighlighted;
    document.getElementById("draftsBtn").className = btnNotHighlighted;
    document.getElementById("formsBtn").className = btnNotHighlighted;
    document.getElementById("historyBtn").className = btnHighlighted;

    // Clear "formsHistoryList" and hide other pages
    document.getElementById("dashboardPage").style.display = "none";
    document.getElementById("draftsPage").style.display = "none";
    document.getElementById("formsPage").style.display = "none";
    document.getElementById("formsHistoryList").innerHTML = '';

    // Update the page's title
    document.getElementById("pageTitle").innerHTML = "History";

    // Populate completedForms forms to "formsHistoryList"
    const studentID = getUserName();
    getStudentForms("historyPage", "formsHistoryList", studentID, "completedForms", displayFormReadMode);

    // Unhide "historyPage" and get the notifications
    document.getElementById("historyPage").style.display = "block";
    getNotifications();
}

// Get the notifications of the student
/* Todo: make this method dynamic */


function getNotifications() {
    document.getElementById("notificationsList").innerHTML = '';

    formDB.collection("users").doc(getUserName()).collection("notifications").orderBy("timestamp", 'desc').get().then(function(querySnapshot) {
        querySnapshot.forEach(function(notification) {
            const userNotification = notification.data();
            const notificationMessage = userNotification.message;
            const notificationDate = notification.id.toString().split('_')[1];

            $("#notificationsList").append(
                '<div class="w3-container w3-white w3-margin-bottom">\n' +
                '    <span onclick="this.parentElement.style.display=\'none\'" class="w3-button w3-white w3-large w3-right">&times;</span>\n' +
                '    <div id="message">\n' +
                '        <p>' + notificationMessage + '</p>\n' +
                '    </div>\n' +
                '    <div class="time">\n' +
                '        <p>' + moment(notificationDate, "YYYYMMDD hh:mm:ss").fromNow() + '</p>\n' +
                '    </div>\n' +
                '</div>\n');
        });
    }).catch(function(error) {
        console.log("Error getting documents (querySnapshot): ", error);
    });
}

function logOut() {

}

function saveForm() {

}

function retractForm() {

}

function chooseDifferentApprover() {

}

//this is used to generate unique id's for the rows, so we can use the id to get the information from the fields.
let courseUniqueID = 0;

function startRegistrationForm() {
    courseUniqueID = 0; //reset the ids when we restart a form to keep the number low.
    //addCourseRow();
    document.getElementById('id01').style.display='block';
}

class DesiredCourse {
    constructor(crn, prefix, course_no, sec, course_title, crs, audit) {
        this.crn = crn;
        this.prefix = prefix;
        this.course_no = course_no;
        this.sec = sec;
        this.course_title = course_title;
        this.crs = crs;
        this.audit = audit;
    }
}


function getAdvisor(studentUsername) {
    return "eshelton";
}