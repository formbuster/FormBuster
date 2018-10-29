function getUserData() {
    const formDB = formBusterApp.firestore();
    const formDBSettings = {/* your settings... */ timestampsInSnapshots: true};
    formDB.settings(formDBSettings);

    const pawsDB = pseudoPAWSApp.firestore();
    const pawsDBSettings = {/* your settings... */ timestampsInSnapshots: true};
    pawsDB.settings(pawsDBSettings);


    getInProgressForm(formDB, pawsDB);
    getNotifications();
}


