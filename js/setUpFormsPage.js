function getFormsPage(role){
    $('#formsList').append('<div id="forms-list-view">\n' +
        '                    <input class="w3-button w3-block w3-search-bar-grey w3-round-xlarge w3-large" style="margin-top: 20px; margin-left: auto; margin-right: auto; padding-left: 10px;" type="text" placeholder="Search...">\n' +
        '\n' +
        '                    <div class="w3-white w3-panel w3-leftbar w3-border-theme w3-round-xlarge">\n' +
        '                        <div class="w3-left">\n' +
        '                            <h3 class="w3-left">Registration Form</h3>\n' +
        '                            <p></p>\n' +
        '                            <p class="w3-left">Used for students to add or drop classes.</p>\n' +
        '                        </div>\n' +
        '                        <div class="w3-right">\n' +
        '                            <button class="w3-margin w3-theme-red w3-btn w3-round-xlarge" onclick="startRegistrationForm()">Start Form</button>\n' +
        '                        </div>\n' +
        '                    </div>\n' +
        '\n' +
        '                    <div class="w3-white w3-panel w3-leftbar w3-border-theme w3-round-xlarge">\n' +
        '                        <div class="w3-left">\n' +
        '                            <h3 class="w3-left">Closed Class Form</h3>\n' +
        '                            <p></p>\n' +
        '                            <p class="w3-left">Used for students to get permission to enroll into a class that is full.</p>\n' +
        '                        </div>\n' +
        '                        <div class="w3-right">\n' +
        '                            <button class="w3-margin w3-theme-red w3-btn w3-round-xlarge" onclick="">Start Form</button>\n' +
        '                        </div>\n' +
        '                    </div>\n' +
        '                </div>\n' +
        '\n' +
        '                <div id="id01" class="w3-modal">\n' +
        '                    <div class="w3-modal-content w3-round-xlarge w3-border-theme w3-bottombar">\n' +
        '                        <div class="w3-container">\n' +
        '                            <span onclick="closeForm()" class="w3-button w3-display-topright w3-round-xlarge w3-padding">×</span>\n' +
        '                            <div class="w3-text-theme-red" style="display: block">\n' +
        '                                <p></p>\n' +
        '                                <h3 class="w3-left">Registration Form</h3>\n' +
        '                                <h3 class="w3-right w3-padding-right">Due Date: 12/1/18</h3>\n' +
        '                            </div>\n' +
        '                            <div id="first-page">\n' +
        '                                <div id = "student-search" class="w3-container"></div>\n' +
        '                                <div class="w3-container">\n' +
        '                                    <div class="w3-container w3-theme-red">\n' +
        '                                        <p>Select a semester term, then search for courses using CRN, Title or Prefix.</p>\n' +
        '                                    </div>\n' +
        '                                    <br>\n' +
        '                                    <select id="termSelecter" autofocus="" class="w3-select w3-quarter" onchange="getCourse()">\n' +
        '                                        <option value="" disabled selected>Select a term:</option>\n' +
        '                                        <option value="spring">Spring</option>\n' +
        '                                        <option value="summer">Summer</option>\n' +
        '                                        <option value="fall">Fall</option>\n' +
        '                                    </select>\n' +
        '\n' +
        '                                    <input id="profileurl" class="w3-input w3-threequarter" type="text" placeholder="Search for courses using CRN, Title or Prefix">\n' +
        '\n' +
        '                                    <br><br>' +
        ' <img src="../img/loadinfo.net.gif" id="animated-gif" style="display:none;" justify-content="center"/>' +
        '                                    <div id="courseResultsMessage"></div>\n' +
        '                                    <div id="url"></div>\n' +
        '                                    <div id="registrationTableResults"></div>\n' +
        '                                    <p id="totalCredits"></p>\n' +
        '                                </div>\n' +
        '                                <br>\n' +
        '                                <div>\n' +
        '                                    * A student may audit a course with the permission of his or her advisor and payment (if applicable) of an audit fee. An auditor does not receive a grade; an AU is recorded\n' +
        '                                    on the transcript in place of the grade if the auditor has, in general, maintained a satisfactory course attendance (usually 75 percent class attendance) and completed the\n' +
        '                                    appropriate assignments. If the student does not meet requirements, a final grade of F may be awarded. No changes in registration from credit to audit or from audit to credit\n' +
        '                                    will be permitted after the second week of classes.\n' +
        '                                </div>\n' +
        '                                <br>\n' +
        '                                <div id=\'emptyFormMessage\' class="w3-panel w3-red" style="display: none;">\n' +
        '                                    <p>The form is empty. Select a term and search for courses above!</p>\n' +
        '                                </div>\n' +
        '                                <div id="form-options-1">\n' +
        '                                    <button id="discard-option-1" class="w3-button w3-grey w3-round-xxlarge" onclick="closeForm()">Discard</button>\n' +
        '                                    <button id="enter-pin-2" class="w3-button w3-grey w3-round-xxlarge" onclick="">Enter Pin</button>\n' +
        '                                    <button id="save-option-2" class="w3-button w3-grey w3-round-xxlarge" onclick="saveRegistrationForm(false)">Save</button>\n' +
        '                                    <button id="submit-option-2" class="w3-button w3-theme-blue w3-round-xxlarge" onclick="saveRegistrationForm(true)">Submit</button>\n' +
        '                                </div>\n' +
        '                                <br>\n' +
        '                            </div>\n' +
        '                        </div>\n' +
        '                    </div>\n' +
        '                </div>\n' +
        '            </div>\n');

    $('#profileurl').keyup(function(e) {
        getCourse();
    });
    $(function() {
        $('#search-id').on("submit", function() {
            $('#animated-gif').toggle();
        });
    });

    if (role === "coord") {
        $("#student-search").load('student_list.html');
        // $('#student-search #searchInput').id("searchInputForForm");

        $('#student-search .search_input').attr("id", "rgfdsfrtgrfd");
    }
}

function startRegistrationForm() {
    document.getElementById('id01').style.display='block';
}
