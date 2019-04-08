/*
This file is responsible for making any modifications to the forms before showing it to the user.
 */

let searchDiv; //look into loading that student-search, and erasing it after using it in the home page and anywhere that needs it.
function loadStudentSearchView(form) {
    if (document.getElementById("studentSearchView").innerHTML != "") { // the dashboard was using the student search view.
        document.getElementById("studentSearchView").innerHTML = ""; //empty the dashboard one.
    }

    //load the search for this form.
    $("#"+form).find("#student-search").load('student_list.html', function () {
        document.getElementById("searchInput").placeholder = "Enter a student's name to start a form for";
        document.getElementById("student-search").style.marginBottom = "20px";
        currentUserOfStudentList = "student-search";
        document.getElementById("allStudentsButton").remove();

        /*
        Once the students results have been returned, and a student has been selected, we start the form process..
         */
        function nameSelected(event) {
            document.getElementById(currentUserOfStudentList).style.display = "none";

            let name = event.currentTarget.studentFullName;
            let username = event.currentTarget.studentID;
            document.getElementById("startAFormMessage").innerHTML = "<h4>Starting a form for: <b>" + name + "</b></h4>";

            // Save studentID to "currentFormOpen", so that we know later for what Student is this form
            document.getElementById("currentFormOpen").studentID = username;

            //name was selected, so when the user selects the send to student parameter, we use their username as the parameter.
            document.getElementById("send-option-2").addEventListener("click", function () {
                if (form == "registration-form") {
                    sendRegistrationForm(username); //pass the student username to the send to student
                } else if (form == "coprerequisite-form") {
                    sendCoPrerequisiteForm(username);
                }
            });

            // Don't forget to save the "studentID" to the form page, so we know later for what student is this form
            saveStudentIDToPage(username);

            document.getElementById("send-option-2").style.display = "inline";

            //show the rest of the form.
            document.getElementById("form-body").style.display = "block";
        }

        //student results will be populated in the studentsList, watch as each one is populated, and update the event listener
        $('#studentsList').on("DOMNodeInserted", function () {
            let content = document.getElementsByClassName("w3-button w3-block w3-white w3-round-xlarge button_properties student_entry_button");
            content[content.length - 1].removeEventListener("click", studentEntryClicked);
            content[content.length - 1].addEventListener("click", nameSelected);

            //change the element to the light red color, instead of the original white.
            content[content.length - 1].className = "w3-border-theme w3-background w3-button w3-block w3-round-xlarge button_properties student_entry_button";
        });
    });

    //hide the form, so that the coordinator/faculty will search and select for the student first. We will reveal the reset of the
    //form after they make a selection.
    document.getElementById("form-body").style.display = "none";

    //hide button save, as this is not needed for the student coordinator, this is a student feature.
    document.getElementById("save-option-2").remove();
    document.getElementById("submit-option-2").remove();

    //add new button for sending to student
    $("#form-options-1").append(`<button id="send-option-2" class="send_to_student_button button_properties button_tooltip" data-tooltip-content='<span>Send this form with all of its filled information to the student above</span>' style="display: none">Send to Student</button>`);

    // Initialize button_tooltip tooltip
    $(document).ready(function() {
        $('.button_tooltip').tooltipster({
            theme: "tooltipster-borderless",
            side: "bottom",
            animation: "grow",
        });
    });
}

function startForm(role, formName) {
    const unavailableTerms = getTermsUnavailableForForms();
    const availableTerms = getTermsAvailableForForms();
    const studentID = getUserName();

    if (role == "coord/staff") {
        if (formName == "registration") {
            $("#currentFormOpen").load("registration-form.html", function () {
                removeTermSelecterOption(unavailableTerms, "registration");
                fixTermSelecterTermNames(availableTerms, "registration");
                saveStudentIDToPage(studentID);
                updateFormDueDate("registration");
                document.getElementById("registration-form-title").innerHTML = getFormNameFromID("registration") + " Form";
                loadStudentSearchView("registration-form");
            });
        } else if (formName == "coprerequisite") {
            $("#currentFormOpen").load("coprerequisite-form.html", function () {
                removeTermSelecterOption(unavailableTerms, "coprerequisite");
                fixTermSelecterTermNames(availableTerms, "coprerequisite");
                saveStudentIDToPage(studentID);
                updateFormDueDate("coprerequisite");
                document.getElementById("coprerequisite-form-title").innerHTML = getFormNameFromID("coprerequisite") + " Form";
                loadStudentSearchView("coprerequisite-form");
            });
        }
        //reveal the form after being modified.
        document.getElementById("currentFormOpen").style.display = "block";
    } else {
        if (formName == "registration") {
            $("#currentFormOpen").load("registration-form.html", function () {
                removeTermSelecterOption(unavailableTerms, "registration");
                fixTermSelecterTermNames(availableTerms, "registration");
                saveStudentIDToPage(studentID);
                updateFormDueDate("registration");
                document.getElementById("registration-form-title").innerHTML = getFormNameFromID("registration") + " Form";
                //reveal the form, no modifications.
                document.getElementById("currentFormOpen").style.display = "block";
            });
        } else if (formName == "coprerequisite") {
            $("#currentFormOpen").load("coprerequisite-form.html", function () {
                removeTermSelecterOption(unavailableTerms, "coprerequisite");
                fixTermSelecterTermNames(availableTerms, "coprerequisite");
                saveStudentIDToPage(studentID);
                updateFormDueDate("coprerequisite");
                document.getElementById("coprerequisite-form-title").innerHTML = getFormNameFromID("coprerequisite") + " Form";
                document.getElementById("currentFormOpen").style.display = "block";
            });
        }
    }
}

// Remove the options from the user of selecting a term when starting a form, in which they shouldn't be able to select
// according to today's date
function removeTermSelecterOption (unavailableTerms, formName) {
    while (unavailableTerms[formName].length > 0) {
        const id = unavailableTerms[formName].pop().split(' ')[0].toLowerCase() + "Option";
        document.getElementById(id).remove();
    }
}

// Put the correct term names in the "termSelecter" drop down menu
function fixTermSelecterTermNames (availableTerms, formName) {
    while (availableTerms[formName].length > 0) {
        const term = availableTerms[formName].pop();
        const id = term.split(' ')[0].toLowerCase() + "Option";
        document.getElementById(id).innerHTML = term;
    }
}

// Saves the "studentID" to the form page, so we know for what student is this form
function saveStudentIDToPage (studentID) {
    document.getElementById("form-body").studentID = studentID;
}

// Update form due date whenever the user selects another term in the "termSelecter" drop down menu
function updateFormDueDate (formName) {
    const termSelected = document.getElementById("termSelecter").value;
    const studentID = document.getElementById("form-body").studentID;

    if (termSelected == "summer" || termSelected == "fall" || termSelected == "spring") {
        const dueDatePromise = getFormDueDate(formName, termSelected, studentID, moment());

        dueDatePromise.then(function (result) {
            document.getElementById("formDueDate").innerHTML = `Due Date: ${result.format('M/D/YY')}`;
            const tooltipContent = result.format('M/D/YY [at] HH:mm:ss');

            if (document.getElementById("formDueDate").classList.contains("tooltipstered")) {
                $('.formDueDate-tooltip').tooltipster('content', tooltipContent);

            } else {
                document.getElementById("formDueDate").setAttribute("data-tooltip-content", `<span>${tooltipContent}</span>`);
                $(document).ready(function () {
                    $('.formDueDate-tooltip').tooltipster({
                        theme: ["tooltipster-shadow", "tooltipster-shadow-customized"],
                        position: "left",
                        animation: "grow",
                    });
                });
            }
        });

    } else {
        const tooltipMessage = "Select a term first";
        document.getElementById("formDueDate").setAttribute("data-tooltip-content", `<span>${tooltipMessage}</span>`);
        $(document).ready(function () {
            $('.formDueDate-tooltip').tooltipster({
                theme: ["tooltipster-shadow", "tooltipster-shadow-customized"],
                position: "left",
                animation: "grow",
            });
        });
    }
}

// Return the correct term value from "termSelecter" drop down menu.
// If a term wasn't selected, return an empty String.
function getCorrectTermValue () {
    const value = document.getElementById("termSelecter").value;

    let term = "";
    if (value.length > 0) {
        term = document.getElementById(`${value}Option`).innerHTML;
    }

    return term;
}

// Put the correct term names in the "termSelecter" drop down menu
function changeTermSelecterTermName (term) {
    if (term.length > 0) {
        const id = term.split(' ')[0].toLowerCase() + "Option";
        document.getElementById(id).innerHTML = term;
    }
}
