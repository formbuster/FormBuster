var xmlhttp = new XMLHttpRequest();
let copy; //value set at 85. //todo: delete

function getWaiverResultsQuery() {

    return copy;
}

class Course {
    constructor(crn, prefix, course_no, sec, title, crs, days, beginTime, endTime, instructor) {
        this.crn = crn;
        this.prefix = prefix;
        this.course_no = course_no;
        this.sec = sec;
        this.title = title;
        this.crs = crs;
        this.days = days;
        this.beginTime = beginTime;
        this.endTime = endTime;
        this.instructor = instructor;
        //todo: multiple class meetings for a course
    }
}

/*
This will take in the user query and user selected term, and return courses for that semester.
The user may type in a:
    prefix code for a course, ex: CSE
    prefix code and a course no, ex: CSE 1001 (Typing in 'CSE 1' will show all 1000 level CSE courses).
    title or partial title of a course, ex: aviation
    CRN, ex: 22339
 */
function getCourse() {
    let filterCRNResults = false;
    let filterCourseNoResults = false;

    if (document.getElementById("profileurl").value.length < 3) {
        return;
    } else {
        $('#animated-gif').show();

        if (/^\d+$/.test(document.getElementById("profileurl").value)) { //user only entered numbers, assume it is a CRN
            filterCRNResults = true;
            xmlhttp.open('GET', 'http://api.fit.edu/courses/v1/courses?term='+ document.getElementById("termSelecter").value + '&crn=' + document.getElementById("profileurl").value, true);
        } else {
            if (/^[a-zA-Z]+$/.test(document.getElementById("profileurl").value)) {  //user only entered alphabet
                if (document.getElementById("profileurl").value.length == 3) { //user probably entered in a Prefix
                    xmlhttp.open('GET', 'http://api.fit.edu/courses/v1/courses?term=' + document.getElementById("termSelecter").value + '&subject=' + document.getElementById("profileurl").value, true);
                } else { //check titles.
                    xmlhttp.open('GET', 'http://api.fit.edu/courses/v1/courses?term=' + document.getElementById("termSelecter").value + '&title=' + document.getElementById("profileurl").value, true);
                }
            } else { //user probably entered in a prefix course no combination.
                if (document.getElementById("profileurl").value.length >= 5 && document.getElementById("profileurl").value.length <= 8) {
                    xmlhttp.open('GET', 'http://api.fit.edu/courses/v1/courses?term=' + document.getElementById("termSelecter").value + '&subject=' + document.getElementById("profileurl").value.substring(0, 3) + '&course_number=' + document.getElementById("profileurl").value.substring(4), true);
                    filterCourseNoResults = true;
                } else {
                    document.getElementById("courseResultsMessage").innerText = "No results found";
                    $('#animated-gif').hide(); //get rid of the loading gif.
                    return;
                }
            }
        }
        xmlhttp.send();
    }

    //every time a letter is typed, empty the innertext to start over the query
    document.getElementById("searchRegistrationResults").innerText = "";
    document.getElementById("courseResultsMessage").innerText = "";

    xmlhttp.onload = function () {
        if (this.responseText.includes("\"status\":\"fail\"")) {
            document.getElementById("courseResultsMessage").innerText = "No results found";
            $('#animated-gif').hide(); //get rid of the loading gif.
        } else if (this.readyState === 4 && this.status === 200) {
            var myObj;

            if (filterCRNResults) {
                var filtered_results = JSON.parse(this.response);
                let i = 0;
                while (filtered_results.records[i] != null) {
                    if (!(filtered_results.records[i].crn.toString()).startsWith(document.getElementById("profileurl").value)) {
                        filtered_results.records.splice(i, 1); //remove the result that doesn't fit the query.
                    } else {
                        i++;
                    }
                }
                if (filtered_results.records.length == 0) { //the query didn't match any results once we filtered the original results.
                    document.getElementById("courseResultsMessage").innerText = "No results found";
                    $('#animated-gif').hide(); //get rid of the loading gif.
                    return;
                }
                myObj = filtered_results; //display these results instead of using the original results given from the api.
            } else if (filterCourseNoResults) {
                var filtered_results = JSON.parse(this.response);
                let i = 0;
                while (filtered_results.records[i] != null) {
                    if (!(filtered_results.records[i].course_number.toString()).startsWith(document.getElementById("profileurl").value.replace(/[a-z A-z]/g, ''))) {
                        filtered_results.records.splice(i, 1); //remove the result that doesn't fit the query.
                    } else {
                        i++;
                    }
                }
                if (filtered_results.records.length == 0) { //the query didn't match any results once we filtered the original results.
                    document.getElementById("courseResultsMessage").innerText = "No results found";
                    $('#animated-gif').hide(); //get rid of the loading gif.
                    return;
                }
                myObj = filtered_results; //display these results instead of using the original results given from the api.
            } else {
                myObj = JSON.parse(this.response); //use original results from api, because there's no need to filter the results.
            }

            copy = myObj;

            fillResults(myObj, "searchRegistrationResults");

            $('#animated-gif').hide(); //get rid of the loading gif.
        }
    };
}

function fillResults(myObj, placeholder){
    i = 0;//next course incrementer, and used to id the courses
    let accordionId = 0;

    if (myObj.records[i] != null) {
        var currentTitle = "";
        while (myObj.records[i] != null) {
            let courseResult = new Course (myObj.records[i].crn, myObj.records[i].subject, myObj.records[i].course_number, myObj.records[i].section,
                myObj.records[i].title,  myObj.records[i].credit_hours, myObj.records[i].days, myObj.records[i].begin_time, myObj.records[i].end_time, myObj.records[i].instructor);

            if (currentTitle != courseResult.title) { //new title, create a new accordion.
                generateNewCourseRowAccordion(placeholder,i, courseResult);
                accordionId = i; //there was a new accoridon row created at ith course, the current course needs to be added into the accordion, it will use the same accordion.
            }

            addCourseToAccordion(i, accordionId, courseResult , "", "");
            currentTitle = myObj.records[i].title;
            i++;
        }

        //after filtering results, there may not be any matches.
        if (document.getElementById("searchRegistrationResults").innerText == "") {
            document.getElementById("courseResultsMessage").innerText = "No results found";
            $('#animated-gif').hide(); //get rid of the loading gif.
        } else {
            $("#courseResultsMessage").append("                     <br><div class=\"w3-container w3-theme-red\">\n" +
                "                                        <p>Select a course title below, and select the 'Add Course' button that corresponds to the correct course.</p>\n" +
                "                                    </div>\n" +
                "                                    <br>");
        }
    }
}

function addCourseToAccordion(courseId, courseAccordionId, course, additonalDay, additionalTime) {
    //used to get alternating row colors. todo: grey should always be row 1.
    var rowColor = "FFFFFF";
    if (courseId % 2 == 0) {
        rowColor = "EEEEEE";
    }

    //todo: fix course number for MTH 0111
    let string2 = course.course_no.toString()+"";

    if (document.getElementById("courseAccordion" + courseAccordionId)) {
        document.getElementById("courseAccordion" + courseAccordionId).innerHTML += " <tr id=\"course" + course.crn + "\" bgcolor=\"" + rowColor + "\">\n" +
            "                                                <td id = \'crn" + course.crn + "\'>" + course.crn + "</td>\n" +
            "                                                <td id = \'sec" + course.crn + "\'>" + course.sec + "</td>\n" +
            "                                                <td id = \'days" + course.crn + "\'>" + course.days + "</td>\n" +
            "                                                <td id = \'time" + course.crn + "\'>" + course.beginTime + "-" + course.endTime + "</td>\n" +
            "                                                <td id = \'crs" + course.crn + "\'>" + course.crs + "</td>\n" +
            "                                                <td>" + course.instructor + "</td>\n" +
            "                                                <td><button id=\'regButton" + course.crn + "\' onclick='register(false," + course.crn + ",\"" + course.title + "\",\"" + course.prefix + "\"," + string2 + ")'>Add Course</button></td>\n" +
            "                                            </tr>\n";

        //check to see if the user already added the course, if so, they shouldn't be able to add the same course again.
        if (crns.indexOf(course.crn.toString()) >= 0 || crns.indexOf(course.crn) >= 0) {
            document.getElementById("regButton" + course.crn).innerText = "Remove Course";
        }
    }
    //todo: figure out how to get the lab times for a class.
    // "                                            <tr bgcolor=\"EEEEEE\">\n" +
    // "                                                <td></td>\n" +
    // "                                                <td></td>\n" +
    // "                                                <td>M</td>\n" +
    // "                                                <td>1500-1550</td>\n" +
    // "                                                <td></td>\n" +
    // "                                                <td></td>\n" +
    // "                                                <td></td>\n" +
    // "                                            </tr>\n" +
}

let waivers = [];

/*
Course is the Course Object that stores a course's information.
 */
function generateNewCourseRowAccordion(div ,rowID, course) {
    div = "#" + div;
    if (div === "#searchRegistrationResults") {
        $(div).append("<button onclick=\"myFunc('CourseSlider" + rowID + "')\" class=\"w3-padding-16 w3-button w3-block w3-left-align w3-lightgrey w3-leftbar w3-border-theme w3-round-large\">" + "+  " + course.prefix + " " + course.course_no + " " + course.title + "</button>\n");
        $(div).append("                                    <div id=\"CourseSlider" + rowID + "\" class=\"w3-hide w3-card\">\n" +
            "                                        <table id=\"courseAccordion" + rowID + "\" class=\"w3-table\">\n" +
            "                                            <tr>\n" +
            "                                                <th>CRN</th>\n" +
            "                                                <th>Sec.</th>\n" +
            "                                                <th>Days</th>\n" +
            "                                                <th>Time</th>\n" +
            "                                                <th>CRS.</th>\n" +
            "                                                <th>Instructor</th>\n" +
            "                                                <th></th>\n" +
            "                                            </tr>\n" +
            "                                        </table>\n" +
            "\n" +
            "                                    </div><hr style='height:1px; padding:2px;  margin:0px;'>\n")
    } else if (div === "#searchWaiverTableResults") {
        $(div).append("<button id='addCoPrerequisite" + course.prefix + course.course_no + "'onclick=\"addCoPrerequiste('CourseSlider" + rowID + "','" + course.course_no + "','" + course.title + "','" + course.prefix + "')\" class=\"w3-padding-16 w3-button w3-block w3-left-align w3-lightgrey w3-leftbar w3-border-theme w3-round-large\">" + "+  " + course.prefix + " " + course.course_no + " " + course.title + "</button>\n");
        if (waivers.indexOf(course.prefix + "" + course.course_no) > -1) {
            document.getElementById("addCoPrerequisite"+ course.prefix + course.course_no).disabled = true;
        }
    }
}

let currentOpen = "";
function myFunc(id) {
    var x = document.getElementById(id);
    if (x.className.indexOf("w3-show") == -1) { //open
        if (currentOpen !== "") {
            currentOpen.className = currentOpen.className.replace(" w3-show", ""); //close the previous open
        }
        x.className += " w3-show"; //open the current one.
        currentOpen = document.getElementById(id); //change id, so this one can close when a different one is opened.
    } else { //close
        x.className = x.className.replace(" w3-show", "");
    }
}

function addCourseTableHeader() {
    //todo: fix the p tag, for the co/preq form.
    $("#registrationTableResults").append("     <br><div id=\"registrationResultsMessage\" class=\"w3-container w3-theme-red\">\n" +
        "                                       <p>Select the corresponding check boxes if any courses will be added as an Audit or Continuing Education Unit (CEU). Review table before submitting. Delete added courses using the 'X', if needed.</p>\n" +
        "                                    </div>\n" +
        "                                    <br>   " +
        "<table id=\"registrationResults\" class=\"w3-table\">\n" +
        "                                            <tr>\n" +
        "                                                <th>CRN</th>\n" +
        "                                                <th>Prefix</th>\n" +
        "                                                <th>Course No</th>\n" +
        "                                                <th>Sec.</th>\n" +
        "                                                <th>Course Title</th>\n" +
        "                                                <th>Days</th>\n" +
        "                                                <th>Time</th>\n" +
        "                                                <th>CRS.</th>\n" +
        "                                                <th>Audit</th>" +
        "                                                <th>CEU</th>" +
        "                                                <th></th>"+
        "                                            </tr>\n" +
        "                                        </table>\n");
}

function setUpCoPrerequisiteDraft(content) {
    let headerAdded = false;

    for (var formSection in content) {
        if (formSection == "1_Course Requested for Registration") {
            if (Array.isArray(content[formSection])) {
                let array = content[formSection];
                for (let i = 0; i < array.length; i++) {
                    if (!headerAdded) { //only add table header once.
                        headerAdded = true;
                        addCourseTableHeader();
                    }
                    addResultToCoursesTable(array[i]['1_CRN'], array[i]['2_Prefix'], array[i]['3_Course No.'],
                        array[i]['4_Section'], array[i]['5_Course Title'], array[i]['6_Days'], array[i]['7_Time'],
                        array[i]['8_Credits'], array[i]['9_Audit']);

                    document.getElementById("profileurl").disabled = true;
                    document.getElementById("totalCredits").style.display = "none";
                    document.getElementById("remove" + array[i]['1_CRN']).style.display = "none"; //don't allow removing the course.
                    finishUpCoPreqForm();


                    // addCoPrerequiste("", array[i]['3_Course No.'], array[i]['5_Course Title'], array[i]['2_Prefix']);
                    /*
                   todo: implement ceu and ceu db spot
                    */
                }
            }
        } else if (formSection == "2_Missing Corequisite(s) or Prerequisite(s)") {
            let array = content[formSection];
            for (var i = 0; i < array.length; i++)
            {
                addCoPrerequiste("", array[i]['2_Course No.'], array[i]['3_Course Title'], array[i]['1_Prefix']);
            }
        } else if (formSection == "2_Missing Corequisite(s) or Prerequisite(s)") {
            let array = content[formSection];
            for (var i = 0; i < array.length; i++)
            {
                addCoPrerequiste("", array[i]['2_Course No.'], array[i]['3_Course Title'], array[i]['1_Prefix']);
            }
        } else if (formSection == "3_Justifcation for the Waiver") {
            let justification = content[formSection];

            if (justification["1_Justification"] != "") {
                document.getElementById("justificationTextField").value = justification["1_Justification"];
            }
        }
    }


}

function setUpRegistrationDraft(content) {
    let headerAdded = false;

    for (var formSection in content) {
        if (Array.isArray(content[formSection])) {
            let array = content[formSection];
            for (let i = 0; i < array.length; i++) {
                if (!headerAdded) { //only add table header once.
                    headerAdded = true;
                    addCourseTableHeader();
                }
                addResultToCoursesTable(array[i]['1_CRN'], array[i]['2_Prefix'], array[i]['3_Course No.'],
                    array[i]['4_Section'], array[i]['5_Course Title'], array[i]['6_Days'], array[i]['7_Time'],
                    array[i]['8_Credits'], array[i]['9_Audit']);
                /*
               todo: implement ceu and ceu db spot
                */
            }
        }
    }
}

let coursesCount = 0;
let creditsCount = 0;
var crns = [];

function addResultToCoursesTable(course, prefix, course_no, sec, title, days, time, crs, auditIsChecked, ceuIsChecked) {
    $("#registrationResults").append("<tr id='registeredCourse"+ course + "'><td id='registeredCrn"+ course + "'>" + course +"</td>\n" +
        "<td id='registeredPrefix"+ course + "'>" + prefix +"</td>\n" +
        "<td id='registeredCourseNo"+ course + "'>" + course_no +"</td>\n"+
        "<td id='registeredSec"+ course + "'>" + sec +"</td>\n" +
        "<td id='registeredTitle"+ course + "'>" + title +"</td>\n" +
        "<td id='registeredDays"+ course + "'>" + days +"</td>\n"+
        "<td id='registeredTime"+ course + "'>" + time +"</td>\n"+
        "<td id='registeredCrs"+ course + "'>" + crs +"</td>\n"+
        "<td><input class=\"w3-check\" onclick='auditCourse(" + course + ")' id=\"audit" + course + "\"type=\"checkbox\"></td>\n"+
        "<td><input class=\"w3-check\" onclick='adjustCreditsForCEU(" + course + ")' id=\"ceu" + course + "\"type=\"checkbox\"></td>\n"+
        "<td id='remove"+ course +"'" +" onclick='remove(" + course +")'>X</td>\n"+
        "</tr>"
    );

    if (auditIsChecked) {
        document.getElementById("audit"+course).checked = true;
    }

    //todo: call method here, to look through each row of the registrationResults and update to row colors to alternate.

    creditsCount += parseInt(crs);

    document.getElementById("termSelecter").disabled = true;
    document.getElementById("totalCredits").innerText = "Total credits: " + creditsCount;
    document.getElementById("emptyFormMessage").style.display = "none";

    crns.push(course);

    coursesCount++;
}

function register(isAudit, course, title, prefix, course_no) {
    //the user selected add course, and the course was not already in the form.
    if (document.getElementById("regButton" + course).innerText == "Add Course" && crns.indexOf((document.getElementById("crn" + course)).innerText) == -1) {
        document.getElementById("regButton" + course).innerText = "Remove Course"; //course was added to the form, all them to be able to remove it later

        if (coursesCount == 0) { //the form was empty, so there is no table, give instructions and start the table by adding the top row.
            addCourseTableHeader();
        }

        addResultToCoursesTable(course, prefix, course_no, document.getElementById("sec" + course).innerText, title,
            document.getElementById("days" + course).innerText, document.getElementById("time" + course).innerText,
            document.getElementById("crs" + course).innerText);

        //get rid of search results.
        $("#courseResultsMessage").html('');
        document.getElementById("searchRegistrationResults").innerText = "";
        //empty the text field of any input, reset it so it shows the placeholder text.
        document.getElementById('profileurl').value = '';

        //behavior for the co preqreusite form.
        if (document.getElementById("co-prerequisite-form")){
            document.getElementById("profileurl").disabled = true;
            document.getElementById("totalCredits").style.display = "none";
            document.getElementById("remove" + course).style.display = "none"; //don't allow removing the course.
            finishUpCoPreqForm();
        }
    } else { //user selected to remove that particular course.
        //behavior for the co preqreusite form. todo: when user deleted the course, it does not reenable the search bar.
        if (document.getElementById("profileurl").disabled == true) {
            document.getElementById("profileurl").disabled = false;
        }

        remove(course);
    }
}

function remove (course) {
    if (document.getElementById("regButton" + course) != null) {
        document.getElementById("regButton" + course).innerText = "Add Course"; //user still has this search result still up.
    } //if not, no need to change the element because it doesn't exist, when it exists, it will appear correct.

    if (document.getElementById("registeredCrs" + course) != null) {
        if (!document.getElementById("registeredCrs" + course).innerHTML.includes("<s>")) {
            creditsCount -= parseInt(document.getElementById("registeredCrs" + course).innerText);
        }
    }

    document.getElementById('registeredCourse' + course).remove();
    crns.splice(crns.indexOf(course.toString()),1);

    coursesCount--;

    if (coursesCount == 0 && creditsCount == 0) { //remove the message, table and credits count, there's no courses to display.
        document.getElementById('registrationResultsMessage').remove();
        document.getElementById('registrationResults').remove();
        document.getElementById("totalCredits").innerText = "";
        document.getElementById("registrationTableResults").innerHTML ="";

        //no classes are added, allow the user to change the term if needed.
        document.getElementById("termSelecter").disabled = false;
    }

    if (creditsCount != 0) {
        document.getElementById("totalCredits").innerText = "Total credits: " + creditsCount;
    }
}

function adjustCreditsForCEU (course) {
    if (document.getElementById("ceu" + course).checked == true) {

        //disable audit option
        document.getElementById("audit" + course).disabled = true;

        //strike out credits, because taking a CEU course means no credits will be awared.
        document.getElementById("registeredCrs" + course).innerHTML = "<s>" + document.getElementById("registeredCrs" + course).innerText +"</s>";

        creditsCount -= parseInt(document.getElementById("registeredCrs" + course).innerText);

        document.getElementById("totalCredits").innerText = "Total credits: " + creditsCount;
    } else {
        //enable audit option
        document.getElementById("audit" + course).disabled = false;

        //add back the credits in
        document.getElementById("registeredCrs" + course).innerHTML = document.getElementById("registeredCrs" + course).innerText;

        creditsCount += parseInt(document.getElementById("registeredCrs" + course).innerText);

        document.getElementById("totalCredits").innerText = "Total credits: " + creditsCount;
    }
}

function auditCourse (course) {
    if (document.getElementById("audit" + course).checked == true) {
        //disable audit option
        document.getElementById("ceu" + course).disabled = true;
    } else {
        //enable audit option
        document.getElementById("ceu" + course).disabled = false;
    }
}

/*
currently only used by stu coord/faculty only
 */
function saveFormAsDraft(studentUsername, courses_list, term){
    pawsDB.collection("users").doc(getUserName()).get().then(function(userDoc) {
        if (userDoc.exists) {
            const userDocData = userDoc.data();

            formDB.collection("users").doc(studentUsername).collection("drafts").doc("Registration_" + moment().format('MMDDYYYYHHmmss')).set({
                content: {"1_Courses": courses_list, "2_Term": term}
                //todo: term isn't working.
            });
        }
    });
}

/*
currently only used by Stu coord/faculty only
 */
function sendRegistrationForm(studentUsername) {
    let courses_list = [];
    for (i = 0; i < crns.length; i++) {
        courses_list.push({
            "1_CRN": document.getElementById("registeredCrn" + crns[i]).innerText.toString(),
            "2_Prefix": document.getElementById("registeredPrefix" + crns[i]).innerText.toString(),
            "3_Course No.": document.getElementById("registeredCourseNo" + crns[i]).innerText,
            "4_Section": document.getElementById("registeredSec" + crns[i]).innerText,
            "5_Course Title": document.getElementById("registeredTitle" + crns[i]).innerText,
            "6_Days": document.getElementById("registeredDays" + crns[i]).innerText,
            "7_Time": document.getElementById("registeredTime" + crns[i]).innerText,
            "8_Credits": document.getElementById("registeredCrs" + crns[i]).innerText,
            "9_Audit": document.getElementById("audit" + crns[i]).checked == true,
        });
    }

    saveFormAsDraft(studentUsername, courses_list, document.getElementById("termSelecter").value);
    closeForm();
    displayConfirmationMessage("formsList","Your form has been sent!");
}

/*
The form will be saved if the user presses save or if the form is submitted. Use ifSubmit to know,
if we need to send out form, send notifications update dashboards....
But no matter if you save or submit it, the table needs to be deleted.
 */
function saveRegistrationForm (ifSubmit, page) {
    let term = document.getElementById("termSelecter").value;

    if (crns.length == 0) { //no forms will be submitted.
        document.getElementById("emptyFormMessage").style.display = "block";
        return;
    }

    let courses_list = [];
    for (i = 0; i < crns.length; i++) {
        courses_list.push({
            "1_CRN": document.getElementById("registeredCrn" + crns[i]).innerText.toString(),
            "2_Prefix": document.getElementById("registeredPrefix" + crns[i]).innerText.toString(),
            "3_Course No.": document.getElementById("registeredCourseNo" + crns[i]).innerText,
            "4_Section": document.getElementById("registeredSec" + crns[i]).innerText,
            "5_Course Title": document.getElementById("registeredTitle" + crns[i]).innerText,
            "6_Days" : document.getElementById("registeredDays" + crns[i]).innerText,
            "7_Time" : document.getElementById("registeredTime" + crns[i]).innerText,
            "8_Credits" : document.getElementById("registeredCrs" + crns[i]).innerText,
            "9_Audit" : document.getElementById("audit" + crns[i]).checked == true,
        });
    }

    pawsDB.collection("users").doc(getUserName()).get().then(function(userDoc) {
        if (userDoc.exists) {
            const userDocData = userDoc.data();
            let advisor = userDocData.advisor.advisorUsername;

            if (ifSubmit) {
                let currentTime = moment().format('MMDDYYYYHHmmss');
                formDB.collection("users").doc(getUserName()).collection("inProgressForms").doc("Registration_" + currentTime).set({
                    approvals: [{date: null, declinedReason: null, status:null, tracksID: advisor},{date: null, declinedReason: null, status:null, tracksID: "bpetty"}],
                    content: {"1_Courses": courses_list} //todo: save the term to the db
                });

                formDB.collection("users").doc(advisor).collection("pendingForms").doc("pendingForm_" + currentTime).set({
                    formRef: formDB.collection("users").doc(getUserName()).collection("inProgressForms").doc("Registration_" + currentTime)
                });
                displayConfirmationMessage(page, "Your form has been submitted! Check your dashboard for form progress.");
            } else { //just save it for later
                formDB.collection("users").doc(getUserName()).collection("drafts").doc("Registration_" + moment().format('MMDDYYYYHHmmss')).set({
                    content: {"1_Courses": courses_list, "2_Term": term}
                });
                displayConfirmationMessage(page, "Your form has been saved! Go to drafts to revise and submit your form.");
            }
        }
    });
    closeForm();
}

/*
Close the form, don't save any of the information that may have been added into the form, but remove
the used ids for reuse.
 */
function closeForm() {
    // /*
    // fac/staff
    //  */
    // document.getElementById("startAFormMessage").innerText = "";
    //
    // document.getElementById('registration-form').style.display='none';
    //
    // //reset the term selecter in the form to the default value option.
    // document.getElementById('termSelecter').selectedIndex = 0;
    //
    // //re enable to term selecter
    // document.getElementById("termSelecter").disabled = false;
    //
    // //empty the text field of any input, reset it so it shows the placeholder text.
    // document.getElementById('profileurl').value = '';

    crns.splice(0,crns.length);
    waivers.splice(0,waivers.length);
    coursesCount = 0;
    creditsCount = 0;


    // //get rid of messages, results and credit total, it will be regenerated later when user starts another form.
    // $( "#courseResultsMessage" ).html('');
    // $( "#url").html('');
    // $( "#registrationTableResults").html('');
    // $( "#totalCredits").html('');
    if (document.getElementById("currentFormOpen")) {
        document.getElementById("currentFormOpen").innerHTML = "";
    } else { //draft
        document.getElementById("editDraft").innerHTML = "";
    }
}
