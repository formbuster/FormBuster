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
    getNotifications();
    //getCourse();

}

function getDisplayName() {
    const userName = getUserName();

    pawsDB.collection("users").doc(userName).get().then(function(doc) {
        if (doc.exists) {
            const docData = doc.data();
            document.getElementById("display-name").innerHTML = docData.name.first + " " + docData.name.middle + " " + docData.name.last;
        } else {
            // doc.data() will be undefined in this case
            console.log("No such document!");
        }
    }).catch(function(error) {
        console.log("Error getting document:", error);
    });
}

/*
This function's purpose is to generate the in-process forms view for a student on their dashboard.
 */
function getInProgressForm() {
    const userName = getUserName();

    formDB.collection("users").doc(userName).collection("inProgressForms").get().then(function(querySnapshot) {
        querySnapshot.forEach(function(doc) {
            // doc.data() is never undefined for query doc snapshots

            const formDoc = doc.data();
            const formName = doc.id.toString().split('_')[0];
            const submDate = getFormattedDate(getDateFromTimestamp(doc.id.toString().split('_')[1]));
            const exactSubmDate = getExactDateAndTime(getDateFromTimestamp(doc.id.toString().split('_')[1]));
            const dueDatePromise = getFormDueDate(formName);
            const approvals = formDoc.approvals;

            var main_div = document.createElement("div");
            main_div.className = "w3-white w3-button w3-block w3-leftbar w3-border-theme w3-round-xlarge w3-margin-bottom\t";

            //make a new div with class name, and append it to main div
            var first_nested_div = document.createElement("div");
            first_nested_div.className = "w3-left";
            main_div.appendChild(first_nested_div);

            //make an h3 tag, make text, append text to h3 tag, append h3 tag to first_nested_div
            var h3_form_name = document.createElement('h3');
            h3_form_name.appendChild(document.createTextNode(formName));
            h3_form_name.title = formName + " Form";
            h3_form_name.className = "form_name_tooltip";
            first_nested_div.appendChild(h3_form_name);

            //generate check marks
            for (let i = 0; i < approvals.length; i++) {
                console.assert(approvals[i].status != false, {message: "Assertion failed. We cannot have a declined approval in 'inProgressForms'."});

                pawsDB.collection("users").doc(approvals[i].tracksID).get().then(function(doc) {
                    if (doc.exists) {
                        const pawsDoc = doc.data();

                        var span_check_mark = document.createElement('span');
                        span_check_mark.appendChild(document.createTextNode("✓"));

                        var userInfo = pawsDoc.userType;
                        if (userInfo != "Staff") { // then it means it's a Faculty member
                            userInfo = pawsDoc.facultyRole;
                        }
                        span_check_mark.title = '<u>' + userInfo + '</u>' + '</br>' + pawsDoc.name.first + " " + pawsDoc.name.last;

                        if (approvals.length > 0) {
                            span_check_mark.classList.add("w3-margin-left");
                        }
                        if (approvals[i].status == null) {
                            // has not been approved so use the grey check mark style
                            span_check_mark.className = "bubble_tooltip w3-left w3-badge w3-grey w3-large";
                        } else if (approvals[i].status == true) {
                            // Green check mark since it has already been approved..
                            span_check_mark.className = "bubble_tooltip w3-left w3-badge w3-green w3-large";
                        }
                        if (i > 0) {
                            span_check_mark.classList.add("w3-margin-left");
                        }
                        first_nested_div.appendChild(span_check_mark);

                        // Reload "bubble_tooltip" class.
                        $(document).ready(function() {
                            $('.form_name_tooltip').tooltipster({
                                theme: "tooltipster-borderless",
                                side: "top",
                                animation: "grow",
                                functionPosition: function(instance, helper, position){
                                    position.coord.top += 15;
                                    return position;
                                }
                            });

                            $('.bubble_tooltip').tooltipster({
                                theme: "tooltipster-borderless",
                                side: "bottom",
                                animation: "grow",
                                contentAsHTML: true
                            });

                            $('.form_date_tooltip').tooltipster({
                                theme: "tooltipster-borderless",
                                position: "left",
                                animation: "grow",

                            });
                        });
                    } else {
                        // doc.data() will be undefined in this case
                        console.log("No such document!");
                    }
                }).catch(function(error) {
                    console.log("Error getting document:", error);
                });
            }

            // Second nested div (right side)
            var second_nested_div = document.createElement("div");
            second_nested_div.className = "w3-right";

            var h4_submission_date = document.createElement('h3');
            h4_submission_date.appendChild(document.createTextNode("Submission Date: " + submDate));
            h4_submission_date.title = exactSubmDate;
            h4_submission_date.className = "form_date_tooltip";


            second_nested_div.appendChild(h4_submission_date);
            var h4_due_date = document.createElement('h3');

            dueDatePromise.then(function(result) {
                h4_due_date.appendChild(document.createTextNode("Due Date: " + getFormattedDate(result)));
                h4_due_date.style.textAlign = "left";
                h4_due_date.title = getExactDateAndTime(result);
                h4_due_date.className = "form_date_tooltip";

                second_nested_div.appendChild(h4_due_date);
                main_div.appendChild(second_nested_div);
            });

            /*Todo: finish function call for on click, (see below)
            Todo: lines 29-41 should be used above for the in-progress form information.
            */
            main_div.onclick = function(){console.log("clicked")};
            document.getElementById("transit_form_list").appendChild(main_div);
        });
    }).catch(function(error) {
        console.log("Error getting documents (querySnapshot): ", error);
    });
}

/*
This function's purpose is to generate the notifications view for a student on their dashboard.
Todo: Fix this so it works, or generate the html code using JS.
 */

function getNotifications() {
    var txt = '{"message":"David Lee has approved your Registration Form", "time":  "4 min ago"}';
    var obj = JSON.parse(txt);
    console.log(obj.message + " " + obj.time);

    const amountOfNotifications = 2;
    const message = obj.message;
    const time = obj.time;

    for (i = 0; i < amountOfNotifications; i ++) {
        $("#notifications-list").append(
            '<div class="w3-container w3-white w3-margin-bottom">\n' +
            '    <span onclick="this.parentElement.style.display=\'none\'" class="w3-button w3-white w3-large w3-right">&times;</span>\n' +
            '    <div id="message">\n' +
            '        <p>' + message + '</p>\n' +
            '    </div>\n' +
            '    <div class="time">\n' +
            '        <p>' + time + '</p>\n' +
            '    </div>\n' +
            '</div>\n');
    }
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