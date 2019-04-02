function loadPage () {
    // Load "general_dashboard.html" and the rest of the page
    $('#generalDashboard').load("general_dashboard.html", function () {
        // Remove elements that don't apply for a Student
        document.getElementById("studentsBtn").remove();
        document.getElementById("formsManagementBtn").remove();
        document.getElementById("notificationPreferences").remove();

        document.getElementById("display-name").classList.add('w3-theme-red');
        document.getElementById("generalTopBar").classList.add('w3-theme-red');
        document.getElementById("footer").classList.add('w3-theme-red');
        document.getElementById("dashboardBtn").innerHTML = "In-Progress Forms";

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
    document.getElementById("pageTitle").innerHTML = "In-Progress Forms";

    // Populate inProgress forms to "inProgressFormsList"
    const studentID = getUserName();
    getStudentForms("dashboardPage", "inProgressFormsList", studentID, "inProgressForms", displayFormReadMode);

    // Unhide "dashboardPage" and get the notifications
    document.getElementById("dashboardPage").style.display = "block";
    getNotifications();
}

function getDrafts() {
    formDB.collection("users").doc(getUserName()).collection("drafts").get().then(function(querySnapshot) {
        if (querySnapshot.size == 0) {
            let result_h4 = document.createElement('h4');
            result_h4.innerHTML = "No forms were found.";
            result_h4.style.textAlign = "left";
            document.getElementById("draftsList").appendChild(result_h4);
        }

        querySnapshot.forEach(function(doc) {
            const formDoc = doc.data();
            const formName = getFormName(doc);
            const exactSubmDate = getExactSubmDate(doc);

            var main_div = document.createElement("div");
            main_div.className = "w3-white w3-button w3-block w3-leftbar w3-border-theme w3-round-xlarge w3-margin-bottom";
            main_div.style.display = "block";

            var first_nested_div = document.createElement("div");
            first_nested_div.className = "w3-left";
            main_div.appendChild(first_nested_div);

            //make an h3 tag, make text, append text to h3 tag, append h3 tag to first_nested_div
            var h3_form_name = document.createElement('h3');
            h3_form_name.appendChild(document.createTextNode(formName));
            first_nested_div.appendChild(h3_form_name);

            var second_nested_div = document.createElement("div");
            second_nested_div.className = "w3-right";
            main_div.appendChild(second_nested_div);

            //make an h3 tag, make text, append text to h3 tag, append h3 tag to first_nested_div
            var h3_form_name = document.createElement('h3');
            h3_form_name.appendChild(document.createTextNode("Started on " + exactSubmDate));
            second_nested_div.appendChild(h3_form_name);

            document.getElementById("draftsList").appendChild(main_div);

            if (formName === "Registration") {
                main_div.addEventListener("click", displayDraftModeRegistration);
            } else if (formName === "Coprerequisite") {
                main_div.addEventListener("click", displayDraftModeCoPrerequisite);
            }

            main_div.pageDiv = "draftsPage";
            main_div.studentID = getUserName();
            main_div.formsFolder = "drafts";
            main_div.formID = doc.id;
        });
    }).catch(function(error) {
        console.log("Error getting documents (querySnapshot): ", error);
    });
}

//todo: further refactor
function updateDraftButtons(formID, formType, studentID) {
    //change the onclick because the start a form feature loads the same code, once we are done making a draft, get rid of the code.
    document.getElementById("close-registration-form").setAttribute("onclick", null);
    document.getElementById("close-registration-form").onclick = closeDraftForm;

    document.getElementById("discard-option-1").setAttribute("onclick", null);
    document.getElementById("discard-option-1").addEventListener("click", deleteDbEntry);

    //when user saves the form, we will delete the current form, and make new one.
    document.getElementById("save-option-2").setAttribute("onclick", null);
    document.getElementById("save-option-2").addEventListener("click", function saveForm() {
        if (formType === "registration") {
            saveRegistrationForm(false, "draftsPage");
        } else if (formType === "co-prerequisite") {
            saveCoPrerequisiteForm(false, "draftsPage");
        }
        deleteDbEntry();
    });

    function deleteDbEntry() {
        formDB.collection("users").doc(studentID).collection("drafts").doc(formID).delete().then(function () {
            closeDraftForm();
            document.getElementById("draftsList").innerHTML = "";
            getDrafts(); //refresh pg
        }).catch(function (error) {
            console.error("Error removing document: ", error);
        });
    }

    document.getElementById("submit-option-2").setAttribute("onclick", null);
    document.getElementById("submit-option-2").addEventListener("click", function submit() {
        if (formType === "registration") {
            saveRegistrationForm(true, "draftsPage");
        } else if (formType === "co-prerequisite") {
            saveCoPrerequisiteForm(true, "draftsPage");
        }
        //todo: BUG - if a coord sends a form to a student that's blank, this will prevent the student from submitting it blank
        deleteDbEntry();
    })
}


function displayDraftModeCoPrerequisite (event) {
    const pageDiv = document.getElementById(event.currentTarget.pageDiv);
    const studentID = event.currentTarget.studentID;
    const formsFolder = event.currentTarget.formsFolder;
    const formID = event.currentTarget.formID;

    $('#editDraft').load('co-prerequisite-form.html', function() {
        startForm("student", "co-prerequisite");

        //modify the registration-form with info from the db.
        formDB.collection("users").doc(getUserName()).collection("drafts").doc(formID).get().then(function(doc) {
            if (doc.exists) {
                const formDoc = doc.data();

                //select the correct term, based on what was saved in the db.
                if (formDoc.content["4_Term"] === "spring") {
                    $("#termSelecter").val('spring');
                } else if (formDoc.content["4_Term"] === "summer") {
                    $("#termSelecter").val('summer');
                } else if (formDoc.content["4_Term"] === "fall"){
                    $("#termSelecter").val('fall');
                }

                const content = formDoc.content;
                setUpCoPrerequisiteDraft(content);
            }
        });

        updateDraftButtons(formID, "co-prerequisite", studentID);
    });
}

function displayDraftModeRegistration (event) {
    const pageDiv = document.getElementById(event.currentTarget.pageDiv);
    const studentID = event.currentTarget.studentID;
    const formsFolder = event.currentTarget.formsFolder;
    const formID = event.currentTarget.formID;

    $('#editDraft').load('registration-form.html', function() {
        startForm("student", "registration");

        //modify the registration-form with info from the db.
        formDB.collection("users").doc(getUserName()).collection("drafts").doc(formID).get().then(function(doc) {
            if (doc.exists) {
                const formDoc = doc.data();

                //select the correct term, based on what was saved in the db.
                if (formDoc.content["2_Term"] === "spring") {
                    $("#termSelecter").val('spring');
                } else if (formDoc.content["2_Term"] === "summer") {
                    $("#termSelecter").val('summer');
                } else if (formDoc.content["2_Term"] === "fall") {
                    $("#termSelecter").val('fall');
                }

                const content = formDoc.content;
                setUpRegistrationDraft(content);
            }
        });

        updateDraftButtons(formID, 'registration', studentID);
    });
}

function closeDraftForm() {
    closeForm();
    document.getElementById("editDraft").innerHTML = "";
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

    const studentID = getUserName();
    getDrafts();

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
    document.getElementById("pageTitle").innerHTML = "Start a Form";

    $('#formsList').load('forms.html', function() {
        //add event listeners for each form.
        document.getElementById("registration-form-button").addEventListener("click", function() {
            startForm("student", "registration");
        });
        document.getElementById("co-prerequisite-form-button").addEventListener("click", function() {
            startForm("student", "co-prerequisite");
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
    document.getElementById("pageTitle").innerHTML = "My Completed Forms";

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
            const exactDate = getExactDateAndTime(getDateFromTimestamp(notificationDate));
            const dateTooltip = `<span>${exactDate}</span>`;

            wholeHTML +=
                `<div class="w3-container w3-white w3-margin-bottom" data-studentid="${studentID}"
                    data-notificationid="${notification.id}" style="padding-right: 0; border: #770000; border-width: 1px; border-style: dashed;
                    box-shadow: 5px 10px 20px #888888;">\n` +
                '    <span onclick="deleteNotification(event)" class="notification_button w3-large w3-right">&times;</span>\n' +
                '    <div id="message">\n' +
                '        <p>' + notificationMessage + '</p>\n' +
                '    </div>\n' +
                '    <div class="time">\n' +
                `        <p style="font-style: italic; color: #8e8e8e;" class="form_date_tooltip"
                    data-tooltip-content="${dateTooltip}">${moment(notificationDate, "MMDDYYYYHHmmss").fromNow()}</p>\n` +
                '    </div>\n' +
                '</div>\n';

            // Insert all the notifications into "notificationsList" and intitialize the tooltips
            if (forEachIteration == querySnapshot.size - 1) {
                notificationsList.innerHTML = wholeHTML;

                $(document).ready(function() {
                    $('.form_date_tooltip').tooltipster({
                        theme: "tooltipster-borderless",
                        position: "left",
                        animation: "grow",
                    });
                });
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



