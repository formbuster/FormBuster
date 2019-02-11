function loadPage () {
    // Load "general_dashboard.html" and the rest of the page
    $('#generalDashboard').load("general_dashboard.html", function () {
        // Remove elements that don't apply for a Student Coordinator
        document.getElementById("mySidebar").remove();
        document.getElementById("openNav").remove();
        document.getElementById("notifications").remove();
        document.getElementById("notificationPreferences").remove();

        // Load "studentSearchView" only once
        $('#studentSearchView').load('student_list.html');

        // Unhide "dashboardPage"
        document.getElementById("dashboardPage").style.display = "block";
    });
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
