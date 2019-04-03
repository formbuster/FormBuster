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

            //name was selected, so when the user selects the send to student parameter, we use their username as the parameter.
            document.getElementById("send-option-2").addEventListener("click", function () {
                if (form == "registration-form") {
                    sendRegistrationForm(username); //pass the student username to the send to student
                } else if (form == "coprerequisite-form") {
                    sendCoPrerequisiteForm(username);
                }
            });

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

    //hide buttons "enter pin" and save, as these are not needed for the student coordinator or faculty, these are student features.
    document.getElementById("enter-pin-2").remove();
    document.getElementById("save-option-2").remove();
    document.getElementById("submit-option-2").remove();

    //add new button for sending to student
    $("#form-options-1").append('<button id="send-option-2" class="w3-button w3-theme-blue w3-round-xxlarge" style="display: none">Send to Student</button>');
}

function startForm(role, formName) {
    const unavailableTerms = getTermsUnavailableForForms();

    if (role == "coord/staff") {
        if (formName == "registration") {
            $("#currentFormOpen").load("registration-form.html", function () {
                removeTermSelecterOption(unavailableTerms, "registration");
                loadStudentSearchView("registration-form");
            });
        } else if (formName == "coprerequisite") {
            $("#currentFormOpen").load("coprerequisite-form.html", function () {
                removeTermSelecterOption(unavailableTerms, "coprerequisite");
                loadStudentSearchView("coprerequisite-form");
            });
        }
        //reveal the form after being modified.
        document.getElementById("currentFormOpen").style.display = "block";
    } else {
        if (formName == "registration") {
            $("#currentFormOpen").load("registration-form.html", function () {
                removeTermSelecterOption(unavailableTerms, "registration");
                //reveal the form, no modifications.
                document.getElementById("currentFormOpen").style.display = "block";
            });
        } else if (formName == "coprerequisite") {
            $("#currentFormOpen").load("coprerequisite-form.html", function () {
                removeTermSelecterOption(unavailableTerms, "coprerequisite");
                document.getElementById("currentFormOpen").style.display = "block";
            });
        }
    }
}

// Remove the options from the user of selecting a term when starting a form, in which they shouldn't be able to select
// according to today's date
function removeTermSelecterOption (unavailableTerms, formName) {
    while (unavailableTerms[formName].length > 0) {
        const id = unavailableTerms[formName].pop().toLowerCase() + "Option";
        document.getElementById(id).remove();
    }
}
