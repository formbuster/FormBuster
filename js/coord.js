function loadPage () {
    // Load "general_dashboard.html" and the rest of the page
    $('#generalDashboard').load("general_dashboard.html", function () {
        // Remove elements that don't apply for a Student Coordinator
        document.getElementById("draftsBtn").remove();
        document.getElementById("historyBtn").remove();
        document.getElementById("dashboardBtn").remove();
        document.getElementById("formsManagementBtn").remove();
        document.getElementById("notifications").remove();
        document.getElementById("notificationPreferences").remove();

        document.getElementById("display-name").classList.add('w3-theme-orange');
        document.getElementById("generalTopBar").classList.add('w3-theme-orange');
        document.getElementById("footer").classList.add('w3-theme-orange');

        // Attach the functions to each button
        document.getElementById("studentsBtn").addEventListener("click", gotoStudents);
        document.getElementById("formsBtn").addEventListener("click", gotoForms);

        // Load "studentSearchView" only once
        $('#studentSearchView').load('student_list.html');

        //Load forms page once.
        // rely on signed in user credentials instead.
        getFormsPage("coord");

        // Load look up student by default
        gotoStudents();
    });
}

function gotoStudents () {
    // Highlight only the students button, because it is selected
    document.getElementById("studentsBtn").className = btnHighlighted;
    document.getElementById("formsBtn").className = btnNotHighlighted;

    // Unhide "studentsPage" and put focus on the "searchInput"
    document.getElementById("studentsPage").style.display = "block";
    document.getElementById("searchInput").focus();

    // Clear "searchInput" and "studentsList" and hide other pages
    document.getElementById("searchInput").value = '';
    document.getElementById("searchButton").style.visibility = "hidden";
    document.getElementById("studentsList").innerHTML = '';
    document.getElementById("formsPage").style.display = "none";

    // Update the page's title
    // document.getElementById("pageTitle").innerHTML = "Students";
    const coordID = getUserName();


}

function gotoForms () {
    // Highlight only the forms button, because it is selected
    document.getElementById("formsBtn").className = btnHighlighted;
    document.getElementById("studentsBtn").className = btnNotHighlighted;

    // Clear "formsList" and hide other pages
    document.getElementById("studentsPage").style.display = "none";
    document.getElementById("formsList").innerHTML = '';

    // Update the page's title
    document.getElementById("pageTitle").innerHTML = "Forms";

    // Unhide "formsPage" and get the notifications
    document.getElementById("formsPage").style.display = "block";
}

// Hides inProgressForms page and displays (unhide) the completedForms page
function completedFormsButtonPressed () {
    const completedFormsButton = document.getElementById("completedFormsButton");
    const completedFormsList = document.getElementById("completedFormsList");

    const inProgressFormsButton = document.getElementById("inProgressFormsButton");
    const inProgressFormsList = document.getElementById("inProgressFormsList");

    inProgressFormsButton.style.pointerEvents = "all";
    inProgressFormsButton.style.cursor = "pointer";
    inProgressFormsButton.style.borderBottomColor = "transparent";
    inProgressFormsButton.style.color = "#05307d";

    completedFormsButton.style.pointerEvents = "none";
    completedFormsButton.style.cursor = "default";
    completedFormsButton.style.borderBottomColor = "#054ee1";
    completedFormsButton.style.color = "#054ee1";

    completedFormsList.style.display = "block";
    inProgressFormsList.style.display = "none";
}

// Hides completedForms page and displays (unhide) the inProgressForms page
function inProgressFormsButtonPressed () {
    const completedFormsButton = document.getElementById("completedFormsButton");
    const completedFormsList = document.getElementById("completedFormsList");

    const inProgressFormsButton = document.getElementById("inProgressFormsButton");
    const inProgressFormsList = document.getElementById("inProgressFormsList");

    completedFormsButton.style.pointerEvents = "all";
    completedFormsButton.style.cursor = "pointer";
    completedFormsButton.style.borderBottomColor = "transparent";
    completedFormsButton.style.color = "#05307d";

    inProgressFormsButton.style.pointerEvents = "none";
    inProgressFormsButton.style.cursor = "default";
    inProgressFormsButton.style.borderBottomColor = "#054ee1";
    inProgressFormsButton.style.color = "#054ee1";

    inProgressFormsList.style.display = "block";
    completedFormsList.style.display = "none";
}

// Populate the completedForms and the inProgressForms into this page
function displayStudentForms (studentID) {
    const completedFormsList = document.getElementById("completedFormsList");
    const inProgressFormsList = document.getElementById("inProgressFormsList");

    // Clear old displayed Student forms.
    completedFormsList.innerHTML = '';
    inProgressFormsList.innerHTML = '';

    getStudentForms("dashboardPage", "completedFormsList", studentID, "completedForms", displayFormReadMode);
    getStudentForms("dashboardPage", "inProgressFormsList", studentID, "inProgressForms", displayFormReadMode);

    // Load completed forms of the student by default
    completedFormsButtonPressed();
}

// Switch back to student's list when you click on the back button (back arrow)
function displayStudentSearchListPage () {
    const studentSearchView = document.getElementById("studentSearchView");
    const studentFormsView = document.getElementById("studentFormsView");

    studentSearchView.style.display = "block";
    studentFormsView.style.display = "none";
}

// After clicking on a student's entry, show a popup with the Student's information and have 3 buttons for:
// 1. Generating a PIN; 2. Visualizing the Student's records; 3. Starting a form for that Student
function studentEntryClicked (event) {
    const pageDiv = document.getElementById("studentsPage");
    const studentID = event.currentTarget.studentID;
    const studentFullName = event.currentTarget.studentFullName;

    let wholeHTML = '';
    wholeHTML +=
        '<div id="mainModal" class="w3-modal" style="display: block; padding-bottom: 100px">\n' +
        '    <div class="w3-modal-content w3-round-xlarge w3-border-theme w3-bottombar" style="width: 50%">\n' +
        '        <div class="w3-container">\n' +
        '            <span onclick="closeFormModal(document.getElementsByClassName(\'w3-modal\').item(0))" ' +
        'class="w3-button w3-display-topright w3-round-xlarge" style="padding: 4px 16px">&times;</span>\n' +
        '            <div class="w3-text-theme-red" style="display: block; overflow: auto; margin-top: 15px">\n';

    pawsDB.collection("users").doc(studentID).get().then(function(studentDoc) {
        if (studentDoc.exists) {
            const stuDocData = studentDoc.data();
            const majorCodeHTML = '<span><u>Major Code</u><br>' + stuDocData.major.majorCode + '</span>';
            const advisorID = stuDocData.advisor.advisorUsername;

            wholeHTML +=
                '<h3 style="border-bottom: 2px solid; display: inline-block">' + studentFullName + '</h3>\n' +
                '<h5>Student ID: <span style="color: #000">' + stuDocData.userID + '</span></h5>\n' +
                '<h5>TRACKS: <span style="color: #000">' + studentID + '</span></h5>\n' +
                '<h5>Email: <span style="color: #000">' + stuDocData.email + '</span></h5>\n' +
                '<h5>Major: <span style="color: #000" class="student_info_tooltip" data-tooltip-content="' + majorCodeHTML + '">'
                + stuDocData.major.majorTitle + '</span></h5>\n' +
                '<h5>Department: <span style="color: #000">' + stuDocData.major.department + '</span></h5>\n';

            pawsDB.collection("users").doc(advisorID).get().then(function(advisorDoc) {
                if (advisorDoc.exists) {
                    const advisorDocData = advisorDoc.data();
                    const advisorFullName = advisorDocData.name.first + " " + advisorDocData.name.middle + " " + advisorDocData.name.last;
                    const advisorEmailHTML = '<span>' + advisorDocData.email + '</span>';
                    wholeHTML +=
                        '<h5>Advisor: <span style="color: #000" class="student_info_tooltip" data-tooltip-content="' + advisorEmailHTML + '">'
                        + advisorFullName + '</span></h5>\n' +
                        '</div>';

                    // Insert essential buttons
                    const generatePINHTML = '<span>Generate a specific and time sensitive PIN for this student</span>';
                    const viewRecordsHTML = '<span>View the form records of this student</span>';
                    const startFormHTML = '<span>Start a form for this student</span>';
                    wholeHTML +=
                        '<div style="text-align: center; margin-top: 10px; margin-bottom: 15px">\n' +
                        '    <button class="faculty_button button_properties button_info_tooltip" onclick="generatePIN(event)"'
                        + 'data-tooltip-content="' + generatePINHTML + '" id="generatePINBtn">Generate PIN' + '</button>\n' +
                        '    <button style="margin-left: 10px" class="faculty_button button_properties button_info_tooltip" onclick="viewStudentRecords(event)"'
                        + 'data-tooltip-content="' + viewRecordsHTML + '" id="viewRecordsBtn">View Records' + '</button>\n' +
                        '    <button style="margin-left: 10px" class="faculty_button button_properties button_info_tooltip" onclick="startForm(event)"'
                        + 'data-tooltip-content="' + startFormHTML + '" id="startFormBtn">Start a Form' + '</button>\n' +
                        '</div>\n';

                    // Close the rest of the DIVs
                    wholeHTML +=
                        '</div>\n' +
                        '</div>\n' +
                        '</div>\n';

                    // Insert the HTML at the end of "pageDiv"
                    pageDiv.insertAdjacentHTML("beforeend", wholeHTML);

                    // Insert information about this student into these buttons
                    document.getElementById("generatePINBtn").studentID = studentID;
                    document.getElementById("viewRecordsBtn").studentID = studentID;
                    document.getElementById("startFormBtn").studentID = studentID;

                    // Initialize tooltips
                    $(document).ready(function() {
                        $('.student_info_tooltip').tooltipster({
                            theme: "tooltipster-borderless",
                            position: "right",
                            animation: "grow",
                        });

                        $('.button_info_tooltip').tooltipster({
                            theme: "tooltipster-borderless",
                            position: "bottom",
                            animation: "grow",
                        });
                    });
                } else {
                    console.log("No such document!");
                }
            }).catch(function(error) {
                console.log("Error getting document:", error);
            });
        } else {
            console.log("No such document!");
        }
    }).catch(function(error) {
        console.log("Error getting document:", error);
    });
}

function generatePIN (event) {
    const studentID = event.currentTarget.studentID;
    alert(studentID);
}

function viewStudentRecords (event) {
    const studentID = event.currentTarget.studentID;
    alert(studentID);
}

function startForm (event) {
    const studentID = event.currentTarget.studentID;
    alert(studentID);
}










//
// // Hides inProgressForms page and displays the completedForms page
// function completedFormsButtonPressed () {
//     const completedFormsButton = document.getElementById("completedFormsButton");
//     const completedFormsList = document.getElementById("completedFormsList");
//
//     const inProgressFormsButton = document.getElementById("inProgressFormsButton");
//     const inProgressFormsList = document.getElementById("inProgressFormsList");
//
//     inProgressFormsButton.style.pointerEvents = "all";
//     inProgressFormsButton.style.cursor = "pointer";
//     inProgressFormsButton.style.borderBottomColor = "transparent";
//     inProgressFormsButton.style.color = "#05307d";
//
//     completedFormsButton.style.pointerEvents = "none";
//     completedFormsButton.style.cursor = "default";
//     completedFormsButton.style.borderBottomColor = "#054ee1";
//     completedFormsButton.style.color = "#054ee1";
//
//     completedFormsList.style.display = "block";
//     inProgressFormsList.style.display = "none";
// }
//
// // Hides completedForms page and displays (unhide) the inProgressForms page
// function inProgressFormsButtonPressed () {
//     const completedFormsButton = document.getElementById("completedFormsButton");
//     const completedFormsList = document.getElementById("completedFormsList");
//
//     const inProgressFormsButton = document.getElementById("inProgressFormsButton");
//     const inProgressFormsList = document.getElementById("inProgressFormsList");
//
//     completedFormsButton.style.pointerEvents = "all";
//     completedFormsButton.style.cursor = "pointer";
//     completedFormsButton.style.borderBottomColor = "transparent";
//     completedFormsButton.style.color = "#05307d";
//
//     inProgressFormsButton.style.pointerEvents = "none";
//     inProgressFormsButton.style.cursor = "default";
//     inProgressFormsButton.style.borderBottomColor = "#054ee1";
//     inProgressFormsButton.style.color = "#054ee1";
//
//     inProgressFormsList.style.display = "block";
//     completedFormsList.style.display = "none";
// }
//
// // Hides "start a form" page and displays the "student records" page
// function studentRecordsButtonPressed () {
//     const studentRecordsButton = document.getElementById("studentRecordsButton");
//     const startFormButton = document.getElementById("startFormButton");
//
//     startFormButton.style.pointerEvents = "all";
//     startFormButton.style.cursor = "pointer";
//     startFormButton.style.borderBottomColor = "transparent";
//     startFormButton.style.color = "#05307d";
//
//     studentRecordsButton.style.pointerEvents = "none";
//     studentRecordsButton.style.cursor = "default";
//     studentRecordsButton.style.borderBottomColor = "#054ee1";
//     studentRecordsButton.style.color = "#054ee1";
//
//     document.getElementById("studentSearchView").style.display = "block";
//     document.getElementById("startFormView").style.display = "none";
// }
//
// // Hides "student records" page and displays the "start a form" page
// function startFormButtonPressed () {
//     const studentRecordsButton = document.getElementById("studentRecordsButton");
//     const startFormButton = document.getElementById("startFormButton");
//
//     studentRecordsButton.style.pointerEvents = "all";
//     studentRecordsButton.style.cursor = "pointer";
//     studentRecordsButton.style.borderBottomColor = "transparent";
//     studentRecordsButton.style.color = "#05307d";
//
//     startFormButton.style.pointerEvents = "none";
//     startFormButton.style.cursor = "default";
//     startFormButton.style.borderBottomColor = "#054ee1";
//     startFormButton.style.color = "#054ee1";
//
//     document.getElementById("formsPage").style.display = "block";
//     document.getElementById("studentSearchView").style.display = "none";
//
//
// }
//
// // Populate the completedForms and the inProgressForms into this page
// function displayStudentForms (studentID) {
//     const completedFormsList = document.getElementById("completedFormsList");
//     const inProgressFormsList = document.getElementById("inProgressFormsList");
//
//     // document.getElementById("startFormButton").style.display = "none";
//     // document.getElementById("studentRecordsButton").style.display = "none";
//
//     // Clear old displayed Student forms.
//     completedFormsList.innerHTML = '';
//     inProgressFormsList.innerHTML = '';
//
//     getStudentForms("dashboardPage", "completedFormsList", studentID, "completedForms", displayFormReadMode);
//     getStudentForms("dashboardPage", "inProgressFormsList", studentID, "inProgressForms", displayFormReadMode);
//
//     // Load completed forms of the student by default
//     completedFormsButtonPressed();
// }
//
// // After clicking on a student's entry, show the forms page and call "displayStudentForms" to populate the forms into this page
// function studentEntryClicked (event) {
//     const studentSearchView = document.getElementById("studentSearchView");
//     const studentFormsView = document.getElementById("studentFormsView");
//
//     document.getElementById("startFormButton").style.display = "none";
//     document.getElementById("studentRecordsButton").style.display = "none";
//
//     studentSearchView.style.display = "none";
//     studentFormsView.style.display = "block";
//
//     const studentTitle = document.getElementById("studentTitle");
//     studentTitle.innerHTML = "Forms of " + '<strong>' + event.currentTarget.studentFullName + '</strong>' + '<br>';
//     studentTitle.style.marginBottom = "12px";
//
//     displayStudentForms(event.currentTarget.studentID);
// }
//
// // Switch back to student's list when you click on the back button (back arrow)
// function displayStudentSearchListPage () {
//     const studentSearchView = document.getElementById("studentSearchView");
//     const studentFormsView = document.getElementById("studentFormsView");
//
//     document.getElementById("studentRecordsButton").style.display = "block";
//     document.getElementById("startFormButton").style.display = "block";
//
//     studentSearchView.style.display = "block";
//     studentFormsView.style.display = "none";
// }
