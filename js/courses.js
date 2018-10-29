var xmlhttp = new XMLHttpRequest();

xmlhttp.open('GET', 'http://api.fit.edu/courses/v1/courses?term=spring', true);
xmlhttp.send();

function getCourse() {
    console.log("reached");
    xmlhttp.onload = function () {
        // console.log(this.response);
        //if (this.readyState == 4 && this.status == 200) {
        var myObj = JSON.parse(this.response);
        document.getElementById("class1").innerText = myObj.records[0].title;
        console.log(myObj.records[0].title);
        //}
    };
}