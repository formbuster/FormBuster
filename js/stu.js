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
    document.getElementById("draftsList").innerHTML = '';

    const availableTerms = getTermsAvailableForForms();
    let forEachIteration = 0;
    let deletedDrafts = 0;

    formDB.collection("users").doc(getUserName()).collection("drafts").get().then(function(querySnapshot) {
        if (querySnapshot.size == 0) {
            let result_h4 = document.createElement('h4');
            result_h4.innerHTML = "No forms were found.";
            result_h4.style.textAlign = "left";
            document.getElementById("draftsList").appendChild(result_h4);
        }

        querySnapshot.forEach(function(doc) {
            const formDoc = doc.data();
            const formID = getFormID(doc);
            const formName = getFormName(doc);
            const submDate = getSubmDate(doc);
            const exactSubmDate = getExactSubmDate(doc);
            const term = formDoc.term;

            // When term is not selected, give a different "message"
            let termMessage;
            if (term.length == 0) {
                termMessage = "no term selected"
            } else {
                termMessage = term;
            }

            // Check to see if this draft is still available or if a term haven't been selected yet, otherwise delete it
            if (availableTerms[formID.toLowerCase()].includes(term) || term.length == 0) {
                var main_div = document.createElement("div");
                main_div.className = `divs-to-sort-draftsList w3-white w3-button w3-block w3-leftbar w3-border-theme w3-round-xlarge w3-margin-bottom`;
                main_div.style.display = "block";
                main_div.date = moment(doc.id.toString().split('_')[1], "MMDDYYYYHHmmss").format('YYYYMMDDHHmmss');

                var first_nested_div = document.createElement("div");
                first_nested_div.className = "w3-left";
                main_div.appendChild(first_nested_div);

                //make an h3 tag, make text, append text to h3 tag, append h3 tag to first_nested_div
                var h3_form_name = document.createElement('h3');
                const termInfo = `<span style="font-size: 17px; color: #8E8E8E; display: contents">(${termMessage})</span>`;
                h3_form_name.innerHTML = `${formName} ${termInfo}`;
                h3_form_name.style.fontSize = "20px";
                h3_form_name.style.display = "flex";
                first_nested_div.appendChild(h3_form_name);

                var second_nested_div = document.createElement("div");
                second_nested_div.className = "w3-right";
                main_div.appendChild(second_nested_div);

                //make an h3 tag, make text, append text to h3 tag, append h3 tag to first_nested_div
                var h3_form_name = document.createElement('h3');
                h3_form_name.appendChild(document.createTextNode("Date Modified: " + submDate));
                h3_form_name.setAttribute("data-tooltip-content", '<span>' + exactSubmDate + '</span>');
                h3_form_name.style.fontSize = "20px";
                h3_form_name.className = "form_date_tooltip";
                second_nested_div.appendChild(h3_form_name);

                document.getElementById("draftsList").appendChild(main_div);

                $(document).ready(function() {
                    $('.form_date_tooltip').tooltipster({
                        theme: ["tooltipster-shadow", "tooltipster-shadow-customized"],
                        position: "left",
                        animation: "grow",
                    });
                });

                if (formID === "Registration") {
                    main_div.addEventListener("click", displayDraftModeRegistration);
                } else if (formID === "Coprerequisite") {
                    main_div.addEventListener("click", displayDraftModeCoPrerequisite);
                }

                main_div.pageDiv = "draftsPage";
                main_div.studentID = getUserName();
                main_div.formsFolder = "drafts";
                main_div.formID = doc.id;

            } else {
                formDB.collection("users").doc(getUserName()).collection("drafts").doc(doc.id).delete();
                deletedDrafts++;
            }

            // If we are in the last iteration of drafts, then display a message saying how many drafts were outdated and hence deleted,
            // and sort all the divs in ascending order (older first)
            if (forEachIteration == querySnapshot.size - 1) {
                if (deletedDrafts > 0) {
                    displayConfirmationMessage("draftsPage",
                        `${deletedDrafts} drafts were outdated, and hence deleted.`);
                }

                // Ascending order (older forms first)
                $(`.divs-to-sort-draftsList`).sort(sortAscending).appendTo(document.getElementById("draftsList"));
            }

            forEachIteration++;
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
        } else if (formType === "coprerequisite") {
            saveCoPrerequisiteForm(false, "draftsPage");
        }
        deleteDbEntry();
    });

    function deleteDbEntry() {
        formDB.collection("users").doc(studentID).collection("drafts").doc(formID).delete().then(function () {
            closeDraftForm();
            // Todo: refresh draftsList
        }).catch(function (error) {
            console.error("Error removing document: ", error);
        });
    }

    document.getElementById("submit-option-2").setAttribute("onclick", function clicked() {
        if (formType === "registration") {
            saveRegistrationForm(true, "draftsPage");
        } else if (formType === "coprerequisite") {
            saveCoPrerequisiteForm(true, "draftsPage");
        }
        //todo: BUG - if a coord sends a form to a student that's blank, this will prevent the student from submitting it blank
        deleteDbEntry();
    });
}


function displayDraftModeCoPrerequisite (event) {
    const pageDiv = document.getElementById(event.currentTarget.pageDiv);
    const studentID = event.currentTarget.studentID;
    const formsFolder = event.currentTarget.formsFolder;
    const formID = event.currentTarget.formID;

    const unavailableTerms = getTermsUnavailableForForms();
    const availableTerms = getTermsAvailableForForms();

    $('#editDraft').load('coprerequisite-form.html', function() {
        startForm("student", "coprerequisite");
        document.getElementById("coprerequisite-form-title").innerHTML = getFormNameFromID("coprerequisite");

        //modify the coprerequisite-form with info from the db.
        formDB.collection("users").doc(getUserName()).collection("drafts").doc(formID).get().then(function(doc) {
            if (doc.exists) {
                const formDoc = doc.data();
                const formTerm = formDoc.term.split(' ')[0];

                //select the correct term, based on what was saved in the db.
                if (formTerm === "Spring") {
                    $("#termSelecter").val('spring');
                } else if (formTerm === "Summer") {
                    $("#termSelecter").val('summer');
                } else if (formTerm === "Fall"){
                    $("#termSelecter").val('fall');
                }

                // Make sure to change the term name to whatever is in the database, and to update the form due date accordingly as well
                removeTermSelecterOption(unavailableTerms, "coprerequisite");
                fixTermSelecterTermNames(availableTerms, "coprerequisite");
                changeTermSelecterTermName(formDoc.term); // important
                saveStudentIDToPage(studentID); // might be redundant, since this function was already called in "startForm()" earlier on
                updateFormDueDate("coprerequisite");

                const content = formDoc.content;
                setUpCoPrerequisiteDraft(content);
            }
        });

        updateDraftButtons(formID, "coprerequisite", studentID);
    });
}

function displayDraftModeRegistration (event) {
    const pageDiv = document.getElementById(event.currentTarget.pageDiv);
    const studentID = event.currentTarget.studentID;
    const formsFolder = event.currentTarget.formsFolder;
    const formID = event.currentTarget.formID;

    const unavailableTerms = getTermsUnavailableForForms();
    const availableTerms = getTermsAvailableForForms();

    $('#editDraft').load('registration-form.html', function() {
        startForm("student", "registration");
        document.getElementById("registration-form-title").innerHTML = getFormNameFromID("registration");

        //modify the registration-form with info from the db.
        formDB.collection("users").doc(getUserName()).collection("drafts").doc(formID).get().then(function(doc) {
            if (doc.exists) {
                const formDoc = doc.data();
                const formTerm = formDoc.term.split(' ')[0];

                //select the correct term, based on what was saved in the db.
                if (formTerm === "Spring") {
                    $("#termSelecter").val('spring');
                } else if (formTerm === "Summer") {
                    $("#termSelecter").val('summer');
                } else if (formTerm === "Fall") {
                    $("#termSelecter").val('fall');
                }

                // Make sure to change the term name to whatever is in the database, and to update the form due date accordingly as well
                removeTermSelecterOption(unavailableTerms, "registration");
                fixTermSelecterTermNames(availableTerms, "registration");
                changeTermSelecterTermName(formDoc.term); // important
                saveStudentIDToPage(studentID); // might be redundant, since this function was already called in "startForm()" earlier on
                updateFormDueDate("registration");

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
    document.getElementById("pageTitle").innerHTML = "Form Drafts";

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
        document.getElementById("coprerequisite-form-button").addEventListener("click", function() {
            startForm("student", "coprerequisite");
        });

        // Update the name of the actual form cards
        document.getElementById("registration-card-title").innerHTML = getFormNameFromID("registration");
        document.getElementById("coprerequisite-card-title").innerHTML = getFormNameFromID("coprerequisite");

        // Don't forget to display the forms available next to the form names
        addAvailableTermsToFormName();
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
            const notificationMessage = userNotification.message.replace(userNotification.message.split("\"")[1],
                getFormNameFromID(userNotification.message.split("\"")[1]));
            const notificationDate = notification.id.toString().split('_')[1];
            const exactDate = getExactDateAndTime(getDateFromTimestamp(notificationDate));
            const dateTooltip = `<span>${exactDate}</span>`;

            wholeHTML +=
                `<div class="w3-container w3-white w3-margin-bottom" data-studentid="${studentID}"
                    data-notificationid="${notification.id}" style="padding-right: 0; border: #770000; border-width: 1px; border-style: dashed;
                    box-shadow: 5px 10px 20px #888888;">\n` +
                '    <span onclick="deleteNotification(event)" class="notification_button w3-large w3-right">&times;</span>\n' +
                '    <div id="message">\n' +
                '        <p style="font-size: 14px">' + notificationMessage + '</p>\n' +
                '    </div>\n' +
                '    <div class="time">\n' +
                `        <p style="font-style: italic; color: #8e8e8e; font-size: 14px" class="form_date_tooltip"
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
