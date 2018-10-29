function getDisplayName() {
    document.getElementById("display-name").innerHTML = getUserName();
}

function showDashboard() {
    //highlight only the dashboard tag, because it is selected.
    document.getElementById("dashboard").className = "w3-bar-item w3-button w3-hover-theme w3-large w3-text-theme-red w3-background";
    document.getElementById("students").className = "w3-bar-item w3-button w3-hover-theme w3-large";
    document.getElementById("history").className = "w3-bar-item w3-button w3-hover-theme w3-large";

    //only show the dashboard, because it is selected.
    document.getElementById("dashboard-contents").style.display = "block";
    document.getElementById("students-list").style.display = "none";
    document.getElementById("history-list").style.display = "none";
}

function showStudentsList() {
    //highlight only the forms tag, because it is selected.
    document.getElementById("dashboard").className = "w3-bar-item w3-button w3-hover-theme w3-large";
    document.getElementById("students").className = "w3-bar-item w3-button w3-hover-theme w3-large w3-text-theme-red w3-background";
    document.getElementById("history").className = "w3-bar-item w3-button w3-hover-theme w3-large";

    //only show the forms, because it is selected.
    document.getElementById("students-list").style.display = "block";
    document.getElementById("dashboard-contents").style.display = "none";
    document.getElementById("history-list").style.display = "none";
}

function showHistoryList() {
    //highlight only the history tag, because it is selected.
    document.getElementById("dashboard").className = "w3-bar-item w3-button w3-hover-theme w3-large";
    document.getElementById("history").className = "w3-bar-item w3-button w3-hover-theme w3-large w3-text-theme-red w3-background";
    document.getElementById("students").className = "w3-bar-item w3-button w3-hover-theme w3-large";

    //only show the history, because it is selected.
    document.getElementById("history-list").style.display = "block";
    document.getElementById("students-list").style.display = "none";
    document.getElementById("dashboard-contents").style.display = "none";
}