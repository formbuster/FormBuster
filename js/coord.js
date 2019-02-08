function loadPage () {
    // Load "general_dashboard.html" and the rest of the page
    $('#generalDashboard').load("general_dashboard.html", function () {
        // Remove elements that don't apply for a Student Coordinator
        document.getElementById("mySidebar").remove();
        document.getElementById("openNav").remove();
        document.getElementById("notifications").remove();
        document.getElementById("notificationPreferences").remove();

        document.getElementById("display-name").classList.add('w3-theme-orange');
        document.getElementById("generalTopBar").classList.add('w3-theme-orange');
        document.getElementById("footer").classList.add('w3-theme-orange');

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

// Hides "start a form" page and displays the "student records" page
function studentRecordsButtonPressed () {
    const studentRecordsButton = document.getElementById("studentRecordsButton");
    const startFormButton = document.getElementById("startFormButton");

    startFormButton.style.pointerEvents = "all";
    startFormButton.style.cursor = "pointer";
    startFormButton.style.borderBottomColor = "transparent";
    startFormButton.style.color = "#05307d";

    studentRecordsButton.style.pointerEvents = "none";
    studentRecordsButton.style.cursor = "default";
    studentRecordsButton.style.borderBottomColor = "#054ee1";
    studentRecordsButton.style.color = "#054ee1";

    document.getElementById("studentSearchView").style.display = "block";
    document.getElementById("startFormView").style.display = "none";
}

// Hides "student records" page and displays the "start a form" page
function startFormButtonPressed () {
    const studentRecordsButton = document.getElementById("studentRecordsButton");
    const startFormButton = document.getElementById("startFormButton");

    studentRecordsButton.style.pointerEvents = "all";
    studentRecordsButton.style.cursor = "pointer";
    studentRecordsButton.style.borderBottomColor = "transparent";
    studentRecordsButton.style.color = "#05307d";

    startFormButton.style.pointerEvents = "none";
    startFormButton.style.cursor = "default";
    startFormButton.style.borderBottomColor = "#054ee1";
    startFormButton.style.color = "#054ee1";

    document.getElementById("startFormView").style.display = "block";
    document.getElementById("studentSearchView").style.display = "none";
}

// Populate the completedForms and the inProgressForms into this page
function displayStudentForms (studentID) {
    const completedFormsList = document.getElementById("completedFormsList");
    const inProgressFormsList = document.getElementById("inProgressFormsList");

    // document.getElementById("startFormButton").style.display = "none";
    // document.getElementById("studentRecordsButton").style.display = "none";

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

    document.getElementById("startFormButton").style.display = "none";
    document.getElementById("studentRecordsButton").style.display = "none";

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

    document.getElementById("studentRecordsButton").style.display = "block";
    document.getElementById("startFormButton").style.display = "block";

    studentSearchView.style.display = "block";
    studentFormsView.style.display = "none";
}
