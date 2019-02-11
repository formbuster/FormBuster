
// Constants for when a button in the sidebar is highlighted or not
const btnHighlighted = "w3-bar-item w3-button w3-hover-theme w3-large w3-text-theme-red w3-background";
const btnNotHighlighted = "w3-bar-item w3-button w3-hover-theme w3-large";

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
    return window.location.href.toString().substring(window.location.href.toString().indexOf("user")+5);
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

// Get submission date from a Firebase "doc", in the format: MM/DD/YYYY
function getSubmDate (doc) {
    return getFormattedDate(getDateFromTimestamp(doc.id.toString().split('_')[1]));
}

// Get exact submission date and time from a Firebase "doc", in the format: MM/DD/YYYY at HH:MM:SS
function getExactSubmDate (doc) {
    return getExactDateAndTime(getDateFromTimestamp(doc.id.toString().split('_')[1]));
}

// Get the name of the form from a Firebase "doc"
function getFormName (doc) {
    return doc.id.toString().split('_')[0];
}

// Get a Promise containing the due date given the name of the form [actual due date will be computed later]
function getFormDueDate (formName) {
    return pawsDB.collection("formDeadlines").doc(formName).get().then(function(doc) {
        if (doc.exists) {
            const docData = doc.data();
            return docData.deadline.toDate();
        } else {
            // doc.data() will be undefined in this case
            console.log("No such document!");
        }
    }).catch(function(error) {
        console.log("Error getting document:", error);
    });
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

    formDB.collection("users").doc(studentID).collection(formsFolder).get().then(function(querySnapshot) {
        if (querySnapshot.size == 0) {
            let result_h4 = document.createElement('h4');
            result_h4.innerHTML = "No forms were found.";
            result_h4.style.textAlign = "left";
            document.getElementById(targetDiv).appendChild(result_h4);
        }

        querySnapshot.forEach(function(doc) {
            const formDoc = doc.data();
            const formName = getFormName(doc);
            const submDate = getSubmDate(doc);
            const exactSubmDate = getExactSubmDate(doc);
            const dueDatePromise = getFormDueDate(formName);
            const approvals = formDoc.approvals;

            var main_div = document.createElement("div");
            main_div.className = "w3-white w3-button w3-block w3-leftbar w3-border-theme w3-round-xlarge w3-margin-bottom";
            main_div.style.display = "none"; // Make main button hidden while we are populating it

            //make a new div with class name, and append it to main div
            var first_nested_div = document.createElement("div");
            first_nested_div.className = "w3-left";
            main_div.appendChild(first_nested_div);

            //make an h3 tag, make text, append text to h3 tag, append h3 tag to first_nested_div
            var h3_form_name = document.createElement('h3');
            h3_form_name.appendChild(document.createTextNode(formName));
            h3_form_name.setAttribute("data-tooltip-content", '<span>' + formName + " Form" + '</span>');
            h3_form_name.className = "form_name_tooltip";
            first_nested_div.appendChild(h3_form_name);

            //generate check marks
            for (let i = 0; i < approvals.length; i++) {
                pawsDB.collection("users").doc(approvals[i].tracksID).get().then(function(doc) {
                    if (doc.exists) {
                        const pawsDoc = doc.data();

                        var span_check_mark = document.createElement('span');

                        var userInfo = pawsDoc.userType;
                        if (userInfo != "Staff") { // then it means it's a Faculty member
                            userInfo = pawsDoc.facultyRole;
                        }

                        let dateInfo;
                        if (approvals[i].date != null) {
                            dateInfo = getExactDateAndTime(approvals[i].date.toDate());
                        } else {
                            dateInfo = "Waiting for approval."
                        }
                        const tooltipTitle = '<span>' + '<u>' + userInfo + '</u>' + '</br>' + pawsDoc.name.first + " " + pawsDoc.name.last
                            + '</br>' + '</br>' + '<u>' + "Date" + '</u>' + '</br>' + dateInfo + '</span>';
                        span_check_mark.setAttribute("data-tooltip-content", tooltipTitle);

                        if (approvals.length > 0) {
                            span_check_mark.classList.add("w3-margin-left");
                        }
                        if (approvals[i].status == null) {
                            // Has not been approved so use the grey checkWindowWidth mark style
                            span_check_mark.className = "bubble_tooltip w3-left w3-badge w3-grey w3-large";
                            span_check_mark.appendChild(document.createTextNode("✓"));
                        } else if (approvals[i].status == true) {
                            // Green checkWindowWidth mark since it has already been approved
                            span_check_mark.className = "bubble_tooltip w3-left w3-badge w3-green w3-large";
                            span_check_mark.appendChild(document.createTextNode("✓"));
                        } else if (approvals[i].status == false) {
                            // Red checkWindowWidth mark since it has been declined
                            span_check_mark.className = "bubble_tooltip w3-left w3-badge w3-red w3-large";
                            span_check_mark.appendChild(document.createTextNode("x"));
                        }
                        if (i > 0) {
                            span_check_mark.classList.add("w3-margin-left");
                        }
                        span_check_mark.style.width = "30px";
                        first_nested_div.appendChild(span_check_mark);
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
            h4_submission_date.setAttribute("data-tooltip-content", '<span>' + exactSubmDate + '</span>');
            h4_submission_date.className = "form_date_tooltip";


            second_nested_div.appendChild(h4_submission_date);
            var h4_due_date = document.createElement('h3');

            dueDatePromise.then(function(result) {
                h4_due_date.appendChild(document.createTextNode("Due Date: " + getFormattedDate(result)));
                h4_due_date.style.textAlign = "left";
                h4_due_date.setAttribute("data-tooltip-content", '<span>' + getExactDateAndTime(result) + '</span>');
                h4_due_date.className = "form_date_tooltip";

                second_nested_div.appendChild(h4_due_date);
                main_div.appendChild(second_nested_div);

                if (forEachIteration == querySnapshot.size - 1) {
                    // Initialize tooltips after all the elements have been created
                    $(document).ready(function() {
                        $('.form_name_tooltip').tooltipster({
                            theme: ["tooltipster-shadow", "tooltipster-shadow-customized"],
                            side: "top",
                            animation: "grow",
                            functionPosition: function(instance, helper, position){
                                position.coord.top += 10;
                                return position;
                            }
                        });

                        $('.bubble_tooltip').tooltipster({
                            theme: ["tooltipster-shadow", "tooltipster-shadow-customized"],
                            side: "bottom",
                            animation: "grow",
                        });

                        $('.form_date_tooltip').tooltipster({
                            theme: ["tooltipster-shadow", "tooltipster-shadow-customized"],
                            position: "left",
                            animation: "grow",
                        });
                    });
                }

                // Make main button visible again
                main_div.style.display = "block";

                forEachIteration++;
            });

            // another way to call function "onclick" --> main_div.onclick = function() {console.log("clicked")};
            main_div.addEventListener("click", mainButtonFunction);
            main_div.pageDiv = pageDiv;
            main_div.studentID = studentID;
            main_div.formsFolder = formsFolder;
            main_div.formID = doc.id;
            document.getElementById(targetDiv).appendChild(main_div);
        });
    }).catch(function(error) {
        console.log("Error getting documents (querySnapshot): ", error);
    });
}

// This will display the form in "pageDiv" and the user will be able to see all the information of the form
function displayFormReadMode (event) {
    const pageDiv = document.getElementById(event.currentTarget.pageDiv);
    const studentID = event.currentTarget.studentID;
    const formsFolder = event.currentTarget.formsFolder;
    const formID = event.currentTarget.formID;

    formDB.collection("users").doc(studentID).collection(formsFolder).doc(formID).get().then(function(doc) {
        if (doc.exists) {
            const formDoc = doc.data();
            const formName = getFormName(doc);
            const dueDatePromise = getFormDueDate(formName);

            pawsDB.collection("users").doc(studentID).get().then(function(studentDoc) {
                if (studentDoc.exists) {
                    const pawsStudentDoc = studentDoc.data();
                    const studentTooltipHTML = '<span>' + pawsStudentDoc.email + '</span>';
                    const studentName = '<span class="student_name_tooltip" data-tooltip-content="' + studentTooltipHTML + '" style="color: #000">'
                        + pawsStudentDoc.name.first + " " + pawsStudentDoc.name.last + '</span>';

                    dueDatePromise.then(function(result) {
                        const dueDate = '<span style="color: #000">' + getFormattedDate(result) + '</span>';
                        const dueDateHTML = '<span>' + getExactDateAndTime(result) + '</span>';

                        const submDate = '<span style="color: #000">' + getSubmDate(doc) + '</span>';
                        const exactSubmDateHTML = '<span>' + getExactSubmDate(doc) + '</span>';

                        const content = formDoc.content;
                        const approvals = formDoc.approvals;

                        let wholeHTML = '';
                        wholeHTML +=
                            '<div id="mainModal" class="w3-modal" style="display: block; padding-bottom: 100px">\n' +
                            '    <div class="w3-modal-content w3-round-xlarge w3-border-theme w3-bottombar">\n' +
                            '        <div class="w3-container">\n' +
                            '            <span onclick="closeFormModal(document.getElementsByClassName(\'w3-modal\').item(0))" ' +
                            'class="w3-button w3-display-topright w3-round-xlarge" style="padding: 4px 16px">&times;</span>\n' +
                            '            <div class="w3-text-theme-red" style="display: block; overflow: auto; margin-top: 15px">\n' +
                            '                <div class="w3-left">\n' +
                            '                    <h3>' + formName + ' Form</h3>\n' +
                            '                    <h3>Student: ' + studentName + '</h3>\n' +
                            '                </div>\n' +
                            '                <div class="w3-right">\n' +
                            '                    <h3 class="form_date_tooltip" data-tooltip-content="' + dueDateHTML + '" > Due Date: '
                            + dueDate + '</h3>\n' +
                            '                    <h3 class="form_date_tooltip" data-tooltip-content="' + exactSubmDateHTML + '" > Submission Date: '
                            + submDate + '</h3>\n' +
                            '                </div>\n' +
                            '            </div>\n' +
                            '            <div id ="first-page">\n';


                        // Iterate through the different sections of the form
                        // "formSection" will be the next object OR array of the "content" object (map)
                        for (var formSection in content) {
                            const formSectionTitle = formSection.split("_")[1];

                            wholeHTML +=
                                '<div style="display: block; overflow: auto">\n' +
                                `   <h5 style="text-decoration: underline; font-weight: bold">${formSectionTitle}</h5>\n` +
                                '</div>\n';

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
                                        `        <h5 class="form_content_text" style="float: left; font-weight: bold">${objKey.split("_")[1]}: </h5>\n` +
                                        `        <h5 class="form_content_text" style="float: left; margin-left: 5px;">${content[formSection][objKey]}</h5>\n` +
                                        '    </span>\n';
                                }

                                // Close container
                                wholeHTML += '</div>\n';
                            }
                        }


                        wholeHTML +=
                            '<div style="display: block; overflow: auto">\n' +
                            `   <h5 style="text-decoration: underline; font-weight: bold">Approvals</h5>\n` +
                            '</div>\n';

                        for (let i = 0; i < approvals.length; i++) {
                            const approvalID = approvals[i].tracksID;

                            pawsDB.collection("users").doc(approvalID).get().then(function(doc) {
                                if (doc.exists) {
                                    const pawsDoc2 = doc.data();
                                    const approvalObj = approvals[i];
                                    const approvalName = pawsDoc2.name.first + " " +  pawsDoc2.name.last;
                                    const approvalEmail = '<span>' + '<u>' + pawsDoc2.userType + '</u>' + '</br>' + pawsDoc2.email + '</span>';
                                    const approvalDate = (approvalObj.date == null) ? "N/A" : getFormattedDate(approvalObj.date.toDate());
                                    const approvalExactDate = (approvalObj.date == null) ? '<span>' + "Waiting to be approved or declined" + '</span>'
                                        : '<span>' + getExactDateAndTime(approvalObj.date.toDate())  + '</span>';
                                    const approvalStatus = getWrittenApprovalStatus(approvalObj.status);
                                    const approvalDeclinedReason = (approvalObj.declinedReason == null) ? "N/A" : approvalObj.declinedReason;

                                    let declinedReasonTooltip = '';
                                    if (approvalObj.status === true) {
                                        declinedReasonTooltip = '<span>' + "It is not applicable since it is approved" + '</span>';
                                    } else if (approvalObj.status === false) {
                                        declinedReasonTooltip = '<span>' + "Reason for not approving (declining) the form" + '</span>';
                                    } else if (approvalObj.status === null) {
                                        declinedReasonTooltip = '<span>' + "Waiting to be approved or declined" + '</span>';
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
                                    if (approvalObj.status === null) {
                                        const approvalTooltip = '<span>' + "Waiting to be approved or declined" + '</span>';
                                        wholeHTML += `            <td class="approval_tooltip" 
                                            data-tooltip-content="${approvalTooltip}" >${approvalStatus}<td>\n`;
                                    } else {
                                        wholeHTML += `            <td>${approvalStatus}<td>\n`;
                                    }
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

// This function will close/kill the form modal, which is the form that is being currently displayed
function closeFormModal (mainModal) {
    //Todo: Ask for form to be saved or just save the form without asking.
    mainModal.remove();
}

// Return approval status based on boolean value
function getWrittenApprovalStatus (status) {
    let str = '';
    if (status === true) {
        str = "Approved";
    } else if (status === false) {
        str = "Declined";
    } else if (status === null) {
        str = "N/A"
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
    console.log(txt); //they share the same id, so one needs to change.

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
