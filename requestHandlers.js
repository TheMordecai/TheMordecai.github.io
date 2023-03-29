var fs = require('fs');
var sql = require('mssql');
var config = require('./db_connect');
var querystring = require('querystring');
var bcrypt = require('bcryptjs'); 

var cons = require('consolidate');


const { Console } = require('console');
const { callbackify } = require('util');

function loginverify(response, postData) {
    var params = querystring.parse(postData); 
    var username = params['Username'];
    var password = params['Password']; 
    var adminlogin = params['adminLogin'];
//    var connect = fs.readFileSync('db_connect.js');

    var conn = new sql.ConnectionPool(config);
    sql.connect(config).then(function() {
        var req = new sql.Request();
        req.input('username', sql.NVarChar, username);
        req.input('password', sql.NVarChar, password);
        req.query("SELECT HashedPassword, TemporaryPassword FROM Login WHERE Username=@username").then(function(recordset) {
            if (recordset.recordsets[0].length > 0) {
                var hash = recordset.recordsets[0][0].HashedPassword; 
                var temp = recordset.recordsets[0][0].TemporaryPassword;
                bcrypt.compare(password, hash, function(err, result) { 
                    if (result) {
                        // Passwords match, show a success message
                        console.log("success");
                        //sessionData.setLogginId(username)
                        console.log("Temp =" + temp);
                        if(temp) {
                            cons.ejs('./changePassword.html',{username: username, oldpassword: password}, function(err, html){
                                if(err) {
                                    console.error('Error templating with EJS');
                                    throw err;
                                }
                                response.write(html);
                                response.end();
                                //return;
                            });

                            //response.writeHead(302, {"Location": "/changePassword"})
                        } else {
                            if(adminlogin) {
                                response.writeHead(302, { "Location": "/adminUI" });
                            } else {
                                response.writeHead(302, { "Location": "/search" });
                            }
                            response.end();
                        }
                        console.log("response ended");
                    } else {
                        // Passwords do not match, show an error message
                        console.log("Failed");
                        response.writeHead(302, { "Location": "/login" });
                        response.end();
                    }
                });
                //response.writeHead(302, { "Location": "/search" });
                //response.end();
            } else {
                // Username and password are incorrect, show an error message
                //response.writeHead(200, { "Content-Type": "text/html" });
                //response.write("<p>Login failed</p>");
                response.writeHead(302, { "Location": "/login" });
                response.end();
            }
            //conn.close();
        }).catch(function(err) {
            console.log(err);
            //conn.close();
        });
    }).catch(function(err) {
        console.log(err);
    });

}

function PasswordChanger(response, postData) {
    var req = new sql.Request();
    var params = querystring.parse(postData); 
    var NewPassword = params['newPassword'];
    var username = params["username"];
    bcrypt.hash(NewPassword, 10, function(err, hash) {
        if (err) {
            console.log(err);
        } else {
            let cquery = "UPDATE Login SET HashedPassword = @hashedPassword, TemporaryPassword = 0 WHERE username = @username"
            req.input('hashedPassword', sql.NVarChar, hash);
            req.input('username', sql.NVarChar, username);
            req.query(cquery).then(function(recordset) {
                console.log("Password Changed");
                response.writeHead(302, { "Location": "/login" });
                response.end();
            }).catch(function(err) {
                console.log(err);
            });
        }
    });

}

function login(response, postData) {
    console.log("Request handler 'login' was called.");
    var data = fs.readFileSync('login.html');
    response.writeHead(200, { "Content-Type": "text/html" });
    response.write(data);
    response.end();
}

function createUser(response, postData) {
    console.log("Request handler 'createUser' was called.");
    var data = fs.readFileSync('createUser.html');
    response.writeHead(200, { "Content-Type": "text/html" });
    response.write(data);
    response.end();
}


function addItem(response, postData){
    var conn = new sql.ConnectionPool(config);
    sql.connect(config).then(function() {
        var req = new sql.Request();
        var querystring = require('querystring');
        var params = querystring.parse(postData); 
        var mode = params['searchBy'];
        var itemID = params['itemID'];
        var itemName = params['itemName'];
        var DValue = params['DValue'];
        var MType = params['MType'];
        var Author = params['Author'];
        var Publisher = params['Publisher'];
        var PDate = params['PDate'];
        var NCopies = params['NCopies'];
        var Language = params['Language'];
        var Genre = params['Genre'];
        var Availability = params['Availability'];
        var Status = params['Status'];
        req.input('itemID', sql.NVarChar, itemID);
        req.input('itemName', sql.NVarChar, itemName);
        req.input('DValue', sql.Int, DValue);
        req.input('MType', sql.NVarChar, MType);
        req.input('Author', sql.NVarChar, Author);
        req.input('Publisher', sql.NVarChar, Publisher);
        req.input('PDate', sql.Date, PDate);
        req.input('NCopies', sql.Int, NCopies);
        req.input('Language', sql.NVarChar, Language);
        req.input('Genre', sql.NVarChar, Genre);
        req.input('Availability', sql.Bit, Availability);
        req.input('Status', sql.NVarChar, Status);
        function generateMediaID(){
            const timestamp = new Date().getTime();
            const randomNumber = Math.floor(Math.random() * 100000000)
            const id = `${timestamp}${randomNumber}`;
            const truncatedID = id.slice(-8);
            return truncatedID.toString();
        }
        function generateObjectID(){
            const timestamp = new Date().getTime();
            const randomNumber = Math.floor(Math.random() * 1000000)
            const id = `${timestamp}${randomNumber}`;
            const truncatedID = id.slice(-6);
            return truncatedID.toString();
        }
        var MID = generateMediaID();
        var OID = generateObjectID();
        req.input('MID', sql.NVarChar, MID);
        req.input('OID', sql.NVarChar, OID);
        var failed = false;
        console.log("mode: " + mode);
        var queryStr = ""; 
        switch (mode) {
            case 'Electronic':
              queryStr = "INSERT INTO Electronics (Serial_No, Electronics_Name, Last_Updated, Created_By, Available, Item_Status, Created_Date, Last_Updated_By, Dollar_Value) VALUES (@itemID, @itemName, getdate(), 'F111122223', @Availability, @Status, getdate(), 'F111122223', @DValue)";
              req.query(queryStr).then(function(recordset) {
                console.log("Electronic entry inserted into database.");
            }).catch(function(err) {
                console.log(err);
            });
              break;
            case 'Book':
              queryStr = "INSERT INTO Book (ISBN, Book_Name, Last_Updated, Created_BY, Created_date, Updated_BY, Dollar_Value, Author, Publisher_Name, Published_Date, Num_of_Copies, Language, Genre) VALUES (@itemID, @itemName, getdate(), 'F111122223', getdate(), 'F111122223', @DValue, @Author, @Publisher, @PDate, @NCopies, @Language, @Genre)";
              req.query(queryStr).then(function(recordset) {
                console.log("Book entry inserted into database.");
            }).catch(function(err) {
                console.log(err);
            });
              break;
            case 'Media':
              queryStr = "INSERT INTO Media (Media_ID, Media_Name, Updated_Date, Created_By, Created_Date, Updated_By, Dollar_Value, Media_Type, Author, Publisher_Name, Published_Date, Num_of_Copies) VALUES (@MID, @itemName, getdate(), 'F111122223', getdate(), 'F111122223', @DValue, @MType, @Author, @Publisher, @PDate, @NCopies)";
              req.query(queryStr).then(function(recordset) {
                console.log("Media entry inserted into database.");
            }).catch(function(err) {
                console.log(err);
            });
              break;
            case 'Object':
              queryStr = "INSERT INTO Object (Object_ID, Object_Name, Last_Updated, Created_BY, Created_date, Updated_BY, Dollar_Value, Num_of_Copies) VALUES (@OID, @itemName, getdate(), 'F111122223', getdate(), 'F111122223', @DValue, @NCopies)"
              req.query(queryStr).then(function(recordset) {
                console.log("Object entry inserted into database.");
            }).catch(function(err) {
                console.log(err);
            });
              break;
              
          }   
          
        }).catch(function(err) {
            console.error("Unable to get a DB connection");
            console.log(err);
        });
    
}

function generateUsername() {
    let username = '';
    for (let i = 0; i < 9; i++) {
      username += Math.floor(Math.random() * 10);
    }
    return username;
}

function addLogin(response, postData) {
    var conn = new sql.ConnectionPool(config);
    
    sql.connect(config).then(function() {
        var req = new sql.Request();
        var params = querystring.parse(postData); 
        var Username = params['Username'];
        var FName = params['FName'];
        var LName = params['LName'];
        var Email = params['Email'];
        var Department = params['Department'];
        var tempPassword = params['tempPassword'];

        var mode = params['searchBy'];

        var adminPermission = params['adminPermission']; // === 'on' ? 1 : 0;
        var adminp = 0;
        if(adminPermission !== undefined) {
            adminp = 1;
        }
        if( mode === 'guest') {
            Username = 'G' + generateUsername();
            console.log("UserName: " + Username);
        }
        let firstChar = Username.charAt(0);

        // if (adminPermission !== undefined) {
        //   adminPermission = (adminPermission === 'on') ? 1 : 0;
        // } else {
        //   adminPermission = 0; // default to 0 if checkbox wasn't checked
        // }
        req.input('adminpermission', sql.Bit, adminp);

        req.input('username', sql.NVarChar, Username);
        req.input('fname', sql.NVarChar, FName);
        req.input('lname', sql.NVarChar, LName);
        req.input('email', sql.NVarChar, Email);
        req.input('department', sql.NVarChar, Department);
        var failed = false;
        console.log("mode: " + mode);
        var queryStr = "";
        function callback() {
            req.query(queryStr).then(function(recordset) {
                console.log("Admin entry inserted into database.");
            }).catch(function(err) {
                console.log(err);
            });
        }
        switch (firstChar) {
          case 'S':
            queryStr = "INSERT INTO Students (StudentID, FirstN, LastN, Email, Created_BY, Updated_BY, Created_date, Last_Updated) VALUES (@username, @fname, @lname, @email, 'F111122223', 'F111122223', getdate(), getdate())";
            break;
          case 'F':
            if(mode === 'admin') {
                req.query("SELECT Faculty_ID, FirstN, LastN FROM Faculty WHERE Faculty_ID=@username").then(function(recordset) {
                    if (recordset.recordsets[0].length > 0) {
                        var FadminN = recordset.recordsets[0][0].FirstN; 
                        var LadminN = recordset.recordsets[0][0].LastN;
                        req.input('FadminN', sql.NVarChar, FadminN);
                        req.input('LadminN', sql.NVarChar, LadminN);
                        console.log("Faculty found: " + Username);
                        queryStr = "INSERT INTO Admin (Admin_ID, FirstN, LastN, Email, Created_BY, Updated_BY, Creation_date, Last_Updated) VALUES (@username, @FadminN, @LadminN, @email, 'F111122223', 'F111122223', getdate(), getdate())";
                        callback();
                    } else {
                        failed = true;
                        response.write("Faculty ID: " + Username + " is not valid");
                        response.end();
                        return;
                    }

                }).catch(function(err) {
                    console.log(err);
                    response.write("Faculty ID: " + Username + " is not valid");
                    response.end();
                    return;
                    //conn.close();
                });

            } else {
                queryStr = "INSERT INTO Faculty (Faculty_ID, FirstN, LastN, Email, Admin_Permission, Department, Created_BY, Updated_BY, Created_date, Last_Updated) VALUES (@username, @fname, @lname, @email, @adminpermission, @department, 'F111122223', 'F111122223', getdate(), getdate())";
            }
            // has many other non-null attributes
            break;
          case 'G':
            queryStr = "INSERT INTO Guest (GuestID, FirstN, LastN, Email, Created_BY, Updated_BY, Created_date, Last_Updated) VALUES (@username, @fname, @lname, @email, 'F111122223', 'F111122223', getdate(), getdate())";
            break;
            
        }


        if(!failed && mode!== "admin") {

            req.query(queryStr).then(function(recordset) {
                insertAdmin();
                insertLogin();
            }).catch(function(err) {
                console.log(err);
            });

            function insertAdmin() {
                if ( adminp === 1 && firstChar === 'F') {
                    query = req.query("INSERT INTO Admin (Admin_ID, FirstN, LastN, Email, Created_BY, Updated_BY, Creation_date, Last_Updated) VALUES (@username, @fname, @lname, @email, 'F111122223', 'F111122223', getdate(), getdate())");
                    req.query(query).then(function(recordset) {
                        console.log("New admin user entry inserted into database.");

                    }).catch(function(err) {
                        Console.error("Insert into admin failed");
                        console.log(err);
                    });
                }       
            }

            function insertLogin() {
            let squery = "INSERT INTO Login (Username, HashedPassword, TemporaryPassword,";
            switch(firstChar) {
                case 'S': squery += " StudentID) VALUES (@username, @hashedPassword, 1, @Username)"; break;
                case 'F': squery += " Faculty_ID) VALUES (@username, @hashedPassword, 1, @Username)"; break;
                case 'G': squery += " GuestID) VALUES (@username, @hashedPassword, 1, @Username)"; break;
            }
            if(mode !== 'admin') {
                bcrypt.hash(tempPassword, 10, function(err, hash) {
                    if (err) {
                        console.log(err);
                    } else {
                        let m =0;
                        for(i=0;i<9999;i++) {
                            for(j=0;j<999;j++) {
                                m +=1;
                            }
                        }
                        // const req2 = new sql.Request();
                        // req2.input('username', sql.NVarChar, Username);
                        // req2.input('password', sql.NVarChar, tempPassword);
                        req.input('hashedPassword', sql.NVarChar, hash);
        //                req.query("INSERT INTO Login (Username, HashedPassword, StudentID, Faculty_ID, GuestID) VALUES (@username, @hashedPassword, @studentId, @facultyId, @guestId)").then(function(recordset) {
                        console.log("Query: " + squery);
                        req.query(squery).then(function(recordset) {
                            console.log("New " + mode + " login entry inserted into database.");
                            if(mode === 'guest') {
                                cons.ejs('./AdminUI/AdminUI-Entry/GuestEntry.html',{uname: Username}, function(err, html){
                                    if(err) {
                                        console.error('Error templating with EJS');
                                        throw err;
                                    }
                                    response.end();
                                });
                                                            
                            }

                        }).catch(function(err) {
                            console.log(err);
                        });
                    }
                });
            }
        }
    }
        
    }).catch(function(err) {
        console.error("Unable to get a DB connection");
        console.log(err);
    });
    
}

function search(response) {
    console.log("Request handler 'search' was called.");
    var sdata = fs.readFileSync('search.html');
    response.writeHead(200, { "Content-Type": "text/html" });
    response.write(sdata);
    response.end();
}

function adminUI(response){
    console.log("Request handler 'adminUI' was called.");
    var adata = fs.readFileSync('adminUI.html');
    response.writeHead(200, { "Content-Type": "text/html" });
    response.write(adata);
    response.end();
}

function BookEntry(response){
    console.log("Request handler 'BookEntry' was called.");
    var edata = fs.readFileSync('AdminUI/AdminUI-Entry/BookEntry.html');
    response.writeHead(200, { "Content-Type": "text/html" });
    response.write(edata);
    response.end();
}

function ElectronicsEntry(response){
    console.log("Request handler 'ElectronicsEntry' was called.");
    var edata = fs.readFileSync('AdminUI/AdminUI-Entry/ElectronicsEntry.html');
    response.writeHead(200, { "Content-Type": "text/html" });
    response.write(edata);
    response.end();
}

function MediaEntry(response){
    console.log("Request handler 'MediaEntry' was called.");
    var edata = fs.readFileSync('AdminUI/AdminUI-Entry/MediaEntry.html');
    response.writeHead(200, { "Content-Type": "text/html" });
    response.write(edata);
    response.end();
}

function ObjectEntry(response){
    console.log("Request handler 'ObjectEntry' was called.");
    var edata = fs.readFileSync('AdminUI/AdminUI-Entry/ObjectEntry.html');
    response.writeHead(200, { "Content-Type": "text/html" });
    response.write(edata);
    response.end();
}

function TransactionEntry(response){
    console.log("Request handler 'TransactionEntry' was called.");
    var edata = fs.readFileSync('AdminUI/AdminUI-Entry/TransactionEntry.html');
    response.writeHead(200, { "Content-Type": "text/html" });
    response.write(edata);
    response.end();
}

function BookEdit(response){

    console.log("Request handler 'BookEdit' was called.");
    var fdata = fs.readFileSync('AdminUI/AdminUI-Edit/BookEdit.html');
    response.writeHead(200, { "Content-Type": "text/html" });
    response.write(fdata);
    response.end();

}

function ElectronicsEdit(response){

    console.log("Request handler 'ElectornicsEdit' was called.");
    var fdata = fs.readFileSync('AdminUI/AdminUI-Edit/ElectronicsEdit.html');
    response.writeHead(200, { "Content-Type": "text/html" });
    response.write(fdata);
    response.end();

}

function ObjectEdit(response){

    console.log("Request handler 'ObjectEdit' was called.");
    var fdata = fs.readFileSync('AdminUI/AdminUI-Edit/ObjectEdit.html');
    response.writeHead(200, { "Content-Type": "text/html" });
    response.write(fdata);
    response.end();

}

function MediaEdit(response){

    console.log("Request handler 'MediaEdit' was called.");
    var fdata = fs.readFileSync('AdminUI/AdminUI-Edit/MediaEdit.html');
    response.writeHead(200, { "Content-Type": "text/html" });
    response.write(fdata);
    response.end();

}

function FacultyEdit(response){

    console.log("Request handler 'FacultyEdit' was called.");
    var fdata = fs.readFileSync('AdminUI/AdminUI-Edit/FacultyEdit.html');
    response.writeHead(200, { "Content-Type": "text/html" });
    response.write(fdata);
    response.end();

}

function StudentEdit(response){

    console.log("Request handler 'StudentEdit' was called.");
    var fdata = fs.readFileSync('AdminUI/AdminUI-Edit/StudentEdit.html');
    response.writeHead(200, { "Content-Type": "text/html" });
    response.write(fdata);
    response.end();

}

function GuestEdit(response){

    console.log("Request handler 'GuestEdit' was called.");
    var fdata = fs.readFileSync('AdminUI/AdminUI-Edit/GuestEdit.html');
    response.writeHead(200, { "Content-Type": "text/html" });
    response.write(fdata);
    response.end();

}

function TransactionsEdit(response){

    console.log("Request handler 'TransactionsEdit' was called.");
    var fdata = fs.readFileSync('AdminUI/AdminUI-Edit/TransactionsEdit.html');
    response.writeHead(200, { "Content-Type": "text/html" });
    response.write(fdata);
    response.end();

}

function StudentEntry(response){
    console.log("Request handler 'StudentEntry' was called.");
    var edata = fs.readFileSync('AdminUI/AdminUI-Entry/StudentEntry.html');
    response.writeHead(200, { "Content-Type": "text/html" });
    response.write(edata);
    response.end();
}

function GuestEntry(response){
    console.log("Request handler 'GuestEntry' was called.");
    cons.ejs('./AdminUI/AdminUI-Entry/GuestEntry.html',{uname: ''}, function(err, html){
        if(err) {
            console.error('Error templating with EJS');
            throw err;
        }
        response.write(html);
        response.end();
    });

    // var edata = fs.readFileSync('AdminUI/AdminUI-Entry/GuestEntry.html');
    // response.writeHead(200, { "Content-Type": "text/html" });
    // response.write(edata);
    // response.end();
}

function FacultyEntry(response){
    console.log("Request handler 'FacultyEntry' was called.");
    var edata = fs.readFileSync('AdminUI/AdminUI-Entry/FacultyEntry.html');
    response.writeHead(200, { "Content-Type": "text/html" });
    response.write(edata);
    response.end();
}

function AdminEntry(response){
    console.log("Request handler 'AdminEntry' was called.");
    var edata = fs.readFileSync('AdminUI/AdminUI-Entry/AdminEntry.html');
    response.writeHead(200, { "Content-Type": "text/html" });
    response.write(edata);
    response.end();
}

function SearchBooks(response, postData){

    sql.connect(config).then(function () {
        var req = new sql.Request();
try{
        var querystring = require('querystring');
        var params = querystring.parse(postData);
        var bookname = params['bookName'];
        var dollarvalue = params['dollarValue'];
        var numOfCompies = params['numOfCopies'];
        var author = params['author'];
        var genre = params['genre'];
        var isbn = params['isbn'];
        var language = params['language'];
        var publisher = params['publisherName'];
        var Created_BY = params['createdBy'];
        var Created_date = params['createdDate'];
        var Updated_BY = params['updatedBy'];
        var Updated_date = params['updatedDate'];

        // string query to hold the SQL query
        var query = null;
        // counter for the # of attributes
        var counter = 0;
        // array to hold the attributes
        let StringArray = [];

        // if the attribute is not empty, add it to the array

        if(bookname != undefined && bookname != ""){
            var bookstring = "Book_Name = '" + bookname + "'";
            StringArray.push(bookstring);
            counter++;
        }
        if(dollarvalue != undefined && dollarvalue != ""){
            vardollarstring = "Dollar_Value = " + dollarvalue;
            StringArray.push(vardollarstring);
            counter++;
        }
        if(numOfCompies != undefined && numOfCompies != ""){
            varnumofcopiesstring = "Num_Of_Copies = " + numOfCompies;
            StringArray.push(varnumofcopiesstring);
            counter++;
        }
        if(author != undefined && author != ""){
            varauthorstring = "Author = '" + author + "'";
            StringArray.push(varauthorstring);
            counter++;
        }
        if(genre != undefined && genre != ""){
            vargenrestring = "Genre = '" + genre + "'";
            StringArray.push(vargenrestring);
            counter++;
        }
        if(isbn != undefined && isbn != ""){
            varisbnstring = "ISBN = '" + isbn + "'";
            StringArray.push(varisbnstring);
            counter++;
        }
        if(language != undefined && language != ""){
            varlanguagestring = "Language = '" + language + "'";
            StringArray.push(varlanguagestring);
            counter++;
        }
        if(publisher != undefined && publisher != ""){
            varpublisherstring = "Publisher_Name = '" + publisher + "'";
            StringArray.push(varpublisherstring);
            counter++;
        }
        if(Created_BY != undefined && Created_BY != ""){
            varcreatedbystring = "Created_By = '" + Created_BY + "'";
            StringArray.push(varcreatedbystring);
            counter++;
        }
        if(Created_date != undefined && Created_date != ""){
            varcreateddatestring = "Created_Date = '" + Created_date + "'";
            StringArray.push(varcreateddatestring);
            counter++;
        }
        if(Updated_BY != undefined && Updated_BY  != ""){
            varupdatedbystring = "Updated_By = '" + Updated_BY + "'";
            StringArray.push(varupdatedbystring);
            counter++;
        }
        if(Updated_date != undefined && Updated_date != ""){
            varupdateddatestring = "Updated_Date = '" + Updated_date + "'";
            StringArray.push(varupdateddatestring);
            counter++;
        }
        // if the array is empty let the user know else build the query
        // this is the ultimate SELECT * query builder
        switch(counter){
            case 0: console.log("No attributes entered, please enter at least one attribute to search for.");
            break;
            case 1: console.log("1 attribute entered, searching for " + StringArray[0]);
            query = "SELECT * FROM dbo.Book WHERE " + StringArray[0] + ";";
            break;
            case 2: console.log("2 attributes entered, searching for " + StringArray[0] + " AND " + StringArray[1]);
            query = "SELECT * FROM dbo.Book WHERE " + StringArray[0] + " AND " + StringArray[1] + ";";
            break;
            case 3: console.log("3 attributes entered, searching for " + StringArray[0] + " AND " + StringArray[1] + " AND " + StringArray[2]);
            query = "SELECT * FROM dbo.Book WHERE " + StringArray[0] + " AND " + StringArray[1] + " AND " + StringArray[2] + ";";
            break;
            case 4: console.log("4 attributes entered, searching for " + StringArray[0] + " AND " + StringArray[1] + " AND " + StringArray[2] + " AND " + StringArray[3]);
            query = "SELECT * FROM dbo.Book WHERE " + StringArray[0] + " AND " + StringArray[1] + " AND " + StringArray[2] + " AND " + StringArray[3] + ";";
            break;
            case 5: console.log("5 attributes entered, searching for " + StringArray[0] + " AND " + StringArray[1] + " AND " + StringArray[2] + " AND " + StringArray[3] + " AND " + StringArray[4]);
            query = "SELECT * FROM dbo.Book WHERE " + StringArray[0] + " AND " + StringArray[1] + " AND " + StringArray[2] + " AND " + StringArray[3] + " AND " + StringArray[4] + ";";
            break;
            case 6: console.log("6 attributes entered, searching for " + StringArray[0] + " AND " + StringArray[1] + " AND " + StringArray[2] + " AND " + StringArray[3] + " AND " + StringArray[4] + " AND " + StringArray[5]);
            query = "SELECT * FROM dbo.Book WHERE " + StringArray[0] + " AND " + StringArray[1] + " AND " + StringArray[2] + " AND " + StringArray[3] + " AND " + StringArray[4] + " AND " + StringArray[5] + ";";
            break;
            case 7: console.log("7 attributes entered, searching for " + StringArray[0] + " AND " + StringArray[1] + " AND " + StringArray[2] + " AND " + StringArray[3] + " AND " + StringArray[4] + " AND " + StringArray[5] + " AND " + StringArray[6]);
            query = "SELECT * FROM dbo.Book WHERE " + StringArray[0] + " AND " + StringArray[1] + " AND " + StringArray[2] + " AND " + StringArray[3] + " AND " + StringArray[4] + " AND " + StringArray[5] + " AND " + StringArray[6] + ";";
            break;
            case 8: console.log("8 attributes entered, searching for " + StringArray[0] + " AND " + StringArray[1] + " AND " + StringArray[2] + " AND " + StringArray[3] + " AND " + StringArray[4] + " AND " + StringArray[5] + " AND " + StringArray[6] + " AND " + StringArray[7]);
            query = "SELECT * FROM dbo.Book WHERE " + StringArray[0] + " AND " + StringArray[1] + " AND " + StringArray[2] + " AND " + StringArray[3] + " AND " + StringArray[4] + " AND " + StringArray[5] + " AND " + StringArray[6] + " AND " + StringArray[7] + ";";
            break;
            case 9: console.log("9 attributes entered, searching for " + StringArray[0] + " AND " + StringArray[1] + " AND " + StringArray[2] + " AND " + StringArray[3] + " AND " + StringArray[4] + " AND " + StringArray[5] + " AND " + StringArray[6] + " AND " + StringArray[7] + " AND " + StringArray[8]);
            query = "SELECT * FROM dbo.Book WHERE " + StringArray[0] + " AND " + StringArray[1] + " AND " + StringArray[2] + " AND " + StringArray[3] + " AND " + StringArray[4] + " AND " + StringArray[5] + " AND " + StringArray[6] + " AND " + StringArray[7] + " AND " + StringArray[8] + ";";
            break;
            case 10: console.log("10 attributes entered, searching for " + StringArray[0] + " AND " + StringArray[1] + " AND " + StringArray[2] + " AND " + StringArray[3] + " AND " + StringArray[4] + " AND " + StringArray[5] + " AND " + StringArray[6] + " AND " + StringArray[7] + " AND " + StringArray[8] + " AND " + StringArray[9]);
            query = "SELECT * FROM dbo.Book WHERE " + StringArray[0] + " AND " + StringArray[1] + " AND " + StringArray[2] + " AND " + StringArray[3] + " AND " + StringArray[4] + " AND " + StringArray[5] + " AND " + StringArray[6] + " AND " + StringArray[7] + " AND " + StringArray[8] + " AND " + StringArray[9] + ";";
            break;
            case 11: console.log("11 attributes entered, searching for " + StringArray[0] + " AND " + StringArray[1] + " AND " + StringArray[2] + " AND " + StringArray[3] + " AND " + StringArray[4] + " AND " + StringArray[5] + " AND " + StringArray[6] + " AND " + StringArray[7] + " AND " + StringArray[8] + " AND " + StringArray[9] + " AND " + StringArray[10]);
            query = "SELECT * FROM dbo.Book WHERE " + StringArray[0] + " AND " + StringArray[1] + " AND " + StringArray[2] + " AND " + StringArray[3] + " AND " + StringArray[4] + " AND " + StringArray[5] + " AND " + StringArray[6] + " AND " + StringArray[7] + " AND " + StringArray[8] + " AND " + StringArray[9] + " AND " + StringArray[10] + ";";
            break;
            case 12: console.log("12 attributes entered, searching for " + StringArray[0] + " AND " + StringArray[1] + " AND " + StringArray[2] + " AND " + StringArray[3] + " AND " + StringArray[4] + " AND " + StringArray[5] + " AND " + StringArray[6] + " AND " + StringArray[7] + " AND " + StringArray[8] + " AND " + StringArray[9] + " AND " + StringArray[10] + " AND " + StringArray[11]);
            query = "SELECT * FROM dbo.Book WHERE " + StringArray[0] + " AND " + StringArray[1] + " AND " + StringArray[2] + " AND " + StringArray[3] + " AND " + StringArray[4] + " AND " + StringArray[5] + " AND " + StringArray[6] + " AND " + StringArray[7] + " AND " + StringArray[8] + " AND " + StringArray[9] + " AND " + StringArray[10] + " AND " + StringArray[11] + ";";
            break;

        }

       req.query(query).then(function(recordset) {
        console.log("New admin user entry will be viewed in the database.");
        
        if(recordset.recordsets.length > 0) {
            console.log("Found " + recordset.recordsets.length + " records");
            console.log(recordset);
            const resultArray = recordset.recordsets[0];     
            response.writeHead(200, {"Content-Type": "application/json"});
            response.write(JSON.stringify(resultArray));
            response.end(); 
        } 
        else {
            console.log("No records found")
            response.write("No records found");
        }
    }).catch(function(err) {
        console.error("error");
        console.log(err);
    });

}
catch(err){
    console.log(err);
    response.write("Error");
}})};
    
function DeleteBook(response, postData) {

    sql.connect(config).then(function () {
        var req = new sql.Request();

        var querystring = require('querystring');
        var data = querystring.parse(postData);
        var bookISBN = data.deletebookisbn;
        var query = "DELETE FROM dbo.Book WHERE ISBN = '" + bookISBN + "';";
        console.log(query);
        req.query(query).then(function(recordset) {
            console.log("a tuple in the book table will be deleted from the database.");
            response.write("Book deleted");
            response.end();}
        )
        })};

function UpdateBook(response, postData){


    sql.connect(config).then(function () {
        var req = new sql.Request();

        var querystring = require('querystring');
        var data = querystring.parse(postData);

        var bookISBN = data.ISBN;
        var bookName = data.Book_Name;   
        var bookDollarValue = data.Dollar_Value;
        var Number_of_Copies = data.Number_of_Copies;
        var bookAuthor = data.Author;
        var bookGenre = data.Genre;
        var bookLanguage = data.Language;
        var bookPublisher = data.Publisher_Name;

        

        console.log("Book ISBN: " + bookISBN);
        console.log("Book Name: " + bookName);
        console.log("Book Dollar Value: " + bookDollarValue);
        console.log("Number of Copies: " + Number_of_Copies);
        console.log("Book Author: " + bookAuthor);
        console.log("Book Genre: " + bookGenre);
        console.log("Book Language: " + bookLanguage);
        console.log("Book Publisher: " + bookPublisher);


        var query = "UPDATE dbo.Book SET Book_Name = '" + bookName + "', Dollar_Value = '" + bookDollarValue + "', Num_of_Copies = '" + Number_of_Copies + "', Author = '" + bookAuthor + "', Genre = '" + bookGenre + "', Language = '" + bookLanguage + "', Publisher_Name = '" + bookPublisher + "' WHERE ISBN = '" + bookISBN + "';";
        var secondquery = "UPDATE dbo.Book SET ISBN = '" + bookISBN + "' WHERE Book_Name = '" + bookName + "' AND Author = '" + bookAuthor + "' AND Genre = '" + bookGenre + "' AND Language = '" + bookLanguage + "' AND Publisher_Name = '" + bookPublisher + "' AND Dollar_Value = '" + bookDollarValue + "' AND Num_of_Copies = '" + Number_of_Copies + "';";


        req.query(query).then(function(recordset) {
            console.log("First query executed");
            req.query(secondquery).then(function(recordset) {
            response.write("Book Modified");
            response.end();}
        )});



    })}


/*function searchresults(response, postData) {
    var querystring = require('querystring');
    var params = querystring.parse(postData);
    var bookname = params['BookName'];
    var author = params['Author']; 
    var genre = params['Genre'];
    var language = params['Language'];
    var isbn = params['ISBN'];

    
}
*/

exports.login = login;
exports.loginverify = loginverify;
exports.PasswordChanger = PasswordChanger;

exports.search = search;
exports.adminUI = adminUI;
exports.BookEntry = BookEntry;
exports.ElectronicsEntry = ElectronicsEntry;
exports.MediaEntry = MediaEntry;
exports.ObjectEntry = ObjectEntry;
exports.TransactionEntry = TransactionEntry;
exports.StudentEntry = StudentEntry;
exports.GuestEntry = GuestEntry;
exports.FacultyEntry = FacultyEntry;
exports.AdminEntry = AdminEntry;
exports.BookEdit = BookEdit;
exports.ElectronicsEdit = ElectronicsEdit;
exports.ObjectEdit = ObjectEdit;
exports.MediaEdit = MediaEdit;
exports.FacultyEdit = FacultyEdit;
exports.StudentEdit = StudentEdit;
exports.GuestEdit = GuestEdit;
exports.TransactionsEdit = TransactionsEdit;
exports.SearchBooks = SearchBooks;
exports.DeleteBook = DeleteBook;
exports.UpdateBook = UpdateBook;
//exports.searchresults = searchresults;

exports.createUser = createUser;
exports.addLogin = addLogin;
exports.addItem = addItem;