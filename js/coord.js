var currentUserOfStudentList; // only one div can have student_list.html loaded. will be used to empty the element stored here before loading.

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


        // Load look up student by default
        gotoStudents();

        //Load forms page once.
        $('#formsList').load('forms.html', function() {
            //add event listeners for each form.
            document.getElementById("registration-form-button").addEventListener("click", function() {
                startForm("coord/staff", "registration");
            });
            document.getElementById("coprerequisite-form-button").addEventListener("click", function() {
                startForm("coord/staff", "coprerequisite");
            });
        });
    });
}


function gotoStudents () {
    if (document.getElementById("studentSearchView").innerHTML == "") {
        // Load "studentSearchView" only once
        $('#studentSearchView').load('student_list.html', function () {
            setUpStudents();
        });
    } else {
        setUpStudents();
    }

    function setUpStudents() {
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
        document.getElementById("pageTitle").innerHTML = "Find Students Records";

        const coordID = getUserName();
    }
}

function gotoForms () {
    // Highlight only the forms button, because it is selected
    document.getElementById("formsBtn").className = btnHighlighted;
    document.getElementById("studentsBtn").className = btnNotHighlighted;

    // Clear "formsList" and hide other pages
    document.getElementById("studentsPage").style.display = "none";

    // Update the page's title
    document.getElementById("pageTitle").innerHTML = "Start a Form";

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

    getStudentForms("studentsPage", "completedFormsList", studentID, "completedForms", displayFormReadMode);
    getStudentForms("studentsPage", "inProgressFormsList", studentID, "inProgressForms", displayFormReadMode);

    // Load completed forms of the student by default
    completedFormsButtonPressed();
}

// After clicking on a student's entry, show the forms page and call "displayStudentForms" to populate the forms into this page
function studentEntryClicked (event) {
    const studentSearchView = document.getElementById("studentSearchView");
    const studentFormsView = document.getElementById("studentFormsView");

    studentSearchView.style.display = "none";
    studentFormsView.style.display = "block";

    const studentTitle = document.getElementById("studentTitle");
    studentTitle.innerHTML = "Forms of " + '<strong>' + event.currentTarget.studentFullName + '</strong>' + '<br>';
    studentTitle.style.marginBottom = "12px";

    displayStudentForms(event.currentTarget.studentID);
}

// Switch back to student's list when you click on the back button (back arrow)
function displayStudentSearchListPage () {
    const studentSearchView = document.getElementById("studentSearchView");
    const studentFormsView = document.getElementById("studentFormsView");

    studentSearchView.style.display = "block";
    studentFormsView.style.display = "none";
}
