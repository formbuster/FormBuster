var mainApp = {};
(function(){
  //var mainContainer = document.getElementById("main_container");

//   var signOut =  function(){
//         app_firebase.auth().signOut().then(function(){
//             console.log('success');
//             window.location.replace("http://pseudotracks.me/");
//         },function(){})
//     }
  var uid = null;
  
    app_firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            // User is signed in
            console.log("stay");
            //mainContainer.style.display = "";
          uid = user.uid;
          console.log(uid);
        } else {
            // redirect to login page
          uid = null;
          console.log(uid);
            //mainContainer.style.display = "none";
            console.log("redirect");
            //window.location.replace("http://pseudotracks.me/");
        }
    });
  //}
 
 function signOut() {
    console.log("trying to log out");
    app_firebase.auth().signOut();
    console.log("logged out");
  }
    
  //init();
  document.getElementById("signout").onclick = signOut;
   //mainApp.logout = signOut();
})();
