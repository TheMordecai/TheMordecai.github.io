var server = require("./server");
var router = require("./router");
var requestHandlers = require("./requestHandlers");

var handle = {};
handle["/"] = requestHandlers.login; //http://localhost:3000/login
handle["/login"] = requestHandlers.login; //http://localhost:3000/login
handle["/loginverify"] = requestHandlers.loginverify; //not an actual page
handle["/PasswordChanger"] = requestHandlers.PasswordChanger; //http://localhost:3000/PasswordChanger

handle["/search"] = requestHandlers.search; //http://localhost:3000/search
handle["/createUser"] = requestHandlers.createUser; //http://localhost:3000/createUser
handle["/addLogin"] = requestHandlers.addLogin; //not an actual page
handle["/adminUI"] = requestHandlers.adminUI; //http://localhost:3000/adminUI

handle["/BookEntry"] = requestHandlers.BookEntry; //http://localhost:3000/BookEntry
handle["/ElectronicsEntry"] = requestHandlers.ElectronicsEntry; //http://localhost:3000/ElectronicsEntry
handle["/MediaEntry"] = requestHandlers.MediaEntry; //http://localhost:3000/MediaEntry
handle["/ObjectEntry"] = requestHandlers.ObjectEntry; //http://localhost:3000/ObjectEntry
handle["/TransactionEntry"] = requestHandlers.TransactionEntry; //http://localhost:3000/TransactionEntry

handle["/BookEdit"] = requestHandlers.BookEdit; //http://localhost:3000/BookEdit
handle["/ElectronicsEdit"] = requestHandlers.ElectronicsEdit; //http://localhost:3000/ElectronicsEdit
handle["/ObjectEdit"] = requestHandlers.ObjectEdit; //http://localhost:3000/ObjectEdit
handle["/MediaEdit"] = requestHandlers.MediaEdit; //http://localhost:3000/MediaEdit

handle["/FacultyEdit"] = requestHandlers.FacultyEdit; //http://localhost:3000/FacultyEdit
handle["/StudentEdit"] = requestHandlers.StudentEdit; //http://localhost:3000/StudentEdit
handle["/GuestEdit"] = requestHandlers.GuestEdit; //http://localhost:3000/GuestEdit
handle["/TransactionsEdit"] = requestHandlers.TransactionsEdit; //http://localhost:3000/TransactionsEdit

handle["/StudentEntry"] = requestHandlers.StudentEntry; //http://localhost:3000/StudentEntry
handle["/GuestEntry"] = requestHandlers.GuestEntry; //http://localhost:3000/GuestEntry
handle["/FacultyEntry"] = requestHandlers.FacultyEntry; //http://localhost:3000/FacultyEntry
handle["/SearchBooks"] = requestHandlers.SearchBooks; //http://localhost:3000/bookSearch
handle["/AdminEntry"] = requestHandlers.AdminEntry; //http://localhost:3000/AdminEntry

handle["/addItem"] = requestHandlers.addItem; //http://localhost:3000/addItem
handle["/DeleteBook"] = requestHandlers.DeleteBook; //http://localhost:3000/DeleteBook
handle["/profile"] = requestHandlers.profile; //http://localhost:3000/profile
handle["/UpdateBook"] = requestHandlers.UpdateBook; //http://localhost:3000/BookUpdate
server.start(router.route, handle);