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
        this.logginId = null;
        this.loggedDT = null;
    }
    setName(firstname, lastname) {
        this.firstName = firstname;
        this.lastName = lastname;
    }
    setLoggedDT() {
        this.loggedDt = new Date().toLocaleString().replace(',','');
    }
    getSessonId() {
        return this.sessionId;
    }
    setLogginId(lid) {
        this.logginId = lid;
    }
    getLogginId() {
        return this.logginId;
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
        this.sessionTime = new Date().toLocaleString().replace(',','');
    }

}

//module.exports.UserSession = UserSession;

exports.UserSession = UserSession;