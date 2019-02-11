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

//Todo: dynamically return userName
function getUserName() {
    // "aadkins2016"
    // "eshelton"
    // "bpetty"
    return "aadkins2016";
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
                        const userType = pawsDoc.userType;

                        var span_check_mark = document.createElement('span');

                        var userInfo = userType;
                        if (userInfo != "Staff") { // then it means it's a Faculty member
                            userInfo = pawsDoc.facultyRole;
                        }

                        let dateInfo;
                        if (approvals[i].date != null) {
                            dateInfo = getExactDateAndTime(approvals[i].date.toDate());
                        } else if (userType === "Faculty") {
                            dateInfo = "Waiting for approval."
                        } else if (userType === "Staff") {
                            dateInfo = "Waiting for processing."
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

    formDB.collection("users").doc(userID).collection(formsFolder).get().then(function(querySnapshot) {
        if (querySnapshot.size == 0) {
            let result_h4 = document.createElement('h4');
            result_h4.innerHTML = "No forms were found.";
            result_h4.style.textAlign = "left";
            document.getElementById(targetDiv).appendChild(result_h4);
        }

        querySnapshot.forEach(function(formReference) {
            formReference.data().formRef.get().then(function(doc) {
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
                            const userType = pawsDoc.userType;

                            var span_check_mark = document.createElement('span');

                            var userInfo = userType;
                            if (userInfo != "Staff") { // then it means it's a Faculty member
                                userInfo = pawsDoc.facultyRole;
                            }

                            let dateInfo;
                            if (approvals[i].date != null) {
                                dateInfo = getExactDateAndTime(approvals[i].date.toDate());
                            } else if (userType === "Faculty") {
                                dateInfo = "Waiting for approval."
                            } else if (userType === "Staff") {
                                dateInfo = "Waiting for processing."
                            }

                            let tooltipTitle;
                            if (userID === approvals[i].tracksID) {
                                tooltipTitle = '<span>' + '<u>' + userInfo + '</u>' + '</br>' + pawsDoc.name.first + " " + pawsDoc.name.last +
                                    " " + '<span style="color: #ff0000;">' + "(" +  '<u>' + "YOU" + '</u>' + ")" +  '</span>' +
                                    '</br>' + '</br>' + '<u>' + "Date" + '</u>' + '</br>' + dateInfo + '</span>';
                            } else {
                                tooltipTitle = '<span>' + '<u>' + userInfo + '</u>' + '</br>' + pawsDoc.name.first + " " + pawsDoc.name.last
                                    + '</br>' + '</br>' + '<u>' + "Date" + '</u>' + '</br>' + dateInfo + '</span>';
                            }
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
                main_div.formReference = formReference.data().formRef;
                main_div.userID = userID;
                document.getElementById(targetDiv).appendChild(main_div);
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
            const formName = getFormName(doc);
            const dueDatePromise = getFormDueDate(formName);

            pawsDB.collection(formReference.path.split("/")[0]).doc(formReference.path.split("/")[1]).get().then(function(studentDoc) {
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
                                    let approvalName = pawsDoc2.name.first + " " +  pawsDoc2.name.last;
                                    const approvalEmail = '<span>' + '<u>' + pawsDoc2.userType + '</u>' + '</br>' + pawsDoc2.email + '</span>';
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
            const formName = getFormName(doc);
            const dueDatePromise = getFormDueDate(formName);

            pawsDB.collection(formReference.path.split("/")[0]).doc(formReference.path.split("/")[1]).get().then(function(studentDoc) {
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

                        // User later to distinguish if the current approver is a Faculty or a Staff
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
            const formName = getFormName(formDoc);

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
                            const notificationMessage = getStudentNotificationMessage(approved, userID_userType, fullName, formName);
                            const dateToday = new Date();
                            const notificationID = "notification_" + moment(dateToday).format('MMDDYYYYHHmmss');
                            formDB.collection("users").doc(studentID).collection("notifications").doc(notificationID).set({
                                message: notificationMessage,
                                timestamp: dateToday
                            });

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
                                    formDB.collection("users").doc(formReference.path.split("/")[1]).collection("completedForms").doc(formDoc.id).set(newDocData);

                                    // Delete the form in which was in the previous folder "inProgressForms" of the student
                                    formReference.delete().then(function() {
                                        //console.log("Document successfully deleted!");
                                    }).catch(function(error) {
                                        console.error("Error removing document: ", error);
                                    });

                                    // Get the form reference of the form in which is in the new folder ("completedForms")
                                    const newFormReference = formDB.collection("users").doc(formReference.path.split("/")[1]).collection("completedForms").doc(formDoc.id);
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
function getStudentNotificationMessage (approved, userID_userType, fullName, formName) {
    let message = "";
    if (userID_userType === "Faculty") {
        if (approved) {
            message = `${fullName} has approved your "${formName}" form. You can view the progress of it in your "Dashboard" page.`;
        } else {
            message = `${fullName} has declined your "${formName}" form. You can view the reason of why they declined in your "My Completed Forms" page.`;
        }

    } else if (userID_userType === "Staff") {
        if (approved) {
            message = `${fullName} has processed your "${formName}" form. You can view it in your "My Completed Forms" page.`;
        } else {
            message = `${fullName} has declined your "${formName}" form. You can view the reason of why they didn't process in your "My Completed Forms" page.`;
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
            message = 'The form ' + "haven't" + 'been processed.';
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
