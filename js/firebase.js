var app_firebase = {};
(function() {
    // Initialize Firebase
    var config = {
        apiKey: "AIzaSyAWosl7w3NfRpAYL-j1XWLDZujl8GpO-KA",
        authDomain: "pseudotracks-bb89e.firebaseapp.com",
        databaseURL: "https://pseudotracks-bb89e.firebaseio.com",
        projectId: "pseudotracks-bb89e",
        storageBucket: "pseudotracks-bb89e.appspot.com",
        messagingSenderId: "369787432909"
    };
    firebase.initializeApp(config);
    
    app_firebase = firebase;

})()