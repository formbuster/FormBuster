function loadPage () {
    // Load "general_dashboard.html" and the rest of the page
    $('#generalDashboard').load("general_dashboard.html", function () {
        // Remove elements that don't apply for a Staff
        document.getElementById("draftsBtn").remove();
        document.getElementById("formsBtn").remove();
        document.getElementById("notifications").remove();
        document.getElementById("notificationPreferences").remove();

        document.getElementById("display-name").classList.add('w3-theme-darkblue');
        document.getElementById("generalTopBar").classList.add('w3-theme-darkblue');
        document.getElementById("footer").classList.add('w3-theme-darkblue');

        // Attach the functions to each button
        document.getElementById("dashboardBtn").addEventListener("click", gotoDashboard);
        document.getElementById("studentsBtn").addEventListener("click", gotoStudents);
        document.getElementById("historyBtn").addEventListener("click", gotoHistory);
        document.getElementById("formsManagementBtn").addEventListener("click", gotoFormsManagement);

        // Load "studentSearchView" only once
        $('#studentSearchView').load('student_list.html');

        // Load dashboard by default
        gotoDashboard();
    });
}

function gotoDashboard () {
    // Highlight only the dashboard button, because it is selected
    document.getElementById("dashboardBtn").className = btnHighlighted;
    document.getElementById("studentsBtn").className = btnNotHighlighted;
    document.getElementById("historyBtn").className = btnNotHighlighted;
    document.getElementById("formsManagementBtn").className = btnNotHighlighted;

    // Clear "pendingFormsList" and hide other pages
    document.getElementById("pendingFormsList").innerHTML = '';
    document.getElementById("studentsPage").style.display = "none";
    document.getElementById("historyPage").style.display = "none";
    document.getElementById("formsManagementPage").style.display = "none";

    // Update the page's title
    document.getElementById("pageTitle").innerHTML = "Dashboard";

    const staffID = getUserName();
    getStudentFormsByReferenceList("dashboardPage", "pendingFormsList", staffID, "pendingForms", displayFormApproveMode);

    // Unhide "dashboardPage"
    document.getElementById("dashboardPage").style.display = "block";
}

function gotoStudents () {
    // Highlight only the students button, because it is selected
    document.getElementById("dashboardBtn").className = btnNotHighlighted;
    document.getElementById("studentsBtn").className = btnHighlighted;
    document.getElementById("historyBtn").className = btnNotHighlighted;
    document.getElementById("formsManagementBtn").className = btnNotHighlighted;

    // Clear "searchInput" and "studentsList" and hide other pages
    document.getElementById("dashboardPage").style.display = "none";
    document.getElementById("searchInput").value = '';
    document.getElementById("searchButton").style.visibility = "hidden";
    document.getElementById("studentsList").innerHTML = '';
    document.getElementById("historyPage").style.display = "none";
    document.getElementById("formsManagementPage").style.display = "none";

    // Update the page's title
    document.getElementById("pageTitle").innerHTML = "Students";

    // Unhide "studentsPage" and put focus on the "searchInput"
    document.getElementById("studentsPage").style.display = "block";
    document.getElementById("searchInput").focus();
}

function gotoHistory () {
    // Highlight only the history button, because it is selected
    document.getElementById("dashboardBtn").className = btnNotHighlighted;
    document.getElementById("studentsBtn").className = btnNotHighlighted;
    document.getElementById("historyBtn").className = btnHighlighted;
    document.getElementById("formsManagementBtn").className = btnNotHighlighted;

    // Clear "formsHistoryList" and hide other pages
    document.getElementById("dashboardPage").style.display = "none";
    document.getElementById("studentsPage").style.display = "none";
    document.getElementById("formsHistoryList").innerHTML = '';
    document.getElementById("formsManagementPage").style.display = "none";

    // Update the page's title
    document.getElementById("pageTitle").innerHTML = "History";

    const staffID = getUserName();
    getStudentFormsByReferenceList("historyPage", "formsHistoryList", staffID, "completedForms", displayFormReadModeByReference);

    // Unhide "historyPage"
    document.getElementById("historyPage").style.display = "block";
}

function gotoFormsManagement () {
    // Highlight only the forms management button, because it is selected
    document.getElementById("dashboardBtn").className = btnNotHighlighted;
    document.getElementById("studentsBtn").className = btnNotHighlighted;
    document.getElementById("historyBtn").className = btnNotHighlighted;
    document.getElementById("formsManagementBtn").className = btnHighlighted;

    // Clear "formsManagementView" and hide other pages
    document.getElementById("formsManagementView").innerHTML = '';
    document.getElementById("dashboardPage").style.display = "none";
    document.getElementById("studentsPage").style.display = "none";
    document.getElementById("historyPage").style.display = "none";

    // Update the page's title
    document.getElementById("pageTitle").innerHTML = "Forms Management";

    /* Todo: call a function to populate all the forms and their versions into "formsManagementView" */

    // Unhide "formsManagementPage"
    document.getElementById("formsManagementPage").style.display = "block";
}




// After clicking on a student's entry, show a popup with the Student's information and have a button for visualizing the Student's records
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
                    const viewRecordsHTML = '<span>View the form records of this student</span>';
                    wholeHTML +=
                        '<div style="text-align: center; margin-top: 10px; margin-bottom: 15px">\n' +
                        '    <button style="margin-left: 10px" class="staff_button button_properties button_info_tooltip" onclick="viewStudentRecords(event)"' +
                        'data-tooltip-content="' + viewRecordsHTML + '" id="viewRecordsBtn">View Records' + '</button>\n' +
                        '</div>\n';

                    // Close the rest of the DIVs
                    wholeHTML +=
                        '</div>\n' +
                        '</div>\n' +
                        '</div>\n';

                    // Insert the HTML at the end of "pageDiv"
                    pageDiv.insertAdjacentHTML("beforeend", wholeHTML);

                    // Insert information about this student into this button
                    document.getElementById("viewRecordsBtn").studentID = studentID;

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

function viewStudentRecords (event) {
    const studentID = event.currentTarget.studentID;
    alert(studentID);
}
