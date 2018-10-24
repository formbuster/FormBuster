function getDisplayName() {
    document.getElementById("display-name").innerHTML = getUserName();
}

function showDashboard() {
    document.getElementById("dashboard-contents").style.display = "block";
    document.getElementById("students-list").style.display = "none";

}

function showStudentsList() {
    document.getElementById("dashboard-contents").style.display = "none";
    document.getElementById("students-list").style.display = "block";

}