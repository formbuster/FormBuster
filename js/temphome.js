var homeApp = {};
(function() {
    // Initialize PseudoTRACKS Firebase
    pseudoTRACKSApp = firebase.initializeApp({
        apiKey: "AIzaSyAWosl7w3NfRpAYL-j1XWLDZujl8GpO-KA",
        authDomain: "pseudotracks-bb89e.firebaseapp.com",
        databaseURL: "https://pseudotracks-bb89e.firebaseio.com",
        projectId: "pseudotracks-bb89e",
        storageBucket: "pseudotracks-bb89e.appspot.com",
        messagingSenderId: "369787432909"
    }, "pseudoTRACKS");
    var uid = null;

    pseudoTRACKSApp.auth().onAuthStateChanged(function(user) {
        if (user) {
            // User is signed in
            uid = user.uid;
        } else {
            // redirect to login page
            uid = null;
            window.location.replace('../src/templogin.html');
        }
    });

    function logOut(){
        firebase.auth().signOut();
    }

    homeApp.logOut = logOut;
})();