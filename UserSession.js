class UserSession {
    // constructor(sessionId, isAdmin, userType, firstName, lastName, loggedDT, sessionTime ) {
    //     this.sessionId = sessionId;
    //     this.isAdmin = isAdmin;
    //     this.userType = userType;
    //     this.firstName = firstName;
    //     this.lastName = lastName;
    //     this.loggedDT = loggedDT;
    //     this.sessionTime = sessionTime;
    // }
    
    constructor(sessionId, firstName, lastName) {
        this.sessionId = sessionId;
        this.firstName = firstName;
        this.lastName = lastName;
        // var currentdate = new Date(); 
        // var datetime = "Last Sync: " + currentdate.getDate() + "/"
        //         + (currentdate.getMonth()+1)  + "/" 
        //         + currentdate.getFullYear() + " @ "  
        //         + currentdate.getHours() + ":"  
        //         + currentdate.getMinutes() + ":" 
        //         + currentdate.getSeconds();
        this.sessionTime = new Date().toLocaleString().replace(',','');
        this.loggedDT = this.sessionTime;
    }

    getSessonId() {
        return this.sessionId;
    }

    getUserName() {
        return this.firstName + " " + this.lastName;
    }

    getLoggedDT() {
        return this.loggedDT;
    }

    getSessionTime() {
        return this.sessionTime;
    }

    refreshSession() {
        var currentdate = new Date(); 
        this.sessionTime = new Date().toLocaleString().replace(',','');
    }

}

//module.exports.UserSession = UserSession;

exports.UserSession = UserSession;