var homeApp = {};
(function() {
    var firebase = app_firebase;
    var uid = null;
    
    // Initialize PseudoPAWS Firebase
    pseudoPAWSApp = firebase.initializeApp({
        apiKey: "AIzaSyCAxnlp-J7GPIjTRMmsVuEfpNRxRAK5hlw",
        authDomain: "pseudopaws.firebaseapp.com",
        databaseURL: "https://pseudopaws.firebaseio.com",
        projectId: "pseudopaws",
        storageBucket: "pseudopaws.appspot.com",
        messagingSenderId: "1031657828400"
    }, "pseudoPAWS");
    
    const pawsDB = pseudoPAWSApp.firestore();
    const pawsDBSettings = {/* your settings... */ timestampsInSnapshots: true};
    pawsDB.settings(pawsDBSettings);
        
    
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            // User is signed in
            uid = user.uid;
            
            pawsDB.collection("users").doc(user.email.toString().substring(0, str.indexOf("@"))).get().then(function(doc) {
                if (doc.exists) {
                  const docData = doc.data();
                  const usertype = docData.userType;

                  if (usertype == "Student") {
                    window.location.replace("../src/stu.html");
                  } else if (usertype == "Faculty") {
                    window.location.replace("../src/faculty.html");
                  } else if (usertype == "Staff") {
                    window.location.replace("../src/staff.html");
                  } else {
                    window.location.replace("../src/coord.html");
                  }

                } else {
                  // doc.data() will be undefined in this case
                  console.log("No such document!");
                }
              }).catch(function(error) {
                console.log("Error type:", error);
              });
            
            
            
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
})()
