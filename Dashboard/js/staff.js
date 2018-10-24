function getDisplayName() {
    document.getElementById("display-name").innerHTML = getUserName();
}

function showDashboard() {
    document.getElementById("dashboard-contents").style.display = "block";
    document.getElementById("students-list").style.display = "none";
    document.getElementById("history-list").style.display = "none";
    document.getElementById("form-management").style.display = "none";
}

function showStudentsList() {
    document.getElementById("students-list").style.display = "block";
    document.getElementById("dashboard-contents").style.display = "none";
    document.getElementById("history-list").style.display = "none";
    document.getElementById("form-management").style.display = "none";
}

function showHistoryList() {
    document.getElementById("history-list").style.display = "block";
    document.getElementById("students-list").style.display = "none";
    document.getElementById("dashboard-contents").style.display = "none";
    document.getElementById("form-management").style.display = "none";
}

function showFormManagement() {
    document.getElementById("form-management").style.display = "block";
    document.getElementById("history-list").style.display = "none";
    document.getElementById("students-list").style.display = "none";
    document.getElementById("dashboard-contents").style.display = "none";
}