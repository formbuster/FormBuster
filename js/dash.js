var mainApp = {};
(function(){
  //var mainContainer = document.getElementById("main_container");

//   var signOut =  function(){
//         app_firebase.auth().signOut().then(function(){
//             console.log('success');
//             window.location.replace("http://pseudotracks.me/");
//         },function(){})
//     }
  
  var init = function(){
    app_firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            // User is signed in
            console.log("stay");
            //mainContainer.style.display = "";
        } else {
            // redirect to login page
            //mainContainer.style.display = "none";
            console.log("redirect");
            //window.location.replace("http://pseudotracks.me/");
        }
    });
  }
    
  init();
  
   mainApp.logout = signOut;
})();
