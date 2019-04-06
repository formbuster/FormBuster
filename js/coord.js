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

        // Load "studentSearchView" only once
        $('#studentSearchView').load('student_list.html', function() {
            // Load students page by default
            gotoStudents();
        });
    });
}

function gotoStudents () {
    // Highlight only the students button, because it is selected
    document.getElementById("studentsBtn").className = btnHighlighted;
    document.getElementById("formsBtn").className = btnNotHighlighted;

    // Clear elements and switch back to the search page
    displayStudentSearchListPage();

    // Clear "searchInput" and "studentsList" and hide other pages
    document.getElementById("searchInput").value = '';
    document.getElementById("searchButton").style.visibility = "hidden";
    document.getElementById("studentsList").innerHTML = '';
    document.getElementById("formsPage").style.display = "none";

    // Update the page's title
    document.getElementById("pageTitle").innerHTML = "Find Students Records";

    // Unhide "studentsPage" and put focus on the "searchInput"
    document.getElementById("studentsPage").style.display = "block";
    document.getElementById("searchInput").focus();
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
