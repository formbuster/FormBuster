// Constants for when a button in the sidebar is highlighted or not
const btnHighlighted = "w3-bar-item w3-button w3-hover-theme w3-large w3-text-theme-red w3-background";
const btnNotHighlighted = "w3-bar-item w3-button w3-hover-theme w3-large";

// Number of weeks that forms are open before the earliest date of each term
// Used in "getTermsAvailableForForms()", "getTermsUnavailableForForms()", and "getFormOpenDate()"
const weeksBefore = 3;

// The form will be due this number of days before earliest day of this category of student ("schoolYear").
// This will be this form's first due date, of 2; second due date will be when the form closes for everyone.
// Used in "getFormDueDate()"
const daysBefore = 3;

// Only applicable for Students, Faculty, and Staff
function openNavToggle () {
    const mySidebar = document.getElementById("mySidebar");

    if (mySidebar.style.display === "none") {
        document.getElementById("mainContent").style.marginLeft = "15%";
        document.getElementById("mainContent").style.width = "64%";
        document.getElementById("mySidebar").style.width = "15%";
        document.getElementById("mySidebar").style.display = "block";
    } else {
        document.getElementById("mainContent").style.marginLeft = "0%";
        document.getElementById("mainContent").style.width = "79%";
        document.getElementById("mySidebar").style.display = "none";
        document.getElementById("openNav").style.display = "inline-block";
    }
}

// Only applicable for Students, Faculty, and Staff
function checkWindowWidth () {
    if (window.innerWidth < 940) {
        document.getElementById("mainContent").style.marginLeft = "0%";
        document.getElementById("mainContent").style.width = "79%";
        document.getElementById("mySidebar").style.display = "none";
        document.getElementById("openNav").style.display = "inline-block";
    } else {
        document.getElementById("mainContent").style.marginLeft = "15%";
        document.getElementById("mainContent").style.width = "64%";
        document.getElementById("mySidebar").style.width = "15%";
        document.getElementById("mySidebar").style.display = "block";
        document.getElementById("openNav").style.display = "none";
    }
}

function getUserName() {
    let username = window.location.href.toString().substring(window.location.href.toString().indexOf("user")+5).toString();

    if (username.endsWith('#')) {
        let length = username.length;
        return username.substring(0, parseInt(length)-1).toString();
    }
    return window.location.href.toString().substring(window.location.href.toString().indexOf("user")+5).toString();
}

// Get the user's full name
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

// Returns the school year correpondent to their total credits
function getSchoolYear (totalCredits) {
    if (0 <= totalCredits && totalCredits <= 29) {
        return "Freshman";
    } else if (30 <= totalCredits && totalCredits <= 55) {
        return "Sophomore";
    } else if (56 <= totalCredits && totalCredits <= 84) {
        return "Junior";
    } else if (85 <= totalCredits) {
        return "Senior";
    } else {
        return "ERROR in 'getSchoolYear()'";
    }
}

// Get submission date from a Firebase "doc", in the format: MM/DD/YYYY
function getSubmDate (doc) {
    return getFormattedDate(getDateFromTimestamp(doc.id.toString().split('_')[1]));
}

// Get exact submission date and time from a Firebase "doc", in the format: MM/DD/YYYY at HH:MM:SS
function getExactSubmDate (doc) {
    return getExactDateAndTime(getDateFromTimestamp(doc.id.toString().split('_')[1]));
}

function getFormID (doc) {
    return doc.id.toString().split('_')[0];
}

// Get the name of the form from a "formID"
function getFormNameFromID (formID) {
    formID = formID.toLowerCase();

    let formName = "ERROR";
    if (formID === "registration") {
        formName = "Registration";
    } else if (formID === "coprerequisite") {
        formName = "Co/Prerequisite Waiver Request";
    }

    return formName;
}
// Get the name of the form from a Firebase "doc"
function getFormName (doc) {
    const formID = getFormID(doc);

    let formName = "ERROR";
    if (formID === "Registration") {
        formName = "Registration";
    } else if (formID === "Coprerequisite") {
        formName = "Co/Prerequisite Waiver Request";
    }

    return formName;
}

// Get the due date for the "formName" of this "term", while taking into account the "totalCredits" of this student
// IMPORTANT: "referenceDate" is used as a reference for the form due dates gathered in "getFormDatesForAllTerms()"
function getFormDueDate (formName, term, studentID, referenceDate) {
    const formDates = getFormDatesForAllTerms(referenceDate);

    const currentDate = moment();

    formName = formName.toLowerCase();
    term = term.toLowerCase();

    return pawsDB.collection("users").doc(studentID).get().then(function(doc) {
        if (doc.exists) {
            const docData = doc.data();
            const totalCredits = docData.totalCredits;

            // Error checking message (debugging purposes)
            if (docData.userType != "Student") {
                alert("ERROR: Not a student in 'getFormDueDate()'");
            }

            const schoolYear = getSchoolYear(totalCredits);
            let dayOfWeek;
            if (schoolYear == "Senior") {
                dayOfWeek = "Monday";
            } else if (schoolYear == "Junior") {
                dayOfWeek = "Tuesday";
            } else if (schoolYear == "Sophomore") {
                dayOfWeek = "Wednesday";
            } else if (schoolYear == "Freshman") {
                dayOfWeek = "Thursday";
            } else {
                dayOfWeek = "ERROR";
            }

            let dueDate;
            // Adjust the earliest day of the "term" to match with the "schoolYear" of the student (using "dayOfWeek")
            eval(`dueDate = formDates.${formName}.${term}_earliestDate.day("${dayOfWeek}").subtract(${daysBefore}, 'day');`);

            // If the "dueDate" has passed, then the new due date will be the latest day for this "term"
            // This means that "dueDate" is before "currentDate"
            if (dueDate.diff(currentDate) < 0) {
                eval(`dueDate = formDates.${formName}.${term}_latestDate;`);
            }

            return dueDate;
        }
    });
}

function getFormOpenDate (formName, fullTerm) {
    const formDates = getFormDatesForAllTerms(moment());

    formName = formName.toLowerCase();
    const term = fullTerm.split(' ')[0].toLowerCase();

    let dueDate;
    eval(`dueDate = formDates.${formName}.${term}_earliestDate.subtract(${weeksBefore}, 'week');`);

    return dueDate;
}

function getFormCloseDate (formName, fullTerm) {
    const formDates = getFormDatesForAllTerms(moment());

    formName = formName.toLowerCase();
    const term = fullTerm.split(' ')[0].toLowerCase();

    let dueDate;
    eval(`dueDate = formDates.${formName}.${term}_latestDate;`);

    return dueDate;
}

// Generate a Date object from a timestamp of the format: MMDDYYYYHHMMSS
function getDateFromTimestamp (timestamp) {
    const month = timestamp.substring(0, 2);
    const day = timestamp.substring(2, 4);
    const year = timestamp.substring(4, 8);
    const hour = timestamp.substring(8, 10);
    const minute = timestamp.substring(10, 12);
    const second = timestamp.substring(12, 14);

    const date = new Date (year, month - 1, day, hour, minute, second, 0);
    return date;
}

// Get an exact date and time String representation of the Date object given
function getExactDateAndTime (date) {
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const year = date.getFullYear().toString();

    const hour = date.getHours();
    const min = date.getMinutes();
    const second = date.getSeconds();

    const formattedSubmDate = month + "/" + day + "/" + year + " at " + ("00" + hour).substr(-2,2) + ":"
        + ("00" + min).substr(-2,2) + ":" + ("00" + second).substr(-2,2);

    return formattedSubmDate;
}

// Get a formatted date String representation of a Date object, to show in the forms
function getFormattedDate (date) {
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const year = date.getFullYear().toString().substr(-2);

    const fullDate = month + "/" + day + "/" + year;
    return fullDate;
}

/* NOT BEING USED CURRENTLY, BUT MIGHT BE HELPFUL IN THE FUTURE */
function capitalizeStrings (str) {
    const strArray = str.split(" ");

    let newStr = "";
    for (let i = 0; i < strArray.length; i++) {
        let temp = strArray[i].toLowerCase();
        newStr += temp.charAt(0).toUpperCase() + temp.substring(1, temp.length);

        if (i < strArray.length - 1) {
            newStr += " ";
        }
    }

    return newStr;
}

// Populates all the forms from "formsFolder" of student "studentID", into "targetDiv".
// Each of those forms will call "mainButtonFunction" when the user clicks on them.
// Once the the user clicks on the form, the form contents will be populated in the "pageDiv"
function getStudentForms (pageDiv, targetDiv, studentID, formsFolder, mainButtonFunction) {
    let forEachIteration = 0;

    // Hide "targetDiv" while we populate it
    document.getElementById(targetDiv).style.display = "none";

    formDB.collection("users").doc(studentID).collection(formsFolder).get().then(function(querySnapshot) {
        if (querySnapshot.size == 0) {
            let result_h4 = document.createElement('h4');
            result_h4.innerHTML = "No forms were found.";
            result_h4.style.textAlign = "left";
            document.getElementById(targetDiv).appendChild(result_h4);
        }

        querySnapshot.forEach(function(doc) {
            const formDoc = doc.data();
            const formID = getFormID(doc);
            const formName = getFormName(doc);
            const submDate = getSubmDate(doc);
            const exactSubmDate = getExactSubmDate(doc);
            const dueDatePromise = getFormDueDate(formID, formDoc.term.split(" ")[0], studentID, moment(doc.id.toString().split('_')[1], "MMDDYYYYHHmmss"));
            const approvals = formDoc.approvals;

            var main_div = document.createElement("div");
            main_div.className = `divs-to-sort-${targetDiv} w3-white w3-button w3-block w3-round-xlarge w3-margin-bottom`;
            main_div.style.height = "118px";
            main_div.date = moment(doc.id.toString().split('_')[1], "MMDDYYYYHHmmss").format('YYYYMMDDHHmmss');

            //make a new div with class name, and append it to main div
            var first_nested_div = document.createElement("div");
            first_nested_div.className = "w3-left";
            main_div.appendChild(first_nested_div);

            //make an h3 tag, make text, append text to h3 tag, append h3 tag to first_nested_div
            var h3_form_name = document.createElement('h3');
            const termInfo = `<span style="font-size: 17px; color: #8E8E8E; display: contents">(${formDoc.term})</span>`;
            h3_form_name.innerHTML = `${formName} ${termInfo}`;
            h3_form_name.style.fontSize = "20px";
            h3_form_name.style.display = "flex";
            first_nested_div.appendChild(h3_form_name);

            var tracking_bar = document.createElement('div');
            generateTrackingBar(main_div, approvals, formName, tracking_bar);
            first_nested_div.appendChild(tracking_bar);


            // Second nested div (right side)
            var second_nested_div = document.createElement("div");
            second_nested_div.className = "w3-right";

            var h4_submission_date = document.createElement('h3');
            h4_submission_date.appendChild(document.createTextNode("Submission Date: " + submDate));
            h4_submission_date.setAttribute("data-tooltip-content", '<span>' + exactSubmDate + '</span>');
            h4_submission_date.className = "form_date_tooltip";
            h4_submission_date.style.fontSize = "20px";


            second_nested_div.appendChild(h4_submission_date);
            var h4_due_date = document.createElement('h3');

            dueDatePromise.then(function(result) {
                h4_due_date.appendChild(document.createTextNode("Due Date: " + result.format('M/D/YY')));
                h4_due_date.style.textAlign = "left";
                h4_due_date.setAttribute("data-tooltip-content", '<span>' + result.format('M/D/YY [at] HH:mm:ss') + '</span>');
                h4_due_date.className = "form_date_tooltip";
                h4_due_date.style.fontSize = "20px";

                second_nested_div.appendChild(h4_due_date);
                main_div.appendChild(second_nested_div);

                // another way to call function "onclick" --> main_div.onclick = function() {console.log("clicked")};
                main_div.addEventListener("click", mainButtonFunction);
                main_div.pageDiv = pageDiv;
                main_div.studentID = studentID;
                main_div.formsFolder = formsFolder;
                main_div.formID = doc.id;
                document.getElementById(targetDiv).appendChild(main_div);

                if (forEachIteration == querySnapshot.size - 1) {
                    // Initialize tooltips after all the elements have been created
                    $(document).ready(function() {
                        $('.form_date_tooltip').tooltipster({
                            theme: ["tooltipster-shadow", "tooltipster-shadow-customized"],
                            position: "left",
                            animation: "grow",
                        });
                    });

                    // Sort all the "divs-to-sort" in either ascending or descending order, depending on "pageDiv" or "targetDiv"
                    if (pageDiv === "historyPage" || targetDiv === "completedFormsList") {
                        // Descending order for "historyPage" and "completedFormsList" (newer forms first)
                        $(`.divs-to-sort-${targetDiv}`).sort(sortDescending).appendTo(document.getElementById(targetDiv));

                    } else if (pageDiv === "dashboardPage" || targetDiv === "inProgressFormsList") {
                        // Ascending order for "dashboardPage" and "inProgressFormsList" (older forms first)
                        $(`.divs-to-sort-${targetDiv}`).sort(sortAscending).appendTo(document.getElementById(targetDiv));

                    } else {
                        alert("EXCEPTION in Sort all the \"divs-to-sort\"");
                    }

                    // Unhide "targetDiv" after we have populated it
                    document.getElementById(targetDiv).style.display = "block";
                }

                forEachIteration++;
            });
        });
    }).catch(function(error) {
        console.log("Error getting documents (querySnapshot): ", error);
    });
}

// Generate tracking bar, given a "tracking_bar" div container
function generateTrackingBar (main_div, approvals, formName, tracking_bar, initializeCheckmarkTooltip) {
    // Set the style for the tracking bar
    tracking_bar.style.display = "none"; // It is changed to "flex" when the tracking is done
    tracking_bar.style.paddingBottom = "20px";
    tracking_bar.style.cssFloat = "left";
    tracking_bar.className = "centered_elements";
    tracking_bar.id = "progressBarContainer";

    // Create initial checkmark
    var span_check_mark = document.createElement('span');
    span_check_mark.className = "bubble_tooltip w3-left w3-badge w3-black start_checkmark";
    const tooltipTitle = '<span>' + 'The ' + '<i>' + formName + ' form</i>' + ' was started' + '<br>' + 'and successfully submitted.</span>';
    span_check_mark.setAttribute("data-tooltip-content", tooltipTitle);
    tracking_bar.appendChild(span_check_mark);

    // Create initial checkmark text
    var checkmarkText = document.createElement('span');
    checkmarkText.className = "checkmark_text";
    checkmarkText.innerHTML = '<span>Started</span>';
    tracking_bar.appendChild(checkmarkText);

    var declineNum = 0;

    generateTrackingCheckmarks(main_div, approvals, 0, tracking_bar, declineNum);
}

// This will generate the checkmarks of the "approvals" array in a recursion way, to prevent JavaScript async behavior
// from messing up the checkmark order
function generateTrackingCheckmarks (main_div, approvals, i, tracking_bar, declinedNum) {
    pawsDB.collection("users").doc(approvals[i].tracksID).get().then(function(doc) {
        if (doc.exists) {
            const pawsDoc = doc.data();
            const userType = pawsDoc.userType;
            const facultyRole = pawsDoc.facultyRole;

            // Create checkmark element
            var span_check_mark = document.createElement('span');

            // Create progress progressLine element
            var progressLine = document.createElement('span');
            progressLine.className = "tracking_line";

            // Create progress progressLine arrow element
            var lineArrow = document.createElement('span');
            lineArrow.className = "line_arrow";
            lineArrow.style.marginRight = "5px";

            // Create text
            var checkmarkText = document.createElement('span');
            checkmarkText.className = "checkmark_text";
            checkmarkText.innerHTML = '<span style="display: inline-block;">' + getAbbreviation (userType, facultyRole) + '</span>';

            let approvalText;
            if (userType != "Staff") { // then it means it's a Faculty member
                approvalText = `<u>${userType}</u> (${facultyRole})`;
            } else {
                approvalText = `<u>${userType}</u>`;
            }

            let dateInfo;
            if (approvals[i].date != null) {
                dateInfo = getExactDateAndTime(approvals[i].date.toDate());
            } else if (userType === "Faculty") {
                dateInfo = "Waiting for approval."
            } else if (userType === "Staff") {
                dateInfo = "Waiting for processing."
            }

            let dateInfoTitle = "Date";

            let declined = false;
            if (approvals[i].status == null) {
                // Has not been approved so use the gray checkmark style
                span_check_mark.className = "bubble_tooltip w3-left centered_elements checkmark_skeleton";
                span_check_mark.style.border = "2px solid #9e9e9e";

                progressLine.style.borderBottomStyle = "dashed";
                progressLine.style.borderBottomColor = "#9e9e9e";
                lineArrow.style.borderColor = "#9e9e9e";

                if (declinedNum == 0) {
                    // Propagate border color to "main_div" when the form is viewed in full
                    main_div.style.borderLeft = "5px " + "solid #9e9e9e";
                    main_div.borderLeft = "6px " + "solid #9e9e9e";
                }

            } else if (approvals[i].status == true) {
                // Green checkmark since it has already been approved
                span_check_mark.className = "bubble_tooltip w3-left centered_elements checkmark_skeleton";
                span_check_mark.appendChild(document.createTextNode("✓"));
                span_check_mark.style.backgroundColor = "#4CAF50";
                span_check_mark.style.color = "#FFFFFF";
                span_check_mark.fontSize = "14px";

                progressLine.style.borderBottomStyle = "solid";
                progressLine.style.borderBottomColor = "#4CAF50";
                lineArrow.style.borderColor = "#4CAF50";

                if (declinedNum == 0) {
                    // Propagate border color to "main_div" when the form is viewed in full
                    main_div.style.borderLeft = "5px " + "solid #4CAF50";
                    main_div.borderLeft = "6px " + "solid #4CAF50";
                }

                if (userType === "Faculty") {
                    dateInfoTitle = 'Date that form was <b>approved</b>';
                } else {
                    dateInfoTitle = 'Date that form was <b>processed</b>';
                }

            } else if (approvals[i].status == false) {
                // Red checkmark since it has been declined
                span_check_mark.className = "bubble_tooltip w3-left centered_elements checkmark_skeleton";
                span_check_mark.appendChild(document.createTextNode("X"));
                span_check_mark.style.backgroundColor = "#e20000";
                span_check_mark.style.color = "#FFFFFF";
                span_check_mark.style.fontSize = "11px";

                progressLine.style.borderBottomStyle = "solid";
                progressLine.style.borderBottomColor = "#e20000";
                lineArrow.style.borderColor = "#e20000";

                // Propagate border color to "main_div" when the form is viewed in full
                main_div.style.borderLeft = "5px " + "solid #e20000";
                main_div.borderLeft = "6px " + "solid #e20000";

                if (userType === "Faculty") {
                    dateInfoTitle = 'Date that form was <b>not approved</b>';
                } else {
                    dateInfoTitle = 'Date that form was <b>not processed</b>';
                }

                declined = true;
            }

            const tooltipTitle = '<span>' + approvalText + '</br>' + pawsDoc.name.first + " " + pawsDoc.name.last
                + '</br>' + '</br>' + '<u>' + dateInfoTitle + '</u>' + '</br>' + dateInfo + '</span>';
            span_check_mark.setAttribute("data-tooltip-content", tooltipTitle);

            if (declinedNum == 0) {
                tracking_bar.appendChild(progressLine);
                tracking_bar.appendChild(lineArrow);
                tracking_bar.appendChild(span_check_mark);
                tracking_bar.appendChild(checkmarkText);
            }

            if (declined == true) {
                declinedNum++;
            }

            if (i == approvals.length - 1) {
                // Make tracking bar visible again
                tracking_bar.style.display = "flex";

                // Initialize check mark tooltip
                $(document).ready(function() {
                    $('.bubble_tooltip').tooltipster({
                        theme: ["tooltipster-shadow", "tooltipster-shadow-customized"],
                        side: "bottom",
                        animation: "grow",
                    });
                });

            } else if (i < approvals.length) {
                // Generate following checkmarks accordingly, by recursion
                generateTrackingCheckmarks(main_div, approvals, i + 1, tracking_bar, declinedNum);
            }

        } else {
            // doc.data() will be undefined in this case
            console.log("No such document!");
        }
    }).catch(function(error) {
        console.log("Error getting document:", error);
    });
}

// This will display the form in "pageDiv" and the user will be able to see all the information of the form
function displayFormReadMode (event) {
    const pageDiv = document.getElementById(event.currentTarget.pageDiv);
    const studentID = event.currentTarget.studentID;
    const formsFolder = event.currentTarget.formsFolder;
    const formID = event.currentTarget.formID;
    const borderLeft = event.currentTarget.borderLeft;

    formDB.collection("users").doc(studentID).collection(formsFolder).doc(formID).get().then(function(doc) {
        if (doc.exists) {
            const formDoc = doc.data();
            const formID = getFormID(doc);
            const formName = getFormName(doc);
            const dueDatePromise = getFormDueDate(formID, formDoc.term.split(" ")[0], studentID, moment(doc.id.toString().split('_')[1], "MMDDYYYYHHmmss"));

            pawsDB.collection("users").doc(studentID).get().then(function(studentDoc) {
                if (studentDoc.exists) {
                    const pawsStudentDoc = studentDoc.data();
                    const studentTooltipHTML = '<span>' + pawsStudentDoc.email + '</span>';
                    const studentName = '<span class="student_name_tooltip" data-tooltip-content="' + studentTooltipHTML + '" style="color: #000">'
                        + pawsStudentDoc.name.first + " " + pawsStudentDoc.name.last + '</span>';

                    dueDatePromise.then(function(result) {
                        const dueDate = '<span style="color: #000">' + result.format('M/D/YY') + '</span>';
                        const dueDateHTML = '<span>' + result.format('M/D/YY [at] HH:mm:ss') + '</span>';

                        const submDate = '<span style="color: #000">' + getSubmDate(doc) + '</span>';
                        const exactSubmDateHTML = '<span>' + getExactSubmDate(doc) + '</span>';

                        const content = formDoc.content;
                        const approvals = formDoc.approvals;

                        let wholeHTML = '';
                        wholeHTML +=
                            '<div id="mainModal" class="w3-modal" style="display: block; padding-bottom: 100px">\n' +
                            `    <div class="w3-modal-content w3-round-xlarge" style="border-left: ${borderLeft}">\n` +
                            '        <div class="w3-container">\n' +
                            '            <span onclick="closeFormModal(document.getElementsByClassName(\'w3-modal\').item(0))" ' +
                            'class="w3-button w3-display-topright w3-round-xlarge" style="padding: 4px 16px">&times;</span>\n' +
                            '            <div class="w3-text-theme-red" style="display: block; overflow: auto; margin-top: 15px">\n' +
                            '                <div class="w3-left">\n' +
                            '                    <h3 style="font-size: 22px;">' + formName + ' Form</h3>\n' +
                            '                    <h3 style="font-size: 22px;">Student: ' + studentName + '</h3>\n' +
                            '                </div>\n' +
                            '                <div class="w3-right">\n' +
                            '                    <h3 class="form_date_tooltip" style="font-size: 22px;" data-tooltip-content="' + exactSubmDateHTML + '" > Submission Date: '
                            + submDate + '</h3>\n' +
                            '                    <h3 class="form_date_tooltip" style="font-size: 22px;" data-tooltip-content="' + dueDateHTML + '" > Due Date: '
                            + dueDate + '</h3>\n' +
                            '                </div>\n' +
                            '            </div>\n' +
                            '            <div id ="first-page">\n';


                        // Iterate through the different sections of the form
                        // "formSection" will be the next object OR array of the "content" object (map)
                        let iteration = 0;
                        for (var formSection in content) {
                            const formSectionTitle = formSection.split("_")[1];

                            if (iteration == 0) {
                                wholeHTML +=
                                    '<div style="display: block; overflow: auto">\n' +
                                    `   <h5 style="text-decoration: underline; font-weight: bold">${formSectionTitle}</h5>\n` +
                                    '</div>\n';

                            } else {
                                wholeHTML +=
                                    '<div style="display: block; overflow: auto">\n' +
                                    `   <h5 style="margin-top: 35px; text-decoration: underline; font-weight: bold">${formSectionTitle}</h5>\n` +
                                    '</div>\n';
                            }

                            // This section of the form is an array
                            if (Array.isArray(content[formSection])) { // If it's an array, we print its structure in table format
                                wholeHTML += createTableFromArray(content[formSection]);

                                // This section of the form is a map (object)
                            } else {// If it's a map (object), we print its structure in the format --> property: value
                                wholeHTML += '<div class="w3-container">\n';

                                // Iterate through the objects in this section of the form
                                for (var objKey in content[formSection]) {
                                    wholeHTML +=
                                        '    <span style="display: block; overflow: auto">\n' +
                                        `        <h5 class="form_content_text" style="margin-top: 0; margin-bottom: 0; float: left; font-weight: bold">${objKey.split("_")[1]}: </h5>\n` +
                                        `        <h5 class="form_content_text" style="margin-top: 0; margin-bottom: 0; float: left; margin-left: 5px">${content[formSection][objKey]}</h5>\n` +
                                        '    </span>\n';
                                }

                                // Close container
                                wholeHTML += '</div>\n';
                            }

                            iteration++;
                        }


                        wholeHTML +=
                            '<div style="display: block; overflow: auto">\n' +
                            `   <h5 style="margin-top: 35px; text-decoration: underline; font-weight: bold">Approvals</h5>\n` +
                            '</div>\n';

                        for (let i = 0; i < approvals.length; i++) {
                            const approvalID = approvals[i].tracksID;

                            pawsDB.collection("users").doc(approvalID).get().then(function(doc) {
                                if (doc.exists) {
                                    const pawsDoc2 = doc.data();
                                    const approvalObj = approvals[i];
                                    const approvalName = pawsDoc2.name.first + " " +  pawsDoc2.name.last;

                                    let approvalEmail;
                                    if (pawsDoc2.userType != "Staff") { // then it means it's a Faculty member
                                        approvalEmail = `<span><u>${pawsDoc2.userType}</u> (${pawsDoc2.facultyRole})</br>${pawsDoc2.email}</span>`;
                                    } else {
                                        approvalEmail = `<span><u>${pawsDoc2.userType}</u></br>${pawsDoc2.email}</span>`;
                                    }

                                    const approvalDate = (approvalObj.date == null) ? "N/A" : getFormattedDate(approvalObj.date.toDate());
                                    const approvalExactDate = getApprovalExactDayTooltipText(approvalObj.date, pawsDoc2.userType);
                                    const approvalDeclinedReason = (approvalObj.declinedReason == null) ? "N/A" : approvalObj.declinedReason;

                                    const declinedReasonTooltip = getDeclinedReasonTooltipText(approvalObj.status, pawsDoc2.userType);

                                    // Initialize table and its titles
                                    if (i == 0) {
                                        wholeHTML +=
                                            '<div class="w3-container form_content_text">\n' +
                                            '    <table id="approvalsTable" class="w3-table-all w3-card">\n';

                                        // Insert table titles first
                                        wholeHTML += '        <tr>\n';
                                        wholeHTML += `            <th>Name<th>\n`;
                                        wholeHTML += `            <th>Status<th>\n`;
                                        wholeHTML += `            <th>Date<th>\n`;
                                        wholeHTML += `            <th>Declined Reason<th>\n`;
                                        wholeHTML += '        </tr>\n';
                                    }

                                    // Insert table data
                                    wholeHTML += '        <tr>\n';
                                    wholeHTML += `            <td class="approval_tooltip" data-tooltip-content="${approvalEmail}" >${approvalName}<td>\n`;
                                    wholeHTML += getApprovalStatusHTML(approvalObj.status, pawsDoc2.userType);
                                    wholeHTML += `            <td class="approval_tooltip" 
                                            data-tooltip-content="${approvalExactDate}" >${approvalDate}<td>\n`;
                                    wholeHTML += `            <td class="approval_tooltip" 
                                            data-tooltip-content="${declinedReasonTooltip}" >${approvalDeclinedReason}<td>\n`;
                                    wholeHTML += '       </tr>\n';

                                    // Close table element and finish everything
                                    if (i == approvals.length - 1) {
                                        wholeHTML +=
                                            '   </table>\n' +
                                            '</div>\n';

                                        // Close all the divs
                                        wholeHTML +=
                                            '                <br>\n' +
                                            '            </div>\n' +
                                            '        </div>\n' +
                                            '    </div>\n' +
                                            '</div>';

                                        // Insert the HTML at the end of "pageDiv"
                                        pageDiv.insertAdjacentHTML("beforeend", wholeHTML);

                                        // Initialize tooltip
                                        $(document).ready(function() {
                                            $('.student_name_tooltip').tooltipster({
                                                theme: ["tooltipster-shadow", "tooltipster-shadow-customized"],
                                                position: "right",
                                                animation: "grow",
                                            });

                                            $('.form_date_tooltip').tooltipster({
                                                theme: ["tooltipster-shadow", "tooltipster-shadow-customized"],
                                                position: "left",
                                                animation: "grow",
                                            });

                                            $('.approval_tooltip').tooltipster({
                                                theme: ["tooltipster-shadow", "tooltipster-shadow-customized"],
                                                position: "left",
                                                animation: "grow",
                                                functionPosition: function(instance, helper, position){
                                                    position.coord.left += 10;
                                                    return position;
                                                }
                                            });
                                        });
                                    }
                                } else {
                                    // doc.data() will be undefined in this case
                                    console.log("No such document!");
                                }
                            }).catch(function(error) {
                                console.log("Error getting document:", error);
                            });
                        }
                    });
                } else {
                    // doc.data() will be undefined in this case
                    console.log("No such document!");
                }
            }).catch(function(error) {
                console.log("Error getting document:", error);
            });
            //pageDiv.appendChild(mainModal);
        } else {
            // doc.data() will be undefined in this case
            console.log("No such document!");
        }
    }).catch(function(error) {
        console.log("Error getting document:", error);
    });
}

// Populates all the forms from "formsFolder" of Faculty or Staff "userID", into "targetDiv".
// Each of those forms will call "mainButtonFunction" when the user clicks on them.
// Once the the user clicks on the form, the form contents will be populated in the "pageDiv"
function getStudentFormsByReferenceList (pageDiv, targetDiv, userID, formsFolder, mainButtonFunction) {
    let forEachIteration = 0;

    // Hide "targetDiv" while we populate it
    document.getElementById(targetDiv).style.display = "none";

    formDB.collection("users").doc(userID).collection(formsFolder).get().then(function(querySnapshot) {
        if (querySnapshot.size == 0) {
            let result_h4 = document.createElement('h4');
            result_h4.innerHTML = "No forms were found.";
            result_h4.style.textAlign = "left";
            document.getElementById(targetDiv).appendChild(result_h4);
        }

        querySnapshot.forEach(function(formReference) {
            formReference.data().formRef.get().then(function(doc) {
                if (doc.exists) {
                    const formDoc = doc.data();
                    const formID = getFormID(doc);
                    const formName = getFormName(doc);
                    const submDate = getSubmDate(doc);
                    const exactSubmDate = getExactSubmDate(doc);
                    const studentID = formReference.data().formRef.path.split("/")[1];
                    const dueDatePromise = getFormDueDate(formID, formDoc.term.split(" ")[0], studentID, moment(doc.id.toString().split('_')[1], "MMDDYYYYHHmmss"));

                    var main_div = document.createElement("div");
                    main_div.className = "w3-white w3-button w3-block w3-leftbar w3-border-theme w3-round-xlarge w3-margin-bottom";
                    main_div.className = `divs-to-sort-${targetDiv} w3-white w3-button w3-block w3-leftbar w3-border-theme w3-round-xlarge w3-margin-bottom`;
                    main_div.style.height = "105px";
                    main_div.date = moment(doc.id.toString().split('_')[1], "MMDDYYYYHHmmss").format('YYYYMMDDHHmmss');

                    //make a new div with class name, and append it to main div
                    var first_nested_div = document.createElement("div");
                    first_nested_div.className = "w3-left";
                    main_div.appendChild(first_nested_div);

                    //make an h3 tag, make text, append text to h3 tag, append h3 tag to first_nested_div
                    var h3_form_name = document.createElement('h3');
                    const termInfo = `<span style="font-size: 17px; color: #8E8E8E; display: contents">(${formDoc.term})</span>`;
                    h3_form_name.innerHTML = `${formName} ${termInfo}`;
                    h3_form_name.style.fontSize = "20px";
                    h3_form_name.style.display = "flex";
                    first_nested_div.appendChild(h3_form_name);

                    // Middle nested element (middle part)
                    pawsDB.collection("users").doc(userID).get().then(function(doc) {
                        if (doc.exists) {
                            const pawsDoc = doc.data();
                            const userType = pawsDoc.userType;

                            if (userType === "Faculty" || userType === "Staff") {
                                var middle_nested_element = document.createElement("h4");
                                middle_nested_element.className = "bubble_tooltip";
                                middle_nested_element.style.color = "#8e8e8e";
                                middle_nested_element.style.marginBottom = "0px";
                                middle_nested_element.style.marginTop = `13px`;
                                middle_nested_element.style.fontSize = "18px";
                                middle_nested_element.style.textAlign = "left";
                                middle_nested_element.style.width = "min-content";
                                middle_nested_element.style.fontStyle = "italic";

                                const formReferencePath = formReference.data().formRef.path;
                                pawsDB.collection(formReferencePath.split("/")[0]).doc(formReferencePath.split("/")[1]).get().then(function(doc) {
                                    if (doc.exists) {
                                        const pawsDoc = doc.data();
                                        const studentName = pawsDoc.name.first + " " + pawsDoc.name.last;
                                        const tooltipStudentEmail = '<span>' + pawsDoc.email + '</span>';

                                        middle_nested_element.innerHTML = studentName;
                                        middle_nested_element.setAttribute("data-tooltip-content", tooltipStudentEmail);
                                        first_nested_div.appendChild(middle_nested_element);


                                        // Second nested div (right side)
                                        var second_nested_div = document.createElement("div");
                                        second_nested_div.className = "w3-right";

                                        var h4_submission_date = document.createElement('h3');
                                        h4_submission_date.appendChild(document.createTextNode("Submission Date: " + submDate));
                                        h4_submission_date.setAttribute("data-tooltip-content", '<span>' + exactSubmDate + '</span>');
                                        h4_submission_date.className = "form_date_tooltip";
                                        h4_submission_date.style.fontSize = "20px";

                                        second_nested_div.appendChild(h4_submission_date);
                                        var h4_due_date = document.createElement('h3');

                                        dueDatePromise.then(function(result) {
                                            h4_due_date.appendChild(document.createTextNode("Due Date: " + result.format('M/D/YY')));
                                            h4_due_date.style.textAlign = "left";
                                            h4_due_date.setAttribute("data-tooltip-content", '<span>' + result.format('M/D/YY [at] HH:mm:ss') + '</span>');
                                            h4_due_date.className = "form_date_tooltip";
                                            h4_due_date.style.fontSize = "20px";

                                            // Make "date" to be prioritized first by dueDate and second by submDate, if we are in the
                                            // dashboard page
                                            if (pageDiv === "dashboardPage") {
                                                main_div.date = result.format('YYYYMMDDHHmmss') + "_" + main_div.date;
                                            }

                                            second_nested_div.appendChild(h4_due_date);
                                            main_div.appendChild(second_nested_div);

                                            // another way to call function "onclick" --> main_div.onclick = function() {console.log("clicked")};
                                            main_div.addEventListener("click", mainButtonFunction);
                                            main_div.pageDiv = pageDiv;
                                            main_div.formReference = formReference.data().formRef;
                                            main_div.userID = userID;
                                            document.getElementById(targetDiv).appendChild(main_div);

                                            if (forEachIteration == querySnapshot.size - 1) {
                                                // Initialize tooltips after all the elements have been created
                                                $(document).ready(function() {
                                                    $('.bubble_tooltip').tooltipster({
                                                        theme: ["tooltipster-shadow", "tooltipster-shadow-customized"],
                                                        side: "right",
                                                        animation: "grow",
                                                    });

                                                    $('.form_date_tooltip').tooltipster({
                                                        theme: ["tooltipster-shadow", "tooltipster-shadow-customized"],
                                                        position: "left",
                                                        animation: "grow",
                                                    });
                                                });

                                                // Sort all the "divs-to-sort" in either ascending or descending order, depending on "pageDiv"
                                                if (pageDiv === "historyPage") {
                                                    // Descending order for "historyPage" (newer forms first)
                                                    $(`.divs-to-sort-${targetDiv}`).sort(sortDescending).appendTo(document.getElementById(targetDiv));

                                                } else if (pageDiv === "dashboardPage") {
                                                    // Sort by due date (ascending order), and then by submission date (ascending order), if we are
                                                    // in the dashboard page
                                                    $(`.divs-to-sort-${targetDiv}`).sort(sortDueDateAndSubmDate).appendTo(document.getElementById(targetDiv));

                                                } else {
                                                    alert("EXCEPTION in Sort all the \"divs-to-sort\"");
                                                }

                                                // Unhide "targetDiv" after we have populated it
                                                document.getElementById(targetDiv).style.display = "block";
                                            }

                                            forEachIteration++;
                                        });
                                    }
                                });
                            }
                        }
                    });
                }
            });
        });
    }).catch(function(error) {
        console.log("Error getting documents (querySnapshot): ", error);
    });
}

// This will display the form in "pageDiv" and the Faculty or Staff member will be able to see all the information of the form
function displayFormReadModeByReference (event) {
    const pageDiv = document.getElementById(event.currentTarget.pageDiv);
    const formReference = event.currentTarget.formReference;
    const userID = event.currentTarget.userID;

    formReference.get().then(function(doc) {
        if (doc.exists) {
            const formDoc = doc.data();
            const formID = getFormID(doc);
            const formName = getFormName(doc);
            const studentID = formReference.path.split("/")[1];
            const dueDatePromise = getFormDueDate(formID, formDoc.term.split(" ")[0], studentID, moment(doc.id.toString().split('_')[1], "MMDDYYYYHHmmss"));

            pawsDB.collection(formReference.path.split("/")[0]).doc(studentID).get().then(function(studentDoc) {
                if (studentDoc.exists) {
                    const pawsStudentDoc = studentDoc.data();
                    const studentTooltipHTML = '<span>' + pawsStudentDoc.email + '</span>';
                    const studentName = '<span class="student_name_tooltip" data-tooltip-content="' + studentTooltipHTML + '" style="color: #000">'
                        + pawsStudentDoc.name.first + " " + pawsStudentDoc.name.last + '</span>';

                    dueDatePromise.then(function(result) {
                        const dueDate = '<span style="color: #000">' + result.format('M/D/YY') + '</span>';
                        const dueDateHTML = '<span>' + result.format('M/D/YY [at] HH:mm:ss') + '</span>';

                        const submDate = '<span style="color: #000">' + getSubmDate(doc) + '</span>';
                        const exactSubmDateHTML = '<span>' + getExactSubmDate(doc) + '</span>';

                        const content = formDoc.content;
                        const approvals = formDoc.approvals;

                        let wholeHTML = '';
                        wholeHTML +=
                            '<div id="mainModal" class="w3-modal" style="display: block; padding-bottom: 100px">\n' +
                            '    <div class="w3-modal-content w3-round-xlarge w3-border-theme w3-leftbar">\n' +
                            '        <div class="w3-container">\n' +
                            '            <span onclick="closeFormModal(document.getElementsByClassName(\'w3-modal\').item(0))" ' +
                            'class="w3-button w3-display-topright w3-round-xlarge" style="padding: 4px 16px">&times;</span>\n' +
                            '            <div class="w3-text-theme-red" style="display: block; overflow: auto; margin-top: 15px">\n' +
                            '                <div class="w3-left">\n' +
                            '                    <h3 style="font-size: 22px;">' + formName + ' Form</h3>\n' +
                            '                    <h3 style="font-size: 22px;">Student: ' + studentName + '</h3>\n' +
                            '                </div>\n' +
                            '                <div class="w3-right">\n' +
                            '                    <h3 class="form_date_tooltip" style="font-size: 22px;" data-tooltip-content="' + exactSubmDateHTML + '" > Submission Date: '
                            + submDate + '</h3>\n' +
                            '                    <h3 class="form_date_tooltip" style="font-size: 22px;" data-tooltip-content="' + dueDateHTML + '" > Due Date: '
                            + dueDate + '</h3>\n' +
                            '                </div>\n' +
                            '            </div>\n' +
                            '            <div id ="first-page">\n';


                        // Iterate through the different sections of the form
                        // "formSection" will be the next object OR array of the "content" object (map)
                        let iteration = 0;
                        for (var formSection in content) {
                            const formSectionTitle = formSection.split("_")[1];

                            if (iteration == 0) {
                                wholeHTML +=
                                    '<div style="display: block; overflow: auto">\n' +
                                    `   <h5 style="text-decoration: underline; font-weight: bold">${formSectionTitle}</h5>\n` +
                                    '</div>\n';

                            } else {
                                wholeHTML +=
                                    '<div style="display: block; overflow: auto">\n' +
                                    `   <h5 style="margin-top: 35px; text-decoration: underline; font-weight: bold">${formSectionTitle}</h5>\n` +
                                    '</div>\n';
                            }

                            // This section of the form is an array
                            if (Array.isArray(content[formSection])) { // If it's an array, we print its structure in table format
                                wholeHTML += createTableFromArray(content[formSection]);

                                // This section of the form is a map (object)
                            } else {// If it's a map (object), we print its structure in the format --> property: value
                                wholeHTML += '<div class="w3-container">\n';

                                // Iterate through the objects in this section of the form
                                for (var objKey in content[formSection]) {
                                    wholeHTML +=
                                        '    <span style="display: block; overflow: auto">\n' +
                                        `        <h5 class="form_content_text" style="margin-top: 0; margin-bottom: 0; float: left; font-weight: bold">${objKey.split("_")[1]}: </h5>\n` +
                                        `        <h5 class="form_content_text" style="margin-top: 0; margin-bottom: 0; float: left; margin-left: 5px">${content[formSection][objKey]}</h5>\n` +
                                        '    </span>\n';
                                }

                                // Close container
                                wholeHTML += '</div>\n';
                            }

                            iteration++;
                        }


                        wholeHTML +=
                            '<div style="display: block; overflow: auto">\n' +
                            `   <h5 style="margin-top: 35px; text-decoration: underline; font-weight: bold">Approvals</h5>\n` +
                            '</div>\n';

                        for (let i = 0; i < approvals.length; i++) {
                            const approvalID = approvals[i].tracksID;

                            pawsDB.collection("users").doc(approvalID).get().then(function(doc) {
                                if (doc.exists) {
                                    const pawsDoc2 = doc.data();
                                    const approvalObj = approvals[i];
                                    let approvalName = pawsDoc2.name.first + " " +  pawsDoc2.name.last;

                                    let approvalEmail;
                                    if (pawsDoc2.userType != "Staff") { // then it means it's a Faculty member
                                        approvalEmail = `<span><u>${pawsDoc2.userType}</u> (${pawsDoc2.facultyRole})</br>${pawsDoc2.email}</span>`;
                                    } else {
                                        approvalEmail = `<span><u>${pawsDoc2.userType}</u></br>${pawsDoc2.email}</span>`;
                                    }

                                    const approvalDate = (approvalObj.date == null) ? "N/A" : getFormattedDate(approvalObj.date.toDate());
                                    const approvalExactDate = getApprovalExactDayTooltipText(approvalObj.date, pawsDoc2.userType);
                                    const approvalDeclinedReason = (approvalObj.declinedReason == null) ? "N/A" : approvalObj.declinedReason;

                                    const declinedReasonTooltip = getDeclinedReasonTooltipText(approvalObj.status, pawsDoc2.userType);

                                    // Check to see if the person who is taking an action now is the same person of the row in the table
                                    if (approvalID === userID) {
                                        approvalName = '<span>' + approvalName + " " + '<span style="color: #ff0000;">'
                                            + "(" +  '<u>' + "YOU" + '</u>' + ")" + '</span>' +  '</span>';
                                    }

                                    // Initialize table and its titles
                                    if (i == 0) {
                                        wholeHTML +=
                                            '<div class="w3-container form_content_text">\n' +
                                            '    <table id="approvalsTable" class="w3-table-all w3-card">\n';

                                        // Insert table titles first
                                        wholeHTML += '        <tr>\n';
                                        wholeHTML += `            <th>Name<th>\n`;
                                        wholeHTML += `            <th>Status<th>\n`;
                                        wholeHTML += `            <th>Date<th>\n`;
                                        wholeHTML += `            <th>Declined Reason<th>\n`;
                                        wholeHTML += '        </tr>\n';
                                    }

                                    // Insert table data
                                    wholeHTML += '        <tr>\n';
                                    wholeHTML += `            <td class="approval_tooltip" data-tooltip-content="${approvalEmail}" >${approvalName}<td>\n`;
                                    wholeHTML += getApprovalStatusHTML(approvalObj.status, pawsDoc2.userType);
                                    wholeHTML += `            <td class="approval_tooltip" 
                                            data-tooltip-content="${approvalExactDate}" >${approvalDate}<td>\n`;
                                    wholeHTML += `            <td class="approval_tooltip" 
                                            data-tooltip-content="${declinedReasonTooltip}" >${approvalDeclinedReason}<td>\n`;
                                    wholeHTML += '       </tr>\n';

                                    // Close table element and finish everything
                                    if (i == approvals.length - 1) {
                                        wholeHTML +=
                                            '   </table>\n' +
                                            '</div>\n';

                                        // Close all the divs
                                        wholeHTML +=
                                            '                <br>\n' +
                                            '            </div>\n' +
                                            '        </div>\n' +
                                            '    </div>\n' +
                                            '</div>';

                                        // Insert the HTML at the end of "pageDiv"
                                        pageDiv.insertAdjacentHTML("beforeend", wholeHTML);

                                        // Initialize tooltip
                                        $(document).ready(function() {
                                            $('.student_name_tooltip').tooltipster({
                                                theme: ["tooltipster-shadow", "tooltipster-shadow-customized"],
                                                position: "right",
                                                animation: "grow",
                                            });

                                            $('.form_date_tooltip').tooltipster({
                                                theme: ["tooltipster-shadow", "tooltipster-shadow-customized"],
                                                position: "left",
                                                animation: "grow",
                                            });

                                            $('.approval_tooltip').tooltipster({
                                                theme: ["tooltipster-shadow", "tooltipster-shadow-customized"],
                                                position: "left",
                                                animation: "grow",
                                                functionPosition: function(instance, helper, position){
                                                    position.coord.left += 10;
                                                    return position;
                                                }
                                            });

                                            $('.button_info_tooltip').tooltipster({
                                                theme: "tooltipster-borderless",
                                                position: "bottom",
                                                animation: "grow",
                                            });
                                        });
                                    }
                                } else {
                                    // doc.data() will be undefined in this case
                                    console.log("No such document!");
                                }
                            }).catch(function(error) {
                                console.log("Error getting document:", error);
                            });
                        }
                    });
                } else {
                    // doc.data() will be undefined in this case
                    console.log("No such document!");
                }
            }).catch(function(error) {
                console.log("Error getting document:", error);
            });
            //pageDiv.appendChild(mainModal);
        } else {
            // doc.data() will be undefined in this case
            console.log("No such document!");
        }
    }).catch(function(error) {
        console.log("Error getting document:", error);
    });
}

// This will display the form in "pageDiv" and the Faculty or Staff member will be able to see all the information of
// the form and approve it or decline it.
function displayFormApproveMode (event) {
    const pageDiv = document.getElementById(event.currentTarget.pageDiv);
    const formReference = event.currentTarget.formReference;
    const userID = event.currentTarget.userID;

    const formOpened = event.currentTarget;

    formReference.get().then(function(doc) {
        if (doc.exists) {
            const formDoc = doc.data();
            const formID = getFormID(doc);
            const formName = getFormName(doc);
            const studentID = formReference.path.split("/")[1];
            const dueDatePromise = getFormDueDate(formID, formDoc.term.split(" ")[0], studentID, moment(doc.id.toString().split('_')[1], "MMDDYYYYHHmmss"));

            pawsDB.collection(formReference.path.split("/")[0]).doc(studentID).get().then(function(studentDoc) {
                if (studentDoc.exists) {
                    const pawsStudentDoc = studentDoc.data();
                    const studentTooltipHTML = '<span>' + pawsStudentDoc.email + '</span>';
                    const studentName = '<span class="student_name_tooltip" data-tooltip-content="' + studentTooltipHTML + '" style="color: #000">'
                        + pawsStudentDoc.name.first + " " + pawsStudentDoc.name.last + '</span>';

                    dueDatePromise.then(function(result) {
                        const dueDate = '<span style="color: #000">' + result.format('M/D/YY') + '</span>';
                        const dueDateHTML = '<span>' + result.format('M/D/YY [at] HH:mm:ss') + '</span>';

                        const submDate = '<span style="color: #000">' + getSubmDate(doc) + '</span>';
                        const exactSubmDateHTML = '<span>' + getExactSubmDate(doc) + '</span>';

                        const content = formDoc.content;
                        const approvals = formDoc.approvals;

                        let wholeHTML = '';
                        wholeHTML +=
                            '<div id="mainModal" class="w3-modal" style="display: block; padding-bottom: 100px">\n' +
                            '    <div class="w3-modal-content w3-round-xlarge w3-border-theme w3-leftbar">\n' +
                            '        <div class="w3-container">\n' +
                            '            <span onclick="closeFormModal(document.getElementsByClassName(\'w3-modal\').item(0))" ' +
                            'class="w3-button w3-display-topright w3-round-xlarge" style="padding: 4px 16px">&times;</span>\n' +
                            '            <div class="w3-text-theme-red" style="display: block; overflow: auto; margin-top: 15px">\n' +
                            '                <div class="w3-left">\n' +
                            '                    <h3 style="font-size: 22px;">' + formName + ' Form</h3>\n' +
                            '                    <h3 style="font-size: 22px;">Student: ' + studentName + '</h3>\n' +
                            '                </div>\n' +
                            '                <div class="w3-right">\n' +
                            '                    <h3 class="form_date_tooltip" style="font-size: 22px;" data-tooltip-content="' + exactSubmDateHTML + '" > Submission Date: '
                            + submDate + '</h3>\n' +
                            '                    <h3 class="form_date_tooltip" style="font-size: 22px;" data-tooltip-content="' + dueDateHTML + '" > Due Date: '
                            + dueDate + '</h3>\n' +
                            '                </div>\n' +
                            '            </div>\n' +
                            '            <div id ="first-page">\n';


                        // Iterate through the different sections of the form
                        // "formSection" will be the next object OR array of the "content" object (map)
                        let iteration = 0;
                        for (var formSection in content) {
                            const formSectionTitle = formSection.split("_")[1];

                            if (iteration == 0) {
                                wholeHTML +=
                                    '<div style="display: block; overflow: auto">\n' +
                                    `   <h5 style="text-decoration: underline; font-weight: bold">${formSectionTitle}</h5>\n` +
                                    '</div>\n';

                            } else {
                                wholeHTML +=
                                    '<div style="display: block; overflow: auto">\n' +
                                    `   <h5 style="margin-top: 35px; text-decoration: underline; font-weight: bold">${formSectionTitle}</h5>\n` +
                                    '</div>\n';
                            }

                            // This section of the form is an array
                            if (Array.isArray(content[formSection])) { // If it's an array, we print its structure in table format
                                wholeHTML += createTableFromArray(content[formSection]);

                                // This section of the form is a map (object)
                            } else {// If it's a map (object), we print its structure in the format --> property: value
                                wholeHTML += '<div class="w3-container">\n';

                                // Iterate through the objects in this section of the form
                                for (var objKey in content[formSection]) {
                                    wholeHTML +=
                                        '    <span style="display: block; overflow: auto">\n' +
                                        `        <h5 class="form_content_text" style="margin-top: 0; margin-bottom: 0; float: left; font-weight: bold">${objKey.split("_")[1]}: </h5>\n` +
                                        `        <h5 class="form_content_text" style="margin-top: 0; margin-bottom: 0; float: left; margin-left: 5px;">${content[formSection][objKey]}</h5>\n` +
                                        '    </span>\n';
                                }

                                // Close container
                                wholeHTML += '</div>\n';
                            }

                            iteration++;
                        }


                        wholeHTML +=
                            '<div style="display: block; overflow: auto">\n' +
                            `   <h5 style="margin-top: 35px; text-decoration: underline; font-weight: bold">Approvals</h5>\n` +
                            '</div>\n';

                        // Used later to distinguish if the current approver is a Faculty or a Staff
                        let userID_userType = "";

                        for (let i = 0; i < approvals.length; i++) {
                            const approvalID = approvals[i].tracksID;

                            pawsDB.collection("users").doc(approvalID).get().then(function(doc) {
                                if (doc.exists) {
                                    const pawsDoc2 = doc.data();
                                    const approvalObj = approvals[i];
                                    let approvalName = pawsDoc2.name.first + " " +  pawsDoc2.name.last;
                                    const approvalEmail = '<span>' + '<u>' + pawsDoc2.userType + '</u>' + '</br>' + pawsDoc2.email + '</span>';
                                    const approvalDate = (approvalObj.date == null) ? "N/A" : getFormattedDate(approvalObj.date.toDate());
                                    const approvalExactDate = getApprovalExactDayTooltipText(approvalObj.date, pawsDoc2.userType);
                                    const approvalDeclinedReason = (approvalObj.declinedReason == null) ? "N/A" : approvalObj.declinedReason;

                                    const declinedReasonTooltip = getDeclinedReasonTooltipText(approvalObj.status, pawsDoc2.userType);

                                    // Check to see if the person who is taking an action now is the same person of the row in the table
                                    if (approvalID === userID) {
                                        approvalName = '<span>' + approvalName + " " + '<span style="color: #ff0000;">'
                                            + "(" +  '<u>' + "YOU" + '</u>' + ")" + '<span>' +  '<span/>';

                                        userID_userType = pawsDoc2.userType;
                                    }

                                    // Initialize table and its titles
                                    if (i == 0) {
                                        wholeHTML +=
                                            '<div class="w3-container form_content_text">\n' +
                                            '    <table id="approvalsTable" class="w3-table-all w3-card">\n';

                                        // Insert table titles first
                                        wholeHTML += '        <tr>\n';
                                        wholeHTML += `            <th>Name<th>\n`;
                                        wholeHTML += `            <th>Status<th>\n`;
                                        wholeHTML += `            <th>Date<th>\n`;
                                        wholeHTML += `            <th>Declined Reason<th>\n`;
                                        wholeHTML += '        </tr>\n';
                                    }

                                    // Insert table data
                                    wholeHTML += '        <tr>\n';
                                    wholeHTML += `            <td class="approval_tooltip" data-tooltip-content="${approvalEmail}" >${approvalName}<td>\n`;
                                    wholeHTML += getApprovalStatusHTML(approvalObj.status, pawsDoc2.userType);
                                    wholeHTML += `            <td class="approval_tooltip" 
                                            data-tooltip-content="${approvalExactDate}" >${approvalDate}<td>\n`;
                                    wholeHTML += `            <td class="approval_tooltip" 
                                            data-tooltip-content="${declinedReasonTooltip}" >${approvalDeclinedReason}<td>\n`;
                                    wholeHTML += '       </tr>\n';

                                    // Close table element and finish everything
                                    if (i == approvals.length - 1) {
                                        // Modify wholeHTML with appropriate information depending on whether the
                                        // userID_userType is "Faculty" or "Staff"
                                        wholeHTML = getWholeHTML(wholeHTML, userID_userType);

                                        // Insert the HTML at the end of "pageDiv"
                                        pageDiv.insertAdjacentHTML("beforeend", wholeHTML);

                                        // Insert information about approval status into these buttons
                                        document.getElementById("approveBtn").approvalStatus = true;
                                        document.getElementById("declineBtn").approvalStatus = false;

                                        // Insert crucial information about this form in the "formModal" (main structure of this form HTML)
                                        document.getElementById("mainModal").formReference = formReference;
                                        document.getElementById("mainModal").userID = userID;
                                        document.getElementById("mainModal").formObject = formOpened;

                                        // Insert information about type of user in the "submitBtn"
                                        document.getElementById("submitBtn").userID_userType = userID_userType;

                                        // Initialize tooltip
                                        $(document).ready(function() {
                                            $('.student_name_tooltip').tooltipster({
                                                theme: ["tooltipster-shadow", "tooltipster-shadow-customized"],
                                                position: "right",
                                                animation: "grow",
                                            });

                                            $('.form_date_tooltip').tooltipster({
                                                theme: ["tooltipster-shadow", "tooltipster-shadow-customized"],
                                                position: "left",
                                                animation: "grow",
                                            });

                                            $('.approval_tooltip').tooltipster({
                                                theme: ["tooltipster-shadow", "tooltipster-shadow-customized"],
                                                position: "left",
                                                animation: "grow",
                                                functionPosition: function(instance, helper, position){
                                                    position.coord.left += 10;
                                                    return position;
                                                }
                                            });

                                            $('.button_info_tooltip').tooltipster({
                                                theme: "tooltipster-borderless",
                                                position: "bottom",
                                                animation: "grow",
                                            });
                                        });
                                    }
                                } else {
                                    // doc.data() will be undefined in this case
                                    console.log("No such document!");
                                }
                            }).catch(function(error) {
                                console.log("Error getting document:", error);
                            });
                        }
                    });
                } else {
                    // doc.data() will be undefined in this case
                    console.log("No such document!");
                }
            }).catch(function(error) {
                console.log("Error getting document:", error);
            });
            //pageDiv.appendChild(mainModal);
        } else {
            // doc.data() will be undefined in this case
            console.log("No such document!");
        }
    }).catch(function(error) {
        console.log("Error getting document:", error);
    });
}

function getWholeHTML (wholeHTML, userID_userType) {
    wholeHTML +=
        '   </table>\n' +
        '</div>\n';

    if (userID_userType === "Faculty") {
        // Insert essential buttons
        const approveFormHTML = "<span>Approve this student's form</span>";
        const declineFormHTML = "<span>Decline this student's form</span>";
        const submitApprovalHTML = "<span>Click to submit your FINAL decision on this form</span>";;
        wholeHTML +=
            '<br>\n' +
            '<div style="display: block; overflow: auto">\n' +
            `   <h3 class="w3-text-theme-red" style="text-decoration: underline">Form Approval</h3>\n` +
            '</div>\n' +
            '<div class="w3-container">\n' +
            '    <span class="form_content_text" style="float: left">\n' +
            'If you approve this form, click on "I Approve" button; if you decline, click on "I Decline" button.' +
            '<br>' +
            'If you decline, please write a sentence or two of at least 5 words, so that the Student ' +
            'knows the reason why you declined the approval of this form.' +
            '    </span>\n' +
            '</div>\n' +

            '<div style="text-align: center; margin-top: 10px; margin-bottom: 15px">\n' +
            '    <button style="background-color: #67ac5b" class="approval_button button_properties button_info_tooltip" onclick="formApproval(event)"'
            + 'data-tooltip-content="' + approveFormHTML + '" id="approveBtn">I Approve' + '</button>\n' +

            '    <button style="margin-left: 40px; background-color: #9b0000" class="approval_button button_properties button_info_tooltip"'
            + 'onclick="formApproval(event)" data-tooltip-content="' + declineFormHTML + '" id="declineBtn">I Decline' + '</button>\n' +
            '</div>\n' +
            '<div id="declinedTextBoxDiv" class="declined_text_box_div" style="display: none" >\n' +
            '    <textarea id="declinedTextBoxInput" class="declined_text_box" autofocus type="text" placeholder="Why do you decline'
            + ' the approval of this form?" onkeyup="formApprovalTextBoxKeyPressed()" ></textarea>\n' +
            '    <div id="wordCounter" style="float: left; clear: left;" ></div>\n' +
            '</div>\n' +

            '<div id="submitDiv" class="w3-container" style="margin-top: 30px; display: none;" >\n' +
            '    <span class="form_content_text" style="float: left; border-top: 2px solid;">\n' +
            'By clicking on the button below you agree that you wish to proceed in your decision, and that you have full' +
            ' awareness that you may not be able to cancel this form after the form has been sent.' +
            '    </span>\n' +
            '    <button class="submit_approval_button button_properties button_info_tooltip" onclick="submitFormApproval(event)"'
            + 'data-tooltip-content="' + submitApprovalHTML + '" id="submitBtn">CONFIRM</button>\n' +
            '</div>\n';

    } else if (userID_userType === "Staff") {
        // Insert essential buttons
        const approveFormHTML = "<span>Process this student's form</span>";
        const declineFormHTML = "<span>Don't process this student's form</span>";
        const submitApprovalHTML = "<span>Click to submit your FINAL decision on this form</span>";;
        wholeHTML +=
            '<br>\n' +
            '<div style="display: block; overflow: auto">\n' +
            `   <h3 class="w3-text-theme-red" style="text-decoration: underline">Form Processing</h3>\n` +
            '</div>\n' +
            '<div class="w3-container">\n' +
            '    <span class="form_content_text" style="float: left">\n' +
            'If you process this form, click on "I Have Processed" button; if you ' + "don't" +' process, click on "I Cannot Process" button.' +
            '<br>' +
            'If you cannot process, please write a sentence or two of at least 5 words, so that the Student ' +
            'knows the reason why you ' + "didn't" + ' process this form.' +
            '    </span>\n' +
            '</div>\n' +

            '<div style="text-align: center; margin-top: 10px; margin-bottom: 15px">\n' +
            '    <button style="background-color: #67ac5b" class="approval_button button_properties button_info_tooltip" onclick="formApproval(event)"'
            + 'data-tooltip-content="' + approveFormHTML + '" id="approveBtn">I Have Processed' + '</button>\n' +

            '    <button style="margin-left: 40px; background-color: #9b0000" class="approval_button button_properties button_info_tooltip"'
            + 'onclick="formApproval(event)" data-tooltip-content="' + declineFormHTML + '" id="declineBtn">I Cannot Process' + '</button>\n' +
            '</div>\n' +
            '<div id="declinedTextBoxDiv" class="declined_text_box_div" style="display: none" >\n' +
            '    <textarea id="declinedTextBoxInput" class="declined_text_box" autofocus type="text" placeholder="Why you cannot'
            + ' process this form?" onkeyup="formApprovalTextBoxKeyPressed()" ></textarea>\n' +
            '    <div id="wordCounter" style="float: left; clear: left;" ></div>\n' +
            '</div>\n' +

            '<div id="submitDiv" class="w3-container" style="margin-top: 30px; display: none;" >\n' +
            '    <span class="form_content_text" style="float: left; border-top: 2px solid;">\n' +
            'By clicking on the button below you agree that you wish to proceed in your decision, and that you have full' +
            " awareness that you won't be able to cancel this form after the form has been processed." +
            '    </span>\n' +
            '    <button class="submit_approval_button button_properties button_info_tooltip" onclick="submitFormApproval(event)"'
            + 'data-tooltip-content="' + submitApprovalHTML + '" id="submitBtn">CONFIRM</button>\n' +
            '</div>\n';

    } else {
        console.log("Error in function: 'getWholeHTML()' in 'general.js'. UserType wasn't either 'Faculty' nor 'Staff'.");
    }

    // Close all the divs
    wholeHTML +=
        '                <br>\n' +
        '            </div>\n' +
        '        </div>\n' +
        '    </div>\n' +
        '</div>';

    return wholeHTML;
}

function formApproval (event) {
    const approved = event.currentTarget.approvalStatus;
    buttonApprovalToggle(approved);

    if (approved) {
        // Hide "declinedTextBoxDiv"
        document.getElementById("declinedTextBoxDiv").style.display = "none";

        // Make "submitDiv" visible
        document.getElementById("submitDiv").style.display = "block";

        // Update approval status of "submitBtn"
        document.getElementById("submitBtn").approvalStatus = true;

    } else {
        // Clear previous entries
        document.getElementById("declinedTextBoxInput").value = '';

        // Update the number of words remaining
        formApprovalTextBoxKeyPressed();

        // Hide the final submit approval section
        document.getElementById("submitDiv").style.display = "none";

        // Update approval status of "submitBtn"
        document.getElementById("submitBtn").approvalStatus = false;

        // Make the "declinedTextBoxDiv" visible again, while putting focus on the text box
        document.getElementById("declinedTextBoxDiv").style.display = "block";
        document.getElementById("declinedTextBoxInput").focus();
    }
}

function buttonApprovalToggle (approved) {
    const approveBtn = document.getElementById("approveBtn");
    const declineBtn = document.getElementById("declineBtn");

    if (!approveBtn.classList.contains("button_active") && !approveBtn.classList.contains("button_inactive")) {
        // None of the buttons were pressed yet, so we can press according to the "approved" variable
        if (approved) {
            approveBtn.classList.add("button_active");
            declineBtn.classList.add("button_inactive");
        } else {
            approveBtn.classList.add("button_inactive");
            declineBtn.classList.add("button_active");
        }

    } else {
        if (approveBtn.classList.contains("button_active") && !approved) {
            approveBtn.classList.remove("button_active");
            declineBtn.classList.remove("button_inactive");

            approveBtn.classList.add("button_inactive");
            declineBtn.classList.add("button_active");

        } else if (approveBtn.classList.contains("button_inactive") && approved) {
            approveBtn.classList.remove("button_inactive");
            declineBtn.classList.remove("button_active");

            approveBtn.classList.add("button_active");
            declineBtn.classList.add("button_inactive");
        }
    }
}

function formApprovalTextBoxKeyPressed () {
    const txt = document.getElementById("declinedTextBoxInput").value;

    // Account for the empty string
    const wordList = txt.trim().split(/\s+/);
    let wordCount;
    if (wordList.length == 1 && wordList[0].length == 0) {
        wordCount = 0;
    } else {
        wordCount = wordList.length;
    }

    if (wordCount < 5) {
        document.getElementById("wordCounter").innerHTML =
            '<span style="color: #9b0000">' + "Minimum of 5 words." + '<br>' + "Word count is: " + wordCount + " words." + '</span>';
        document.getElementById("submitDiv").style.display = "none";

    } else if (wordCount > 300) {
        document.getElementById("wordCounter").innerHTML =
            '<span style="color: #9b0000">' + "Maximum of 300 words." + '<br>' + "Word count is: " + wordCount + " words." + '</span>';
        document.getElementById("submitDiv").style.display = "none";

    } else {
        document.getElementById("wordCounter").innerHTML =
            '<span style="color: #9b0000">' + "Maximum of 300 words." + '<br>' + "You have " + (300 - wordCount) + " words remaining." + '</span>';
        document.getElementById("submitDiv").style.display = "block";
    }
}

function submitFormApproval (event) {
    const submitBtn = document.getElementById("submitBtn");
    const approved = submitBtn.approvalStatus;

    const declinedReason = document.getElementById("declinedTextBoxInput").value;

    const formReference = document.getElementById("mainModal").formReference;
    const userID = document.getElementById("mainModal").userID;
    const userID_userType = document.getElementById("submitBtn").userID_userType;

    const studentID = formReference.path.split("/")[1];

    const formObject = document.getElementById("mainModal").formObject;

    formReference.get().then(function(formDoc) {
        if (formDoc.exists) {
            const formDocData = formDoc.data();
            const approvals = formDocData.approvals;
            const formID = getFormID(formDoc);

            let approvalUpdated = false;
            let nullCount = 0;
            for (let i = 0; i < approvals.length; i++) {
                pawsDB.collection("users").doc(approvals[i].tracksID).get().then(function(userDoc) {
                    if (userDoc.exists) {
                        const userDocData = userDoc.data();
                        const fullName = userDocData.name.first + " " + userDocData.name.last;

                        // We found the person who just approved/declined this form (just submitted its approval in the system)
                        if (approvals[i].tracksID == userID) {
                            if (approved) {
                                approvals[i].status = true;
                            } else {
                                approvals[i].status = false;
                                approvals[i].declinedReason = declinedReason;
                            }
                            approvals[i].date = new Date();

                            // Update original form with the most current approval/decline
                            formReference.update({
                                approvals: approvals
                            });

                            // Add a reference of this form to the Faculty or Staff (userID) in which just signed this form, into their folder of "completedForms"
                            const completedFormID = "completedForm_" + formDoc.id.split("_")[1];
                            formDB.collection("users").doc(userID).collection("completedForms").doc(completedFormID).set({
                                formRef: formReference
                            });
                            approvalUpdated = true;

                            // Display message of their (the person who just signed this form) action
                            const message = getApproverNotificationMessage(approved, userID_userType);
                            displayConfirmationMessage("mainContent", message);

                            // Delete the old reference in which was in "pendingForms"
                            const pendingFormID = "pendingForm_" + formDoc.id.split("_")[1];
                            formDB.collection("users").doc(userID).collection("pendingForms").doc(pendingFormID).delete().then(function() {
                                //console.log("Document successfully deleted!");
                            }).catch(function(error) {
                                console.error("Error removing document: ", error);
                            });

                            // Todo: Send an email notification that the form has been signed, to the student (formReference.path.split("/")[1]) in which owns this form
                            const notificationMessage = getStudentNotificationMessage(approved, userID_userType, fullName, formID);
                            const dateToday = new Date();
                            const notificationID = "notification_" + moment(dateToday).format('MMDDYYYYHHmmss');
                            formDB.collection("users").doc(studentID).collection("notifications").doc(notificationID).set({
                                message: notificationMessage,
                                timestamp: dateToday
                            });

                            // Send email to student
                            //sendEmail("Aliyah Adkins", "something here", "aadkins2016");
                            sendEmail(getDisplayName(), notificationMessage, studentID);

                            // There are still more people in the approvals list to approve this form, but only send this form's reference to the first/next one if
                            // the person who just signed the form has approved it
                        } else if (approvalUpdated && (nullCount == 0) && approved) {
                            // Send a reference of this form to the next person to sign (faculty or staff)
                            const pendingFormID = "pendingForm_" + formDoc.id.split("_")[1];
                            formDB.collection("users").doc(approvals[i].tracksID).collection("pendingForms").doc(pendingFormID).set({
                                formRef: formReference
                            });

                            // Todo: Send an email (NOT in-app) notification to this person (approvals[i].tracksID), so they know that they have a new pending form to approve

                            nullCount++;
                        }


                        // Last person in approvals list is the person who has approved the form
                        if (approvalUpdated && (i == approvals.length - 1) && (nullCount == 0)) {
                            // Get the most up-to-date version of this form, since we modified the current one already
                            formReference.get().then(function(newDoc) {
                                if (newDoc.exists) {
                                    const newDocData = newDoc.data();

                                    // Create an identical version of this form in the "completedForms" folder of the student
                                    formDB.collection("users").doc(studentID).collection("completedForms").doc(formDoc.id).set(newDocData);

                                    // Delete the form in which was in the previous folder "inProgressForms" of the student
                                    formReference.delete().then(function() {
                                        //console.log("Document successfully deleted!");
                                    }).catch(function(error) {
                                        console.error("Error removing document: ", error);
                                    });

                                    // Get the form reference of the form in which is in the new folder ("completedForms")
                                    const newFormReference = formDB.collection("users").doc(studentID).collection("completedForms").doc(formDoc.id);
                                    // Update the old references of this form for all the faculty and staff that signed this form
                                    for (let j = 0; j < approvals.length; j++) {
                                        if (approvals[j].status != null) {
                                            const pendingFormID = "pendingForm_" + formDoc.id.split("_")[1];
                                            const completedFormID = "completedForm_" + formDoc.id.split("_")[1];

                                            // Delete old reference
                                            formDB.collection("users").doc(approvals[j].tracksID).collection("completedForms").doc(pendingFormID).delete().then(function() {
                                                //console.log("Document successfully deleted!");
                                            }).catch(function(error) {
                                                console.error("Error removing document: ", error);
                                            });

                                            // Create newer reference
                                            formDB.collection("users").doc(approvals[j].tracksID).collection("completedForms").doc(completedFormID).set({
                                                formRef: newFormReference
                                            });
                                        }
                                    }
                                }
                            });
                        }
                    }
                });
            }

            formObject.remove();
            closeFormModal(document.getElementById("mainModal"));
        }
    });
}

// Depending whether is a Faculty or a Staff that have approved the form, display a different confirmation message to the student
function getStudentNotificationMessage (approved, userID_userType, fullName, formID) {
    let message = "";
    if (userID_userType === "Faculty") {
        if (approved) {
            message = `<i>${fullName}</i> has <b>approved</b> your "${formID}" form. You can view the progress of it in your "In-Progress Forms" page.`;
        } else {
            message = `<i>${fullName}</i> has <b>declined</b> your "${formID}" form. You can view the reason of why they declined in your "My Completed Forms" page.`;
        }

    } else if (userID_userType === "Staff") {
        if (approved) {
            message = `<i>${fullName}</i> has <b>processed</b> your "${formID}" form. You can view it in your "My Completed Forms" page.`;
        } else {
            message = `<i>${fullName}</i> has <b>not processed</b> your "${formID}" form. You can view the reason of why they didn't process in your "My Completed Forms" page.`;
        }
    }

    return message;
}

// Depending whether is a Faculty or a Staff, display different confirmation messages to them
function getApproverNotificationMessage(approved, userID_userType) {
    let message = "";
    if (userID_userType === "Faculty") {
        if (approved) {
            message = 'The form has been successfully approved!';
        } else {
            message = 'The form has been successfully declined!';
        }

    } else if (userID_userType === "Staff") {
        if (approved) {
            message = 'The form has been successfully processed!';
        } else {
            message = 'The form ' + "haven't" + ' been processed.';
        }
    }

    message += ' You can view it in your "My Completed Forms" page.';
    return message;
}

// Todo: solve bug that messages don't disappear when they get created one after another
// Display conformation message after an action have been executed on the page
function displayConfirmationMessage (pageDiv, message) {
    // Show confirmation message
    const div = "#" + pageDiv;
    $(div).prepend("<div id='submissionConfirmationMessage' class=\"w3-panel w3-green\">\n" +
        `<p>${message}</p>\n` +
        "</div>");

    // Make sure user can see the confirmation message at the top of the page, by scrolling up.
    window.scrollTo(0,0);

    // Only show the confirmation message for 5 seconds.
    setTimeout(function() {$('#submissionConfirmationMessage').fadeOut('slow');}, 5000);
}

// This function will close/kill the form modal, which is the form that is being currently displayed
function closeFormModal (mainModal) {
    //Todo: Ask for form to be saved or just save the form without asking.
    mainModal.remove();
}

// Return approval status based on boolean value and userType (Faculty or Staff)
function getWrittenApprovalStatus (status, userType) {
    let str = '';
    if (status === true) {
        if (userType === "Faculty") {
            str = "Approved";
        } else if (userType === "Staff") {
            str = "Processed";
        }
    } else if (status === false) {
        if (userType === "Faculty") {
            str = "Declined";
        } else if (userType === "Staff") {
            str = "Not Processed";
        }
    } else if (status === null) {
        str = "N/A"
    }

    return str;
}

// Return approval status in HTML form based on boolean value and userType (Faculty or Staff)
function getApprovalStatusHTML (status, userType) {
    const approvalStatus = getWrittenApprovalStatus(status, userType);

    let str = '';
    if (status === null) {
        let approvalTooltip;
        if (userType === "Faculty") {
            approvalTooltip = '<span>' + "Waiting to be approved or declined" + '</span>';

        } else if (userType === "Staff") {
            approvalTooltip = '<span>' + "Waiting to be processed or not processed" + '</span>';
        }
        str = `            <td class="approval_tooltip" data-tooltip-content="${approvalTooltip}" >${approvalStatus}<td>\n`;

    } else {
        str = `            <td>${approvalStatus}<td>\n`;
    }

    return str;
}

// Return declined reason based on boolean value and userType (Faculty or Staff)
function getDeclinedReasonTooltipText (status, userType) {
    let str = '';
    if (status === true) {
        if (userType === "Faculty") {
            str = '<span>' + "It is not applicable since it is approved" + '</span>';
        } else if (userType === "Staff") {
            str = '<span>' + "It is not applicable since it is processed" + '</span>';
        }
    } else if (status === false) {
        if (userType === "Faculty") {
            str = '<span>' + "Reason for not approving (declining) the form" + '</span>';
        } else if (userType === "Staff") {
            str = '<span>' + "Reason for not processing the form" + '</span>';
        }
    } else if (status === null) {
        if (userType === "Faculty") {
            str = '<span>' + "Waiting to be approved or declined" + '</span>';
        } else if (userType === "Staff") {
            str = '<span>' + "Waiting to be processed or not processed" + '</span>';
        }
    }

    return str;
}

// Return exact day of approval based on date object and userType (Faculty or Staff)
function getApprovalExactDayTooltipText (date, userType) {
    let str = '';
    if (date === null) {
        if (userType === "Faculty") {
            str = '<span>' + "Waiting to be approved or declined" + '</span>';
        } else if (userType === "Staff") {
            str = '<span>' + "Waiting to be processed or not processed" + '</span>';
        }
    } else {
        str = '<span>' + getExactDateAndTime(date.toDate())  + '</span>';
    }

    return str;
}

// Create and return a table for the content of the form that is represented in the database as an array of objects
function createTableFromArray (array) {
    let html = '';

    for (let i = 0; i < array.length; i++) {
        // Get the table column titles ('th')
        if (i == 0) {
            html +=
                '<div class="w3-container form_content_text">\n' +
                '   <table id="classesTable" class="w3-table-all w3-card">\n';

            let titleRow = '       <tr>\n';
            let dataRow = '       <tr>\n';

            // Get column/table titles and column/table data from ith object of 'content' array
            for (var objKey in array[i]) {
                titleRow += `        <th>${objKey.split("_")[1]}<th>\n`;
                dataRow += `            <td>${array[i][objKey]}<td>\n`;
            }
            // Close "title" row and "data" row
            titleRow += '       </tr>\n';
            dataRow += '       </tr>\n';

            // Insert the first row of title and data in the table
            html += titleRow;
            html += dataRow;

        } else {
            html += '<tr>\n';
            // Populate the table columns for the Jth row
            for (var objKey in array[i]) {
                html += `            <td>${array[i][objKey]}<td>\n`;
            }
            // Close "data" row
            html += '</tr>\n';
        }

        // Close table element
        if (i == array.length - 1) {
            html +=
                '   </table>\n' +
                '</div>\n';
        }
    }

    return html;
}


/********* Don't delete the code below! (Just separating the code for now) **********/

// Sort "Date" objects in descending order (newer Dates first)
function sortDescending (a, b) {
    return (a.date < b.date) ? 1 : -1;
}

// Sort "Date" objects in ascending order (older Dates first)
function sortAscending (a, b) {
    return (a.date > b.date) ? 1 : -1;
}

// Sort "dueDate" objects in ascending order (older Dates first)
function sortDueDateAndSubmDate (a, b) {
    return (a.date > b.date) ? 1 : -1;
}

// Get abbreviation of the "userType" or "facultyRole" for the checkmark text of the progress bar
function getAbbreviation (userType, facultyRole) {
    let abbreviation = "";
    if (userType === "Staff") {
        abbreviation = "Staff";
    } else if (userType === "Faculty") {
        if (facultyRole === "Advisor") {
            abbreviation = "Advisor";
        } else if (facultyRole === "Head of Department") {
            abbreviation = "Head of<br>" + "Dept.";
        } else if (facultyRole === "Dean of Students") {
            abbreviation = "Dean";
        }
    } else {
        console.log("Error in function \"getAbbreviation()\".");
    }

    return abbreviation;
}

// Search whatever is in input box for the student's name or ID. This function is called for both "click" and "enter" pressed
function searchButtonPressed () {
    const txt = document.getElementById("searchInput").value;

    if (txt.length > 0) {
        if (!isNaN(txt)) { // It's a number
            if (txt.length == 9) {
                getStudentByID(txt);
            } else {
                displayMessage("Please, give a valid ID, with 9 digits.");
            }
        } else { // It's a string
            getStudentByName(txt);
        }
    } else {
        displayMessage("Please, type either the name of the student or their ID (900 number).");
    }
}

// Whenever a key is pressed in the student's search input, decides whether or not to hide or show the "searchButton"
// Also, if "Enter" is pressed, call "searchButtonPressed()"
function keyPressed (event) {
    const txt = document.getElementById("searchInput").value;

    if (txt.length == 0) {
        document.getElementById("searchButton").style.visibility = "hidden";
    } else {
        document.getElementById("searchButton").style.visibility = "visible";
    }

    if (event.key === "Enter") {
        searchButtonPressed();
    }
}

// Display a given message to the student coordinator's page when their search had not result or when they typed in a wrong format
function displayMessage (msg) {
    const parentDiv = document.getElementById("studentsList");

    // Clear previous elements (students)
    parentDiv.innerHTML = '';

    let result_h4 = document.createElement('h4');
    result_h4.innerHTML = msg;
    result_h4.style.textAlign = "center";
    parentDiv.appendChild(result_h4);
}

// Display a student entry in the page grid given
function displayStudentEntry (parentDiv, doc) {
    const pawsDoc = doc.data();

    let leftDiv = document.createElement('div');
    leftDiv.className = "w3-left";
    leftDiv.innerHTML = pawsDoc.name.last + ", " + pawsDoc.name.first;

    let middleDiv = document.createElement('div');
    middleDiv.style.position = "absolute";
    middleDiv.style.left = "40%";
    middleDiv.innerHTML = pawsDoc.major.majorTitle;

    let rightDiv = document.createElement('div');
    rightDiv.className = 'w3-right';
    rightDiv.innerHTML = pawsDoc.userID;

    let buttonDiv = document.createElement('button');
    buttonDiv.className = "w3-button w3-block w3-white w3-round-xlarge button_properties student_entry_button";
    buttonDiv.addEventListener("click", studentEntryClicked);
    buttonDiv.studentID = doc.id;
    buttonDiv.studentFullName = pawsDoc.name.first + " " + pawsDoc.name.middle + " " + pawsDoc.name.last;

    buttonDiv.appendChild(leftDiv);
    buttonDiv.appendChild(middleDiv);
    buttonDiv.appendChild(rightDiv);

    parentDiv.appendChild(buttonDiv);
}

// Search the given student's ID and populate it to the student coordinator page
function getStudentByID (userID) {
    const parentDiv = document.getElementById("studentsList");

    // Clear previous elements (students)
    parentDiv.innerHTML = '';

    const pawsStudentsCollection = pawsDB.collection("users").where("userType", "==", "Student");
    pawsStudentsCollection.where("userID", "==", userID).get().then(function(querySnapshot) {
        if (querySnapshot.size == 0) {
            displayMessage("No matches!");
        }

        querySnapshot.forEach(function (doc) {
            // doc.data() is never undefined for query doc snapshots
            displayStudentEntry(parentDiv, doc);
        });
    });
}

// Search the given student's name(s) and populate it to the student coordinator page
function getStudentByName (name) {
    const parentDiv = document.getElementById("studentsList");

    // Clear previous elements (students)
    parentDiv.innerHTML = '';

    const names = name.toLowerCase().split(" ");

    let completeMatches = [];

    // Check to see if a person has this firstName and lastName (check for complete match)
    if (names.length == 2) {
        // Make sure the name is in the correct form, since Firebase is case sensitive.
        names[0] = names[0].charAt(0).toUpperCase() + names[0].substring(1, names[0].length);
        names[1] = names[1].charAt(0).toUpperCase() + names[1].substring(1, names[1].length);

        const pawsStudentsCollection = pawsDB.collection("users").where("userType", "==", "Student");
        pawsStudentsCollection.where("name.first", "==", names[0]).get().then(function(querySnapshot) {
            querySnapshot.forEach(function (doc) {
                const pawsDoc = doc.data();
                if (pawsDoc.name.last == names[1]) {
                    completeMatches.push(doc)
                }
            });

            pawsStudentsCollection.where("name.last", "==", names[0]).get().then(function(querySnapshot) {
                querySnapshot.forEach(function (doc) {
                    const pawsDoc = doc.data();
                    if (pawsDoc.name.first == names[1]) {
                        completeMatches.push(doc)
                    }
                });

                // There's a student with this firstName and lastName in the database
                if (completeMatches.length > 0) {
                    for (let i = 0; i < completeMatches.length; i++) {
                        displayStudentEntry(parentDiv, completeMatches[i]);
                    }
                } else {
                    getAnyMatchingNames(parentDiv, names);
                }
            });
        });
    } else {
        getAnyMatchingNames(parentDiv, names);
    }
}

// Get any students in which has a firstName or lastName contained in the "names" array
function getAnyMatchingNames (parentDiv, names) {
    let usedIDs = [];
    for (let i = 0; i < names.length; i++) {
        // Make sure the name is in the correct form, since Firebase is case sensitive.
        names[i] = names[i].charAt(0).toUpperCase() + names[i].substring(1, names[i].length);

        const pawsStudentsCollection = pawsDB.collection("users").where("userType", "==", "Student");
        pawsStudentsCollection.where("name.last", "==", names[i]).get().then(function(querySnapshot) {
            querySnapshot.forEach(function (doc) {
                // doc.data() is never undefined for query doc snapshots
                // Check whether or not we have already displayed that user, to avoid repetition
                if (!usedIDs.includes(doc.id)) {
                    displayStudentEntry(parentDiv, doc);

                    // Add displayed student to the list of students in which we have displayed already
                    usedIDs.push(doc.id);
                }
            });
        });

        pawsStudentsCollection.where("name.first", "==", names[i]).get().then(function(querySnapshot) {
            if (querySnapshot.size == 0 && usedIDs.length == 0 && i == names.length - 1) {
                displayMessage("No matches!");
            }

            querySnapshot.forEach(function (doc) {
                // doc.data() is never undefined for query doc snapshots
                // Check whether or not we have already displayed that user, to avoid repetition
                if (!usedIDs.includes(doc.id)) {
                    displayStudentEntry(parentDiv, doc);

                    // Add displayed student to the list of students in which we have displayed already
                    usedIDs.push(doc.id);
                }
            });
        });
    }
}

// Get all students in the database and populate them in the student coordinator's page
function getAllStudents () {
    const parentDiv = document.getElementById("studentsList");

    // Clear previous elements (students)
    parentDiv.innerHTML = '';

    const pawsStudentsCollection = pawsDB.collection("users").where("userType", "==", "Student");
    pawsStudentsCollection.get().then(function(querySnapshot) {
        querySnapshot.forEach(function (doc) {
            // doc.data() is never undefined for query doc snapshots
            displayStudentEntry(parentDiv, doc);
        });
    });
}

function getAdvisor() {
    return pawsDB.collection("users").doc(getUserName()).get().then(function(doc) {
        if (doc.exists) {
            const docData = doc.data();
            return docData.advisor.advisorUsername.toString();
        } else {
            // doc.data() will be undefined in this case
            console.log("No such document!");
        }
    }).catch(function(error) {
        console.log("Error getting document:", error);
    });
}

function getStudentMajor() {
    return pawsDB.collection("users").doc(getUserName()).get().then(function(doc) {
        if (doc.exists) {
            const docData = doc.data();
            let studentMajor = docData.major.department;
            return studentMajor.toString();
        } else {
            // doc.data() will be undefined in this case
            console.log("No such document!");
        }
    }).catch(function(error) {
        console.log("Error getting document:", error);
    });
}

function getUnitHead() {
     return getStudentMajor().then(function(studentMajor) {
        return pawsDB.collection("users").where("facultyRole", "==", "Head of Department").where("department", "==", studentMajor).get().then(function (querySnapshot) {
            let result = [];
            querySnapshot.forEach(function (doc) {
                const pawsDoc = doc.data();
                let email2 = pawsDoc.email;
                result.push(email2.substring(0, email2.indexOf("@")));
            });
            return result[0].toString();
        });
    });
}

function getRandomStaff() {
    return pawsDB.collection("users").where("userType", "==", "Staff").get().then(function(querySnapshot) {
        let allStaff = [];
        querySnapshot.forEach(function (doc) {
            const pawsDoc = doc.data();
            allStaff.push(pawsDoc);
        });
        let random = Math.floor(Math.random() * Math.floor(allStaff.length));
        let email2 = allStaff[random].email;

        return email2.substring(0,email2.indexOf("@"));
    });
}

function sendEmail(studentName, message, tracks) {
    //var email = tracks + "@my.fit.edu";
    var data = JSON.stringify({
        "personalizations": [
            {
                "to": [
                    {
                        "email": "mcnspa@gmail.com",
                        "name": "McNels"
                    }
                ],
                "dynamic_template_data": {
                    "firstName": studentName,
                    "notification": message
                },
                "subject": "You have a new notification!"
            }
        ],
        "from": {
            "email": "mcnspa@gmail.com",
            "name": "Form Buster"
        },
        "reply_to": {
            "email": "noreply@formbuster.me",
            "name": "Form Buster"
        },
        "content": [
            {
                "type": "text/html",
                "value": " "
            }
        ],
        "template_id": "d-ddecfdb62fbf440cad3b971a9ddc597b"
    });

    var xhr = new XMLHttpRequest();
    xhr.withCredentials = true;

    xhr.addEventListener("readystatechange", function () {
        if (this.readyState === this.DONE) {
            console.log(this.responseText);
        }
    });

    xhr.open("POST", "https://api.sendgrid.com/v3/mail/send");
    xhr.setRequestHeader("authorization", "Bearer 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");
    xhr.setRequestHeader("content-type", "application/json");

    xhr.send(data);
    // console.log("email sent!");
    //alert("email sent!");
}

// Print the term dates for each type of form, for visualization and test purposes only
function printTermDates () {
    const formDates = getFormDatesForAllTerms(moment());

    for (let key in formDates) {
        console.log({
            "formName": key,
            "summer_earliestDate": formDates[key].summer_earliestDate.format('MMMM Do YYYY, h:mm:ss a'),
            "summer_latestDate": formDates[key].summer_latestDate.format('MMMM Do YYYY, h:mm:ss a')
        });
        console.log({
            "formName": key,
            "fall_earliestDate": formDates[key].fall_earliestDate.format('MMMM Do YYYY, h:mm:ss a'),
            "fall_latestDate": formDates[key].fall_latestDate.format('MMMM Do YYYY, h:mm:ss a')
        });
        console.log({
            "formName": key,
            "spring_earliestDate": formDates[key].spring_earliestDate.format('MMMM Do YYYY, h:mm:ss a'),
            "spring_latestDate": formDates[key].spring_latestDate.format('MMMM Do YYYY, h:mm:ss a')
        });

        const availableTerms = getTermsAvailableForForms();
        console.log({"formName": key, "availableTerms": availableTerms[key]});

        const unavailableTerms = getTermsUnavailableForForms();
        console.log({"formName": key, "unavailableTerms": unavailableTerms[key]});

        console.log("\n\n");
    }

    console.log("\n\nTEST");
    getFormDueDate("Registration", "Fall", "aadkins2016", moment()).then(function(result) {
        console.log(result.format('MMMM Do YYYY, h:mm:ss a'));
    });

    getFormDueDate("Coprerequisite", "Fall", "aadkins2016", moment()).then(function(result) {
        console.log(result.format('MMMM Do YYYY, h:mm:ss a'));
    });

    getFormDueDate("Coprerequisite", "Fall", "aadkins2016", moment()).then(function(result) {
        console.log(result.format('M/D/YY'));
        console.log(result.format('M/D/YY [at] HH:mm:ss'));
    });
}

// Return an object with all the form dates for all the terms
function getFormDatesForAllTerms (referenceDate) {
    const year = parseInt(referenceDate.format("YYYY"));
    const middleYear_date = moment(`0701${year}130000`, "MMDDYYYYHHmmss"); // July 1st

    // "earliestDate_offset" and "latestDate_offset" are only applicable to Spring terms, because its date window
    // spans 2 years at the same time
    let earliestDate_offset = 0;
    let latestDate_offset = 0;
    if (referenceDate.diff(middleYear_date) < 0) {
        earliestDate_offset -= 1;
    } else {
        latestDate_offset += 1;
    }

    let formDates = {};

    let summer_earliestDate;
    let summer_latestDate;
    let fall_earliestDate;
    let fall_latestDate;
    let spring_earliestDate;
    let spring_latestDate;

    /* REGISTRATION */
    // SUMMER
    // last week (5th week) of January, on Monday
    summer_earliestDate = moment(`0101${year}080000`, "MMDDYYYYHHmmss").add(4, 'week').day("Monday");
    // third week of May, on Friday
    summer_latestDate = moment(`0501${year}170000`, "MMDDYYYYHHmmss").add(2, 'week').day("Friday");

    // FALL
    // second week of April, on Monday
    fall_earliestDate = moment(`0401${year}080000`, "MMDDYYYYHHmmss").add(1, 'week').day("Monday");
    // last week (5th week) of August, on Friday
    fall_latestDate = moment(`0801${year}170000`, "MMDDYYYYHHmmss").add(4, 'week').day("Friday");

    // SPRING
    // third week of November, on Monday
    spring_earliestDate = moment(`1101${year + earliestDate_offset}080000`, "MMDDYYYYHHmmss").add(2, 'week').day("Monday");
    // second week of January, on Friday
    spring_latestDate = moment(`0101${year + latestDate_offset}170000`, "MMDDYYYYHHmmss").add(1, 'week').day("Friday");

    formDates.registration = {"summer_earliestDate": summer_earliestDate, "summer_latestDate": summer_latestDate,
        "fall_earliestDate": fall_earliestDate, "fall_latestDate": fall_latestDate,
        "spring_earliestDate": spring_earliestDate, "spring_latestDate": spring_latestDate};


    /* COPREREQUISITE */
    // SUMMER
    // last week (5th week) of January, on Monday
    summer_earliestDate = moment(`0101${year}080000`, "MMDDYYYYHHmmss").add(4, 'week').day("Monday");
    // third week of May, on Friday
    summer_latestDate = moment(`0501${year}170000`, "MMDDYYYYHHmmss").add(2, 'week').day("Friday");

    // FALL
    // second week of April, on Monday
    fall_earliestDate = moment(`0401${year}080000`, "MMDDYYYYHHmmss").add(1, 'week').day("Monday");
    // last week (5th week) of August, on Friday
    fall_latestDate = moment(`0801${year}170000`, "MMDDYYYYHHmmss").add(4, 'week').day("Friday");

    // SPRING
    // third week of November, on Monday
    spring_earliestDate = moment(`1101${year + earliestDate_offset}080000`, "MMDDYYYYHHmmss").add(2, 'week').day("Monday");
    // second week of January, on Friday
    spring_latestDate = moment(`0101${year + latestDate_offset}170000`, "MMDDYYYYHHmmss").add(1, 'week').day("Friday");

    formDates.coprerequisite = {"summer_earliestDate": summer_earliestDate, "summer_latestDate": summer_latestDate,
        "fall_earliestDate": fall_earliestDate, "fall_latestDate": fall_latestDate,
        "spring_earliestDate": spring_earliestDate, "spring_latestDate": spring_latestDate};


    return formDates;
}

// Return an array with the name of all the terms available for starting a form TODAY
function getTermsAvailableForForms () {
    const currentDate = moment();
    const formDates = getFormDatesForAllTerms(moment());

    let availableTerms = {};
    for (let key in formDates) {
        let terms = [];
        if (formDates[key].summer_earliestDate.subtract(weeksBefore, 'week').diff(currentDate) < 0 && currentDate.diff(formDates[key].summer_latestDate) < 0) {
            const termYear = formDates[key].summer_latestDate.format('YYYY');
            terms.push("Summer " + termYear);
        }
        if (formDates[key].fall_earliestDate.subtract(weeksBefore, 'week').diff(currentDate) < 0 && currentDate.diff(formDates[key].fall_latestDate) < 0) {
            const termYear = formDates[key].fall_latestDate.format('YYYY');
            terms.push("Fall " + termYear);
        }
        if (formDates[key].spring_earliestDate.subtract(weeksBefore, 'week').diff(currentDate) < 0 && currentDate.diff(formDates[key].spring_latestDate) < 0) {
            const termYear = formDates[key].spring_latestDate.format('YYYY');
            terms.push("Spring " + termYear);
        }

        availableTerms[key] = terms;
    }

    return availableTerms;
}

// Return an array with the name of all the terms that are unavailable for starting a form TODAY
function getTermsUnavailableForForms () {
    const currentDate = moment();
    const formDates = getFormDatesForAllTerms(moment());

    let unavailableTerms = {};
    for (let key in formDates) {
        let terms = [];
        if (!(formDates[key].summer_earliestDate.subtract(weeksBefore, 'week').diff(currentDate) < 0) || !(currentDate.diff(formDates[key].summer_latestDate) < 0)) {
            const termYear = formDates[key].summer_latestDate.format('YYYY');
            terms.push("Summer " + termYear);
        }
        if (!(formDates[key].fall_earliestDate.subtract(weeksBefore, 'week').diff(currentDate) < 0) || !(currentDate.diff(formDates[key].fall_latestDate) < 0)) {
            const termYear = formDates[key].fall_latestDate.format('YYYY');
            terms.push("Fall " + termYear);
        }
        if (!(formDates[key].spring_earliestDate.subtract(weeksBefore, 'week').diff(currentDate) < 0) || !(currentDate.diff(formDates[key].spring_latestDate) < 0)) {
            const termYear = formDates[key].spring_latestDate.format('YYYY');
            terms.push("Spring " + termYear);
        }

        unavailableTerms[key] = terms;
    }

    return unavailableTerms;
}

// Adds the available terms to their respective forms, in the "Start a Form" page
function addAvailableTermsToFormName () {
    // Add available terms right besides to the form names
    const availableTerms = getTermsAvailableForForms();

    for (let key in availableTerms) {
        let terms = "";
        for (let i = 0; i < availableTerms[key].length; i++) {
            const formName = key;
            const fullTerm = availableTerms[key][i];

            const openDate = getFormOpenDate(formName, fullTerm).format('M/D/YY [at] HH:mm:ss');
            const closeDate = getFormCloseDate(formName, fullTerm).format('M/D/YY [at] HH:mm:ss');

            const formDatesHTML = `<span><u>Open Date:</u> ${openDate}<br><br><u>Close Date:</u> ${closeDate}</span>`;

            if (i == 0) {
                terms += `<span class="term_tooltip" data-tooltip-content="${formDatesHTML}">${availableTerms[key][i]}</span>`;
            } else {
                terms += `, <span class="term_tooltip" data-tooltip-content="${formDatesHTML}">${availableTerms[key][i]}</span>`;
            }
        }
        if (terms.length == 0) {
            terms = "Form is not available yet";
        }
        const termsHTML = `<span style="font-size: 17px; color: #8E8E8E">(${terms})</span>`;

        eval(`document.getElementById("${key}-card-title").innerHTML += ' ${termsHTML}';`);
    }

    // Initialize terms tooltip
    $(document).ready(function() {
        $('.term_tooltip').tooltipster({
            theme: ["tooltipster-shadow", "tooltipster-shadow-customized"],
            side: "bottom",
            animation: "grow",
        });
    });
}



// --------------------------------------------------------------
// Refactored code that was in other JS files.
// This is used by Faculty, Staff, and Stuident Coordinators


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
            const schoolYear = getSchoolYear(stuDocData.totalCredits);
            const schoolYearHTML = `<span><u>Total Credits</u><br>${stuDocData.totalCredits}</span>`;
            const majorCodeHTML = '<span><u>Major Code</u><br>' + stuDocData.major.majorCode + '</span>';
            const advisorID = stuDocData.advisor.advisorUsername;

            wholeHTML +=
                '<h3 style="border-bottom: 2px solid; display: inline-block">' + studentFullName + '</h3>\n' +
                '<h5>Student ID: <span style="color: #000">' + stuDocData.userID + '</span></h5>\n' +
                '<h5>TRACKS: <span style="color: #000">' + studentID + '</span></h5>\n' +
                '<h5>Email: <span style="color: #000">' + stuDocData.email + '</span></h5>\n' +
                '<h5>Academic Standing: <span style="color: #000" class="student_info_tooltip" data-tooltip-content="' + schoolYearHTML + '">'
                + schoolYear + '</span></h5>\n' +
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

                    // Insert button
                    const viewRecordsHTML = '<span>View the form records of this student</span>';
                    wholeHTML +=
                        '<div style="text-align: center; margin-top: 10px; margin-bottom: 15px">\n' +
                        '    <button class="popup_button button_properties button_info_tooltip" onclick="viewStudentRecords(event)"'
                        + 'data-tooltip-content="' + viewRecordsHTML + '" id="viewRecordsBtn">View Records' + '</button>\n' +
                        '</div>\n';

                    // Close the rest of the DIVs
                    wholeHTML +=
                        '</div>\n' +
                        '</div>\n' +
                        '</div>\n';

                    // Insert the HTML at the end of "pageDiv"
                    pageDiv.insertAdjacentHTML("beforeend", wholeHTML);

                    // Insert information about this student into these buttons
                    document.getElementById("viewRecordsBtn").studentID = studentID;
                    document.getElementById("viewRecordsBtn").studentFullName = studentFullName;

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
    // Remove pop up (mainModal)
    document.getElementById("mainModal").remove();

    // Hide studentsPageTitle
    document.getElementById("studentsPageTitle").style.display = "none";

    const studentSearchView = document.getElementById("studentSearchView");
    const studentFormsView = document.getElementById("studentFormsView");

    studentSearchView.style.display = "none";
    studentFormsView.style.display = "block";

    const studentTitle = document.getElementById("studentTitle");
    studentTitle.innerHTML = "Forms of " + '<strong>' + event.currentTarget.studentFullName + '</strong>' + '<br>';
    studentTitle.style.marginBottom = "12px";

    displayStudentForms(event.currentTarget.studentID);
}

// Hides inProgressForms page and displays (unhide) the completedForms page
function completedFormsButtonPressed () {
    const completedFormsButton = document.getElementById("completedFormsButton");
    const completedFormsList = document.getElementById("completedFormsList");

    const inProgressFormsButton = document.getElementById("inProgressFormsButton");
    const inProgressFormsList = document.getElementById("inProgressFormsList");

    inProgressFormsButton.style.pointerEvents = "all";
    inProgressFormsButton.style.cursor = "pointer";
    inProgressFormsButton.style.borderBottomColor = "transparent";
    inProgressFormsButton.style.color = "#05307d";

    completedFormsButton.style.pointerEvents = "none";
    completedFormsButton.style.cursor = "default";
    completedFormsButton.style.borderBottomColor = "#054ee1";
    completedFormsButton.style.color = "#054ee1";

    completedFormsList.style.display = "block";
    inProgressFormsList.style.display = "none";
}

// Hides completedForms page and displays (unhide) the inProgressForms page
function inProgressFormsButtonPressed () {
    const completedFormsButton = document.getElementById("completedFormsButton");
    const completedFormsList = document.getElementById("completedFormsList");

    const inProgressFormsButton = document.getElementById("inProgressFormsButton");
    const inProgressFormsList = document.getElementById("inProgressFormsList");

    completedFormsButton.style.pointerEvents = "all";
    completedFormsButton.style.cursor = "pointer";
    completedFormsButton.style.borderBottomColor = "transparent";
    completedFormsButton.style.color = "#05307d";

    inProgressFormsButton.style.pointerEvents = "none";
    inProgressFormsButton.style.cursor = "default";
    inProgressFormsButton.style.borderBottomColor = "#054ee1";
    inProgressFormsButton.style.color = "#054ee1";

    inProgressFormsList.style.display = "block";
    completedFormsList.style.display = "none";
}

// Populate the completedForms and the inProgressForms into this page
function displayStudentForms (studentID) {
    const completedFormsList = document.getElementById("completedFormsList");
    const inProgressFormsList = document.getElementById("inProgressFormsList");

    // Clear old displayed Student forms.
    completedFormsList.innerHTML = '';
    inProgressFormsList.innerHTML = '';

    getStudentForms("studentsPage", "completedFormsList", studentID, "completedForms", displayFormReadMode);
    getStudentForms("studentsPage", "inProgressFormsList", studentID, "inProgressForms", displayFormReadMode);

    // Load completed forms of the student by default
    completedFormsButtonPressed();
}

// Switch back to student's list when you click on the back button
function displayStudentSearchListPage () {
    // Unhide studentsPageTitle
    document.getElementById("studentsPageTitle").style.display = "block";

    // Clear "completedFormsList" and "inProgressFormsList"
    document.getElementById("completedFormsList").innerHTML = '';
    document.getElementById("inProgressFormsList").innerHTML = '';

    const studentSearchView = document.getElementById("studentSearchView");
    const studentFormsView = document.getElementById("studentFormsView");

    studentSearchView.style.display = "block";
    studentFormsView.style.display = "none";
}
