var homeApp1 = {};
(function() {
    function signOut(){
        firebase.auth().signOut();
        window.location.replace('../src/templogin.html');
    }

    homeApp1.signOut = signOut;
})()