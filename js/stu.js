function loadPage () {
    // Load "general_dashboard.html" and the rest of the page
    $('#generalDashboard').load("general_dashboard.html", function () {
        // Remove elements that don't apply for a Student
        document.getElementById("studentsBtn").remove();
        document.getElementById("formsManagementBtn").remove();

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
    document.getElementById("pageTitle").innerHTML = "Dashboard";

    // Populate inProgress forms to "inProgressFormsList"
    const studentID = getUserName();
    getStudentForms("dashboardPage", "inProgressFormsList", studentID, "inProgressForms", displayFormReadMode);

    // Unhide "dashboardPage" and get the notifications
    document.getElementById("dashboardPage").style.display = "block";
    getNotifications();
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

    /* Todo: Populate the drafts of this student into "draftsList" right below this */

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
    document.getElementById("pageTitle").innerHTML = "Forms";

    /* Todo: Populate the forms list into "formsList" right below this */
        $("#formsPage").append('<div id = "forms-list-view">\n' +
            '    <input class="w3-button w3-block w3-search-bar-grey w3-round-xlarge w3-large" style="margin-top: 20px; margin-left: auto; margin-right: auto; padding-left: 10px;" type="text" placeholder="Search...">\n' +
            '\n' +
            '    <div class="w3-white w3-panel w3-leftbar w3-border-theme w3-round-xlarge">\n' +
            '        <div class="w3-left">\n' +
            '            <H3 class="w3-left">Registration Form</H3>\n' +
            '            <p></p>\n' +
            '            <p class="w3-left">Used for students to add or drop classes.</p>\n' +
            '        </div>\n' +
            '        <div class="w3-right">\n' +
            '            <button class="w3-margin w3-theme-red w3-btn w3-round-xlarge" onclick="startRegistrationForm()">Start Form</button>\n' +
            '        </div>\n' +
            '    </div>\n' +
            '\n' +
            '    <div class="w3-white w3-panel w3-leftbar w3-border-theme w3-round-xlarge">\n' +
            '        <div class="w3-left">\n' +
            '            <H3 class="w3-left">Closed Class Form</H3>\n' +
            '            <p></p>\n' +
            '            <p class="w3-left">Used for students to get permission to enroll into a class that is full.</p>\n' +
            '        </div>\n' +
            '        <div class="w3-right">\n' +
            '            <button class="w3-margin w3-theme-red w3-btn w3-round-xlarge" onclick="">Start Form</button>\n' +
            '        </div>\n' +
            '    </div>\n' +
            '</div>\n' +
            '\n' +
            '<div id="id01" class="w3-modal">\n' +
            '    <div class="w3-modal-content w3-round-xlarge w3-border-theme w3-bottombar">\n' +
            '        <div class="w3-container">\n' +
            '            <span onclick="closeForm()" class="w3-button w3-display-topright w3-round-xlarge w3-padding">&times;</span>\n' +
            '            <div class="w3-text-theme-red" style="display: block">\n' +
            '                <p></p>\n' +
            '                <H3 class="w3-left">Registration Form</H3>\n' +
            '                <h3 class="w3-right w3-padding-right">Due Date: 12/1/18</h3>\n' +
            '            </div>\n' +
            '            <div id ="first-page">\n' +
            '                <div class="w3-container">\n' +
            '                    <table id="classesTable" class="w3-table">\n' +
            '                        <tr>\n' +
            '                            <th>CRN</th>\n' +
            '                            <th>Prefix</th>\n' +
            '                            <th>Course No.</th>\n' +
            '                            <th>Sec.</th>\n' +
            '                            <th>Course Title</th>\n' +
            '                            <th>CRS.</th>\n' +
            '                            <th>Audit</th>\n' +
            '                        </tr>\n' +
            '                        <!--addCourseRow() is responsible for adding the rows of the table it is inserted here-->\n' +
            '                    </table>\n' +
            '                    <div class="w3-btn w3-theme-red w3-left w3-circle" onclick="addCourseRow()">+</div>\n' +
            '                </div>\n' +
            '\n' +
            '                <br>\n' +
            '                <div>\n' +
            '                    * A student may audit a course with the permission of his or her advisor and payment (if applicable) of an audit fee. An auditor does not receive a grade; an AU is recorded\n' +
            '                    on the transcript in place of the grade if the auditor has, in general, maintained a satisfactory course attendance (usually 75 percent class attendance) and completed the\n' +
            '                    appropriate assignments. If the student does not meet requirements, a final grade of F may be awarded. No changes in registration from credit to audit or from audit to credit\n' +
            '                    will be permitted after the second week of classes.\n' +
            '                </div>\n' +
            '                <br>\n' +
            '                <div id="form-options-1">\n' +
            '                    <button id="discard-option-1" class="w3-button w3-grey w3-round-xxlarge" onclick="closeForm()">Discard</button>\n' +
            '                    <button id="save-option-1" class="w3-button w3-grey w3-round-xxlarge" onclick="saveRegistrationForm(false)">Save</button>\n' +
            '                    <button id="continue-form-1" class="w3-button w3-theme-blue w3-round-xxlarge" onclick="continueForm()">Continue</button>\n' +
            '                </div>\n' +
            '                <br>\n' +
            '            </div>\n' +
            '            <div id = "second-page" style="display: none">\n' +
            '                <table id="confirmClassesTable" class="w3-table">\n' +
            '                    <tr>\n' +
            '                        <th>#</th>\n' +
            '                        <th>CRN</th>\n' +
            '                        <th>Prefix</th>\n' +
            '                        <th>Course No.</th>\n' +
            '                        <th>Sec.</th>\n' +
            '                        <th>Course Title</th>\n' +
            '                        <th>CRS.</th>\n' +
            '                        <th>Audit</th>\n' +
            '                    </tr>\n' +
            '                    <!--continue() is responsible for adding the rows of the table it is inserted here-->\n' +
            '                </table>\n' +
            '                <div>Students are responsible for meeting all published prerequisite requirements for their registered courses to ensure they have the\n' +
            '                    background necessary for successful performance. A student who fails or drops a prerequisite course after registration for the following\n' +
            '                    term, must, in consultation with his/her adviser, submit a “Change in Registration Status” form to add the prerequisite course.\n' +
            '                </div>\n' +
            '                <br>\n' +
            '                <div id="forms-options-2" class="">\n' +
            '                    <button id="back-option-2" class="w3-button w3-grey w3-round-xxlarge" onclick="goBack()">Back</button>\n' +
            '                    <button id="enter-pin-2" class="w3-button w3-grey w3-round-xxlarge" onclick="">Enter Pin</button>\n' +
            '                    <button id="save-option-2" class="w3-button w3-grey w3-round-xxlarge" onclick="saveRegistrationForm(false)">Save</button>\n' +
            '                    <button id="submit-option-2" class="w3-button w3-theme-blue w3-round-xxlarge" onclick="saveRegistrationForm(true)">Submit</button>\n' +
            '                </div>\n' +
            '                <br>\n' +
            '            </div>\n' +
            '        </div>\n' +
            '    </div>\n' +
            '</div>\n');


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
    document.getElementById("pageTitle").innerHTML = "History";

    // Populate completedForms forms to "formsHistoryList"
    const studentID = getUserName();
    getStudentForms("historyPage", "formsHistoryList", studentID, "completedForms", displayFormReadMode);

    // Unhide "historyPage" and get the notifications
    document.getElementById("historyPage").style.display = "block";
    getNotifications();
}

// Get the notifications of the student
/* Todo: make this method dynamic */


function getNotifications() {
    document.getElementById("notificationsList").innerHTML = '';

    formDB.collection("users").doc(getUserName()).collection("notifications").orderBy("timestamp", 'desc').get().then(function(querySnapshot) {
        querySnapshot.forEach(function(notification) {
            const userNotification = notification.data();
            const notificationMessage = userNotification.message;
            const notificationDate = notification.id.toString().split('_')[1];

            $("#notificationsList").append(
                '<div class="w3-container w3-white w3-margin-bottom">\n' +
                '    <span onclick="this.parentElement.style.display=\'none\'" class="w3-button w3-white w3-large w3-right">&times;</span>\n' +
                '    <div id="message">\n' +
                '        <p>' + notificationMessage + '</p>\n' +
                '    </div>\n' +
                '    <div class="time">\n' +
                '        <p>' + moment(notificationDate, "YYYYMMDD hh:mm:ss").fromNow() + '</p>\n' +
                '    </div>\n' +
                '</div>\n');
        });
    }).catch(function(error) {
        console.log("Error getting documents (querySnapshot): ", error);
    });
}

function logOut() {

}

function saveForm() {

}

function retractForm() {

}

function chooseDifferentApprover() {

}

//this is used to generate unique id's for the rows, so we can use the id to get the information from the fields.
let courseUniqueID = 1;

function startRegistrationForm() {
    courseUniqueID = 1; //reset the ids when we restart a form to keep the number low.
    addCourseRow();
    document.getElementById('id01').style.display='block';
}

class DesiredCourse {
    constructor(crn, prefix, course_no, sec, course_title, crs, audit) {
        this.crn = crn;
        this.prefix = prefix;
        this.course_no = course_no;
        this.sec = sec;
        this.course_title = course_title;
        this.crs = crs;
        this.audit = audit;
    }
}

/*
Close the form, don't save any of the information that may have been added into the form, but remove
the used ids for reuse.
 */
function closeForm() {
    $("#classesTable tr").each(function() {
        //nth row with course info.
        let row = this.id.split('-')[1];
        if (row > 0) {
            removeCourseRow(this.id, true);
        }
    });
    document.getElementById('id01').style.display='none'
}

function continueForm() {
    document.getElementById('first-page').style.display='none';

    //erase all old rows, if any, the user may have clicked the back and continue button multiple times.
    removeConfirmationTable();

    document.getElementById('second-page').style.display='block';
    let num = 1;
    $("#classesTable tr").each(function() {
        //nth row with course info.
        let row = this.id.split('-')[1];
        if (row > 0) {
            const crn = document.getElementById("crn-" + row).value;
            const prefix = document.getElementById("prefix-" + row).value;
            const course_no = document.getElementById("course_no-" + row).value;
            const sec = document.getElementById("sec-" + row).value;
            const crs = document.getElementById("crs-" + row).value;
            const course_title = document.getElementById("course_title-" + row).value;

            //todo
            /*let audit;

            if (document.getElementById("audit-" + row).checked == checked) {
                audit = true;
            } else {
                audit = false;
            }*/

            $("#confirmClassesTable").append("<tr id=\"c-row-" + row + "\">\n" +
                "                        <td><id=\"c-crn-" + row + "\" class=\"\" size=\"4\" type=\"text\">" + num + "</td>\n" +
                "                        <td><id=\"c-crn-" + row + "\" class=\"\" size=\"4\" type=\"text\">" + crn + "</td>\n" +
                "                        <td><id=\"c-prefix-" + row + "\" class=\"\" size=\"4\" type=\"text\">" + prefix + "</td>\n" +
                "                        <td><id=\"c-course_no-" + row + "\" class=\"\" size=\"4\" type=\"text\">" + course_no + "</td>\n" +
                "                        <td><id=\"c-sec-" + row + "\" class=\"\" size=\"4\" type=\"text\">" + sec + "</td>\n" +
                "                        <td><id=\"c-course_title-" + row + "\" class=\"\" size=\"20\" type=\"text\">" + course_title + "</td>\n" +
                "                        <td><id=\"c-crs-" + row + "\" class=\"\" size=\"1\" type=\"text\">" + crs + "</td>\n" +
                "                        <td id=\"c-audit-" + row + "\" class=\"w3-center\"><input class=\"w3-check\" type=\"checkbox\"></td>\n" +
                "                    </tr>");

            //todo: figure out value for checkbox.
            num++;
        }
    });
}

/*
The form will be saved if the user presses save or if the form is submitted. Use ifSubmit to know,
if we need to send out form, send notifications update dashboards....
But no matter if you save or submit it, the table needs to be deleted.
Todo: don't save/submit empty forms
 */
function saveRegistrationForm (ifSubmit) {
    var courses_list = [];

    $("#classesTable tr").each(function() {
        //nth row with course info.
        let row = this.id.split('-')[1];
        if (row > 0) {
            courses_list.push(
                //get row information and add it to call
                new DesiredCourse(
                    document.getElementById("crn-" + row).value,
                    document.getElementById("prefix-" + row).value,
                    document.getElementById("course_no-" + row).value,
                    document.getElementById("sec-" + row).value,
                    document.getElementById("course_title-" + row).value,
                    document.getElementById("crs-" + row).value,
                    document.getElementById("audit-" + row).checked) //todo: figure out value for checkbox.
            );

            removeCourseRow(this.id, true);
        }
    });

    if (ifSubmit) { //about to submit
        /*
        todo: send to database (maybe notification).
        todo: remove console log once data gets to where it is needed
        saved the form data in courses_list, print to console to show its representation.*/
        submitRegistrationForm(courses_list);
    } else { //save the form information, we can retrieve it later, then just close the page
        document.getElementById('id01').style.display='none';
        console.log("Form was saved for later", courses_list);
    }

    document.getElementById('second-page').style.display='none';
    document.getElementById('first-page').style.display='block';
}

function goBack() {
    document.getElementById('first-page').style.display='block';
    document.getElementById('second-page').style.display='none';
}

function submitRegistrationForm(courses_list) {
    console.log(moment().format('YYYYMMDD hh:mm:ss')); //20181116 12:42:58 <-- current time format
    console.log(moment("20181116 01:30:00", "YYYYMMDD hh:mm:ss").fromNow());

    console.log("Form was submitted", courses_list);
    document.getElementById('id01').style.display='none';

    //--------will be removed later, but just used to show that we can generate notifications
    formDB.collection("users").doc(getUserName()).collection("notifications").doc("submitRegistration_" + moment().format('YYYYMMDD HH:mm:ss')).set({
        message: "You have just submitted a form",
        timestamp: new Date() //moment().format('YYYYMMDD HH:mm:ss')
    });

    //--------will be removed later, but just used to show that we can add the submitted form
    //to the user's db.
    formDB.collection("users").doc(getUserName()).collection("inProgressForms").doc("Registration_" + moment().format('MMDDYYYYHHmmss')).set({
        approvals: [{date: null, declinedReason: null, status:null, tracksID: getAdvisor(getUserName)},{date: null, declinedReason: null, status:null, tracksID: "bpetty"}],
        content: {"1_Courses": [{"1_CRN": courses_list[0].course_no, "2_Prefix": courses_list[0].prefix, "3_Course No.": courses_list[0].course_no, "4_Section": "1", "5_Course Title": courses_list[0].course_title,
            "6_Days": "MWF", "7_Time": "13:00-13:50", "8_Credits":courses_list[0].crs, "Audit": false}]}
    });

    removeConfirmationTable();
}

/*
When the user selects the '+' to add an additional row, only if the row count is within 8.
*/
function addCourseRow(){
    let num_rows = $('#classesTable tr').length-1;
    if (num_rows == 8) {
        alert("Only up to 8 courses are allowed to be added to this form!");
    } else {
        courseUniqueID++;

        $("#classesTable").append("                    <tr id=\"row-" + courseUniqueID + "\">\n" +
            "                        <td><input id=\"crn-" + courseUniqueID + "\" class=\"w3-input\" size=\"4\" type=\"text\"></td>\n" +
            "                        <td><input id=\"prefix-" + courseUniqueID + "\" class=\"w3-input\" size=\"4\" type=\"text\"></td>\n" +
            "                        <td><input id=\"course_no-" + courseUniqueID + "\" class=\"w3-input\" size=\"4\" type=\"text\"></td>\n" +
            "                        <td><input id=\"sec-" + courseUniqueID + "\" class=\"w3-input\" size=\"4\" type=\"text\"></td>\n" +
            "                        <td><input id=\"course_title-" + courseUniqueID + "\" class=\"w3-input\" size=\"20\" type=\"text\"></td>\n" +
            "                        <td><input id=\"crs-" + courseUniqueID + "\" class=\"w3-input\" size=\"1\" type=\"text\"></td>\n" +
            "                        <td id=\"audit-" + courseUniqueID + "\" class=\"w3-center\"><input class=\"w3-check\" type=\"checkbox\"></td>\n" +
            "                        <td class=><p class=\"w3-xlarge\" style=\"margin-top: -3px\" onclick=\"removeCourseRow('row-"+ courseUniqueID + "')\">x</p></td>\n" +
            "                    </tr>");
    }
}

/*
When the user selects the 'x' for a course row remove (not hide) the row, only if the row count is more than 1.
removeAll is true when the form is submitted; at this time there is no need to keep those elements now
because the data is already saved.
 */
function removeCourseRow(id, removeAll) {
    let num_rows = $('#classesTable tr').length-1;
    if (num_rows > 1 || removeAll) {
        document.getElementById(id).remove();
    } else {
        alert("At least one course must be present on this form");
    }
}


/*
delete the whole table for the confirmation table as well, so this id can get reused.
 */
function removeConfirmationTable() {
    //erase all rows from confirmation table after submitting the form or when entering the
    // continuation page, in order to regenerate a new confirmation table.
    $("#confirmClassesTable tr").each(function() {
        let row = this.id.split('-')[2];
        console.log(row);
        if (row > 0) {
            document.getElementById("c-row-" + row).remove();
        }
    });
}

function getAdvisor(studentUsername) {
    return "eshelton";
}