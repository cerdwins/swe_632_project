/* Creates a log in the Storage.json file on the server */
/* Created By: Chris Erdwins */
function createLogValue() {
    console.log("hello");
    var username = "Chris Erdwins" //pass this in when we login 
        //get user values
    var appointment_text = document.getElementById("simple-input").value;
    var temp_date = document.getElementById("mainCalendar_cell_selected");
    var appointment_date = temp_date.children[0].dataset.value; //gets the appointment date
    var temp_importance = document.getElementsByName("radio-importance");
    var appointment_import = null;
    for (i = 0; i < temp_importance.length; i++) {
        if (temp_importance[i].children[0].checked) {
            appointment_import = temp_importance[i].children[0].value;
            break;
        }
    }
    console.log(appointment_text);
    console.log(appointment_date);
    console.log(appointment_import);
    //save the inputs to Storage.json
    //create a table
    /*var table = {
        table:[]
    }*/
    //save everything into the table
    var table = {
        name: username,
        text: appointment_text,
        date: appointment_date,
        importance: appointment_import,
        complete: "incomplete"
    };

    var temp1 = JSON.parse(localStorage.getItem('todo'));
    var todo_array = [];

    for (i = 0; i < temp1.length; i++) {
        var a = temp1[i];
        todo_array.push(a); //this maintains a proper format
    }
    todo_array.push(table); //pushes in the new data
    //Json.stringify the table
    var data = JSON.stringify(todo_array);
    //save the value to local storage 
    localStorage.setItem('todo', JSON.stringify(todo_array));
    //(Developer Note:  This is a STUB as this is for the the UI Class.  NoSQL would take the place of this)
    var test = JSON.parse(localStorage.getItem('todo'));
    console.log(test[0].name);
    console.log(test[0].date);
    console.log(test[0].text);
    console.log(test[0].importance);
}



/** Gets all localStorage Logs and Writes them into the DOM @ #list-group */
/* Created By: Chris Erdwins */
function getLogValue(UserName) {
    var todo_array = JSON.parse(localStorage.getItem('todo'));
    for (i = 0; i < todo_array.length; i++) {
        var list_item = "<li class='list-group-item highList'>" +
            "<label class='form-check-label completed-item'>" +
            "<input type='checkbox' class='form-check-input' value='' checked>" + todo[i].text +
            "</label>"
        "<i class='fa fa-trash float-right trash'></i>" +
        "<p class='small-text'>Due Date:" + todo_array[i].date + "</p>"
        "</li>"
        $("list-group").append(list_item);
    }
}