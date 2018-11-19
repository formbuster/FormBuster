function getDisplayName() {
    document.getElementById("display-name").innerHTML = getUserName();
}

// Hides inProgressForms page and displays (unhide) the completedForms page
function completedFormsButtonPressed () {
    const completedFormsButton = document.getElementById("completedFormsButton");
    const completedFormsDiv = document.getElementById("completedFormsDiv");

    const inProgressFormsButton = document.getElementById("inProgressFormsButton");
    const inProgressFormsDiv = document.getElementById("inProgressFormsDiv");

    inProgressFormsButton.style.pointerEvents = "all";
    inProgressFormsButton.style.cursor = "pointer";
    inProgressFormsButton.style.borderBottomColor = "transparent";
    inProgressFormsButton.style.color = "#05307d";

    completedFormsButton.style.pointerEvents = "none";
    completedFormsButton.style.cursor = "default";
    completedFormsButton.style.borderBottomColor = "#054ee1";
    completedFormsButton.style.color = "#054ee1";

    completedFormsDiv.style.display = "block";
    inProgressFormsDiv.style.display = "none";
}

// Hides completedForms page and displays (unhide) the inProgressForms page
function inProgressFormsButtonPressed () {
    const completedFormsButton = document.getElementById("completedFormsButton");
    const completedFormsDiv = document.getElementById("completedFormsDiv");

    const inProgressFormsButton = document.getElementById("inProgressFormsButton");
    const inProgressFormsDiv = document.getElementById("inProgressFormsDiv");

    completedFormsButton.style.pointerEvents = "all";
    completedFormsButton.style.cursor = "pointer";
    completedFormsButton.style.borderBottomColor = "transparent";
    completedFormsButton.style.color = "#05307d";

    inProgressFormsButton.style.pointerEvents = "none";
    inProgressFormsButton.style.cursor = "default";
    inProgressFormsButton.style.borderBottomColor = "#054ee1";
    inProgressFormsButton.style.color = "#054ee1";

    inProgressFormsDiv.style.display = "block";
    completedFormsDiv.style.display = "none";
}

// Populate the completedForms and the inProgressForms into this page
function displayStudentForms (studentID) {
    const completedFormsDiv = document.getElementById("completedFormsDiv");
    const inProgressFormsDiv = document.getElementById("inProgressFormsDiv");

    // Clear old displayed Student forms.
    completedFormsDiv.innerHTML = '';
    inProgressFormsDiv.innerHTML = '';

    getStudentForms("pageGrid2", "completedFormsDiv", studentID, "completedForms", displayFormReadMode);
    getStudentForms("pageGrid2", "inProgressFormsDiv", studentID, "inProgressForms", displayFormReadMode);

    // Load completed forms of the student by default
    completedFormsButtonPressed();
}

// After clicking on a student's entry, show the forms page and call "displayStudentForms" to populate the forms into this page
function displayStudentFormsPage (event) {
    const pageGrid1 = document.getElementById("pageGrid1");
    const pageGrid2 = document.getElementById("pageGrid2");

    pageGrid1.style.display = "none";
    pageGrid2.style.display = "block";

    const studentTitle = document.getElementById("studentTitle");
    studentTitle.innerHTML = "Forms of " + '<strong>' + event.currentTarget.studentFullName + '</strong>' + '<br>';
    studentTitle.style.marginBottom = "12px";

    displayStudentForms(event.currentTarget.studentID);
}

// Switch back to student's list when you click on the back button (back arrow)
function displayStudentSearchListPage () {
    const pageGrid1 = document.getElementById("pageGrid1");
    const pageGrid2 = document.getElementById("pageGrid2");

    pageGrid1.style.display = "block";
    pageGrid2.style.display = "none";
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
function keyPressed () {
    const txt = document.getElementById("searchInput").value;

    if (txt.length == 0) {
        document.getElementById("searchButton").style.visibility = "hidden";
    } else {
        document.getElementById("searchButton").style.visibility = "visible";
    }
}

// Display a given message to the student coordinator's page when their search had not result or when they typed in a wrong format
function displayMessage (msg) {
    const parentDiv = document.getElementById("coord_students_list");

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
    buttonDiv.addEventListener("click", displayStudentFormsPage);
    buttonDiv.studentID = doc.id;
    buttonDiv.studentFullName = pawsDoc.name.first + " " + pawsDoc.name.middle + " " + pawsDoc.name.last;

    buttonDiv.appendChild(leftDiv);
    buttonDiv.appendChild(middleDiv);
    buttonDiv.appendChild(rightDiv);

    parentDiv.appendChild(buttonDiv);
}

// Search the given student's ID and populate it to the student coordinator page
function getStudentByID (userID) {
    const parentDiv = document.getElementById("coord_students_list");

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
        })
    });
}

// Todo: implement method to get user using the first and last name, if there are only 2 Strings.
// Search the given student's name(s) and populate it to the student coordinator page
function getStudentByName (name) {
    const parentDiv = document.getElementById("coord_students_list");

    // Clear previous elements (students)
    parentDiv.innerHTML = '';

    const names = name.toLowerCase().split(" ");
    let usedIDs = [];
    for (let i = 0; i < names.length; i++) {
        // Make sure the name is in the correct form, since Firebase is case sensitive.
        names[i] = names[i].charAt(0).toUpperCase() + names[i].substring(1, names[i].length);

        const pawsStudentsCollection = pawsDB.collection("users").where("userType", "==", "Student");
        pawsStudentsCollection.where("name.last", "==", names[i]).get().then(function(querySnapshot) {
            querySnapshot.forEach(function (doc) {
                // doc.data() is never undefined for query doc snapshots// Check whether or not we have already displayed that user, to avoid repetition
                if (!usedIDs.includes(doc.id)) {
                    displayStudentEntry(parentDiv, doc);

                    // Add displayed student to the list of students in which we have displayed already
                    usedIDs.push(doc.id);
                }
            })
        });

        pawsStudentsCollection.where("name.first", "==", names[i]).get().then(function(querySnapshot) {
            if (querySnapshot.size == 0 && usedIDs.length == 0 && i == names.length - 1) {
                displayMessage("No matches!");
            }

            querySnapshot.forEach(function (doc) {
                // doc.data() is never undefined for query doc snapshots// Check whether or not we have already displayed that user, to avoid repetition
                if (!usedIDs.includes(doc.id)) {
                    displayStudentEntry(parentDiv, doc);

                    // Add displayed student to the list of students in which we have displayed already
                    usedIDs.push(doc.id);
                }
            })
        });
    }
}

// Get all students in the database and populate them in the student coordinator's page
function getAllStudents () {
    const parentDiv = document.getElementById("coord_students_list");

    // Clear previous elements (students)
    parentDiv.innerHTML = '';

    const pawsStudentsCollection = pawsDB.collection("users").where("userType", "==", "Student");
    pawsStudentsCollection.get().then(function(querySnapshot) {
        querySnapshot.forEach(function (doc) {
            // doc.data() is never undefined for query doc snapshots
            displayStudentEntry(parentDiv, doc);
        })
    });
}
