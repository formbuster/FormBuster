/*
This function's purpose is to create the in-transit forms for a student and a faculty member's dashboard.
This will also be used in the history section.
 */

function getInTransitForm() {
    var txt = '{"form_name":"Registration Form", "needed_approvals": 3, "approvals":1, "submission_date":"09-09-2018", "due_date":"09-09-2018", "student":"Student, Test"}';
    var obj = JSON.parse(txt);
    console.log(obj.form_name + " " + obj.approvals + " " + obj.submission_date + " " + obj.due_date + " " + obj.student);

    /*
    Just another example
    var txt2 = '{"form_name":"Registration Form", "needed_approvals": 2, "approvals":1, "submission_date":"09-19-2018", "due_date":"09-29-2018", "student":"Student2, Test2"}';
    var obj2 = JSON.parse(txt2);
    console.log(obj2.form_name + " " + obj2.approvals + " " + obj2.submission_date + " " + obj2.due_date + " " + obj2.student);*/

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
        //Here I am not able to figure out how to use the on click so that when the panel is clicked.
        //the pop up of form details will show.

        //main_div.addEventListener("click", document.getElementById('id01').style.display='block');
        document.getElementById("transit_form_list").appendChild(main_div);
    }
}

/*
<div onclick="document.getElementById('id01').style.display='block'" class="w3-white w3-button w3-block w3-leftbar w3-border-theme w3-round-xlarge">
    <div class="w3-left">
        <H3>Registration Form</H3>
        <span class="w3-left w3-badge w3-green w3-large">✓</span>
        <span class="w3-left w3-margin-left w3-badge w3-grey w3-large">✓</span>
        <span class="w3-left w3-margin-left w3-badge w3-grey w3-large">✓</span>
    </div>
    <div class="w3-right">
        <H4>Submission Date: 09-09-2018</H4>
        <h4>Due Date: 09-18-2018</h4>
    </div>
</div>
 */