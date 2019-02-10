let searchDiv;
function startRegistrationForm(role) {
    if (role == "coord/staff") {
        if (currentUserOfStudentList != "student-search") { //some other form or the dashboard has the student-list.html loaded.
            removePreviousStudentListUser();

            $("#registration-form").find("#student-search").load('student_list.html', function () {
                document.getElementById("searchInput").placeholder = "Enter a student's name to start a form for";
                currentUserOfStudentList = "student-search";
                document.getElementById("allStudentsButton").remove();

                /*
                Once the students results have been returned, and a student has been selected, we start the form process..
                 */
                function nameSelected(event) {
                    // let element = document.getElementById(currentUserOfStudentList);
                    //searchDiv = document.getElementById(currentUserOfStudentList).innerHTML.toString();
                    // while (element.firstChild) { //remove all student list results, but keep the parent div to use it to store the selected student.
                    //     element.removeChild(element.firstChild);
                    // }
                    document.getElementById(currentUserOfStudentList).style.display = "none";

                    let name = event.currentTarget.studentFullName;
                    let username = event.currentTarget.studentID;
                    document.getElementById("startAFormMessage").innerHTML = "<h4>Starting a form for: <b>" + name + "</b></h4>";

                    //name was selected, so when the user selects the send to student parameter, we use their username as the parameter.
                    document.getElementById("send-option-2").addEventListener("click", function () {
                        sendRegistrationForm(username); //pass the student username to the send to s
                    });

                    //show the rest of the form.
                    document.getElementById("form-body").style.display = "block";
                }


                //student results will be populated in the studentsList, watch as each one is populated, and update the event listener
                $('#studentsList').on("DOMNodeInserted", function () {
                    let content = document.getElementsByClassName("w3-button w3-block w3-white w3-round-xlarge button_properties student_entry_button");
                    content[content.length - 1].removeEventListener("click", studentEntryClicked);
                    content[content.length - 1].addEventListener("click", nameSelected);
                });
                return;
            });

            currentUserOfStudentList = "registration-form";

            //hide the form, so that the coordinator/faculty will search and select for the student first. We will reveal the reset of the
            //form after they make a selection.
            document.getElementById("form-body").style.display = "none";

            //hide buttons "enter pin" and save, as these are not needed for the student coordinator or faculty, these are student features.
            document.getElementById("enter-pin-2").remove();
            document.getElementById("save-option-2").remove();
            document.getElementById("submit-option-2").remove();

            //add new button for sending to student
            $("#form-options-1").append('<button id="send-option-2" class="w3-button w3-theme-blue w3-round-xxlarge">Send to Student</button>');
        } else { //starting another register form after just completing one (the student-list.html was already loaded for the registration form).
            document.getElementById(currentUserOfStudentList).style.display = "block";
            document.getElementById("searchInput").value = "";
            document.getElementById("studentsList").innerHTML = "";

            document.getElementById("form-body").style.display = "none";

            document.getElementById('registration-form').style.display='block';
        }
    }
    document.getElementById('registration-form').style.display='block';

}

function removePreviousStudentListUser() {
    if (document.getElementById(currentUserOfStudentList) != null) { // the home page, or another form has loaded the html for student-list.html.
        //empty the div that contains the loaded html from student-list.html before loading it into a different div.
        let studentListUser = document.getElementById(currentUserOfStudentList);
        while (studentListUser.firstChild) {
            studentListUser.removeChild(studentListUser.firstChild);
        }
    } //free to use student-list.html

}