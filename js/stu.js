function loadPage () {
    // Load "general_dashboard.html" and the rest of the page
    $('#generalDashboard').load("general_dashboard.html", function () {
        // Remove elements that don't apply for a Student
        document.getElementById("studentsBtn").remove();
        document.getElementById("formsManagementBtn").remove();

        document.getElementById("display-name").classList.add('w3-theme-red');
        document.getElementById("generalTopBar").classList.add('w3-theme-red');
        document.getElementById("footer").classList.add('w3-theme-red');

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

    $('#formsList').load('registration_forms.html', function() {
        //add event listeners for each form.
        document.getElementById("registration-form-button").addEventListener("click", function() {
            startRegistrationForm("student");
        });
    });

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
function getNotifications () {
    const notificationsList = document.getElementById("notificationsList");
    const studentID = getUserName();

    // Clear previous notifications
    notificationsList.innerHTML = '';

    let wholeHTML = '';
    let forEachIteration = 0;
    formDB.collection("users").doc(studentID).collection("notifications").orderBy("timestamp", 'desc').get().then(function(querySnapshot) {
        querySnapshot.forEach(function(notification) {
            const userNotification = notification.data();
            const notificationMessage = userNotification.message;
            const notificationDate = notification.id.toString().split('_')[1];

            wholeHTML +=
                `<div class="w3-container w3-white w3-margin-bottom" data-studentid="${studentID}"
                    data-notificationid="${notification.id}" style="padding-right: 0">\n` +
                '    <span onclick="deleteNotification(event)" class="notification_button w3-large w3-right">&times;</span>\n' +
                '    <div id="message">\n' +
                '        <p>' + notificationMessage + '</p>\n' +
                '    </div>\n' +
                '    <div class="time">\n' +
                '        <p>' + moment(notificationDate, "MMDDYYYYHHmmss").fromNow() + '</p>\n' +
                '    </div>\n' +
                '</div>\n';

            // Insert all the notifications into "notificationsList"
            if (forEachIteration == querySnapshot.size - 1) {
                notificationsList.innerHTML = wholeHTML;
            }

            forEachIteration++;
        });
    }).catch(function(error) {
        console.log("Error getting documents (querySnapshot): ", error);
    });
}

function deleteNotification (event) {
    const studentID = event.currentTarget.parentElement.dataset.studentid;
    const notificationID = event.currentTarget.parentElement.dataset.notificationid;

    formDB.collection("users").doc(studentID).collection("notifications").doc(notificationID).delete().then(function() {
        //console.log("Document successfully deleted!");
    }).catch(function(error) {
        console.error("Error removing document: ", error);
    });

    // Remove element from the page
    event.currentTarget.parentElement.remove();

    displayConfirmationMessage("mainContent", "You deleted your notification.");
}

function logOut() {

}

function saveForm() {

}

function retractForm() {

}

function chooseDifferentApprover() {

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
