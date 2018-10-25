/*
THis file contains the functions to populate data for the student role in order to display on dashboard as well as the side
tabs.
 */

function showDashboard() {
    //highlight only the dashboard tag, because it is selected.
    document.getElementById("dashboard").className = "w3-bar-item w3-button w3-hover-theme w3-large w3-text-theme-red w3-background";
    document.getElementById("forms").className = "w3-bar-item w3-button w3-hover-theme w3-large";
    document.getElementById("history").className = "w3-bar-item w3-button w3-hover-theme w3-large";

    //only show the dashboard, because it is selected.
    document.getElementById("dashboard-contents").style.display = "block";
    document.getElementById("forms-list").style.display = "none";
    document.getElementById("history-list").style.display = "none";
}

function showFormsList() {
    //highlight only the forms tag, because it is selected.
    document.getElementById("dashboard").className = "w3-bar-item w3-button w3-hover-theme w3-large";
    document.getElementById("forms").className = "w3-bar-item w3-button w3-hover-theme w3-large w3-text-theme-red w3-background";
    document.getElementById("history").className = "w3-bar-item w3-button w3-hover-theme w3-large";

    //only show the forms, because it is selected.
    document.getElementById("forms-list").style.display = "block";
    document.getElementById("dashboard-contents").style.display = "none";
    document.getElementById("history-list").style.display = "none";
}

function showHistoryList() {
    //highlight only the history tag, because it is selected.
    document.getElementById("dashboard").className = "w3-bar-item w3-button w3-hover-theme w3-large";
    document.getElementById("history").className = "w3-bar-item w3-button w3-hover-theme w3-large w3-text-theme-red w3-background";
    document.getElementById("forms").className = "w3-bar-item w3-button w3-hover-theme w3-large";

    //only show the history, because it is selected.
    document.getElementById("history-list").style.display = "block";
    document.getElementById("forms-list").style.display = "none";
    document.getElementById("dashboard-contents").style.display = "none";
}


function setUpDashboard() {
    getInProgressForm();
    //getNotifications();
}

function getDisplayName() {
    document.getElementById("display-name").innerHTML = getUserName();
}
/*
This function's purpose is to generate the in-process forms view for a student on their dashboard.
 */
function getInProgressForm() {
    var txt = '{"form_name":"Registration Form", "needed_approvals": 3, "approvals":1, "submission_date":"09-09-2018", "due_date":"09-09-2018", "student":"Student, Test"}';
    var obj = JSON.parse(txt);
    console.log(obj.form_name + " " + obj.approvals + " " + obj.submission_date + " " + obj.due_date + " " + obj.student);

    //swap out 4 for the number of in progress forms for a student
    for (let nam_of_form_occurrences = 0; nam_of_form_occurrences < 4; nam_of_form_occurrences++) {
        var main_div = document.createElement("div");
        main_div.className = "w3-white w3-button w3-block w3-leftbar w3-border-theme w3-round-xlarge w3-margin-bottom\t";
        //make a new div with class name, and append it to main div
        var first_nested_div = document.createElement("div");
        first_nested_div.className = "w3-left";
        main_div.appendChild(first_nested_div);
        //make an h3 tag, make text, append text to h3 tag, append h3 tag to first_nested_div
        var h3_form_name = document.createElement('h3');
        var txt_form_name = document.createTextNode(obj.form_name);
        h3_form_name.appendChild(txt_form_name);
        first_nested_div.appendChild(h3_form_name);
        //generate check marks
        for (i = 1; i <= obj.needed_approvals; i++) {
            var span_check_mark = document.createElement('span');
            //Green check mark since it has already been approved..
            if (i <= obj.approvals) {
                span_check_mark.className = "w3-left w3-badge w3-green w3-large";
            } else { // has not been approved so use the grey check mark style
                span_check_mark.className = "w3-left w3-margin-left w3-badge w3-grey w3-large";
            }
            var txt_form_name = document.createTextNode("✓");
            span_check_mark.appendChild(txt_form_name);
            first_nested_div.appendChild(span_check_mark);
        }
        var second_nested_div = document.createElement("div");
        second_nested_div.className = "w3-right"
        var h4_submission_date = document.createElement('h3');
        var submission_date_txt = document.createTextNode("Submission Date: " + obj.submission_date);
        h4_submission_date.appendChild(submission_date_txt);
        second_nested_div.appendChild(h4_submission_date);
        var h4_due_date = document.createElement('h3');
        var due_date_txt = document.createTextNode("Due Date: " + obj.due_date);
        h4_due_date.appendChild(due_date_txt);
        second_nested_div.appendChild(h4_due_date);

        main_div.appendChild(second_nested_div);

        /*Todo: finish function call for on click, (see below)
        Todo: lines 29-41 should be used above for the in-progress form information.
        */
        main_div.onclick = function(){console.log("clicked")};
        document.getElementById("transit_form_list").appendChild(main_div);
    }
}

/*
This function's purpose is to generate the notifications view for a student on their dashboard.
Todo: Fix this so it works, or generate the html code using JS.
 */

function getNotifications() {
    var txt = '{"message":"David Lee has approved your Registration Form", "time":  "min ago"}';
    var obj = JSON.parse(txt);
    console.log(obj.message + " " + obj.time);

    var notification_div = document.createElement("div");
    notification_div.id = "notification";

    document.getElementById("notifications-list").appendChild(notification_div);

    console.log(document.getElementById("message"));
    var insideContent=$("#message").html();
    alert(insideContent);
}


/*
This function's purpose is to generate the history view for a student on their dashboard.
Todo: Implement this so that it will generate the code for the student's history.
 */
function getPastForms() {

}

function logOut() {

}

function saveForm() {

}

function retractForm() {

}

function chooseDifferentApprover() {

}

/*
            <!-- popup bar, this is not used yet, will be used with line 62, when a form is clicked -->
            <div id="id01" class="w3-modal">
                <div class="w3-modal-content">
                    <div class="w3-container">
                        <span onclick="document.getElementById('id01').style.display='none'" class="w3-button w3-display-topright">&times;</span>
                        <div class="w3-text-theme-red">
                            <H3>Registration</H3>
                            <h3>Approvals:</h3>
                            <h3>Dr. Philip Chan</h3><button class="w3-circle w3-green w3-button w3-tooltip">✓</button>
                            <button class="w3-button w3-red w3-round-xxlarge">Retract</button>
                            <button class="w3-button w3-red w3-round-xxlarge">View Form</button>

                        </div>
                    </div>
                </div>
            </div>
            <!--pop up bar end-->
 */