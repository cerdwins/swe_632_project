$(document).ready(function() {
    //moves something to the completed bin or the uncompleted bin
    $(".form-check-input").is(':checked', function() {

    });
    //updates the categorized very high area and changes the classes 
    $("#todo-list-very").click(function(){
        var classes = this.firstChild.className;
        if (classes == "fa fa-caret-right"){
            this.firstChild.className = "fa fa-caret-down";
        }
        else{
            this.firstChild.className = "fa fa-caret-right";
        }
        getDataForCategorized("veryhigh");
    });

    //updates the categorized high area
    $("#todo-list-high").click(function(){
        var classes = this.firstChild.className;
        if (classes == "fa fa-caret-right"){
            this.firstChild.className = "fa fa-caret-down";
        }
        else{
            this.firstChild.className = "fa fa-caret-right";
        }
        getDataForCategorized("high");
    });

    //updates the categorized normal area
    $("#todo-list-normal").click(function(){
        var classes = this.firstChild.className;
        if (classes == "fa fa-caret-right"){
            this.firstChild.className = "fa fa-caret-down";
        }
        else{
            this.firstChild.className = "fa fa-caret-right";
        }
        getDataForCategorized("normal");
    });

    //updates the categorized by date areas of today
    $("#cat-today").click(function(){
        var classes = this.firstChild.className;
        if (classes == "fa fa-caret-right"){
            this.firstChild.className = "fa fa-caret-down";
        }
        else{
            this.firstChild.className = "fa fa-caret-right";
        }
        getDataForCategorized("normal");
    });


    //updates the categorized by date areas of this week
    $("#cat-thisweek").click(function(){
        var classes = this.firstChild.className;
        if (classes == "fa fa-caret-right"){
            this.firstChild.className = "fa fa-caret-down";
        }
        else{
            this.firstChild.className = "fa fa-caret-right";
        }
        getDataForCategorized("normal");
    });

    //updates the categorized by date areas of next week
    $("#cat-nextweek").click(function(){
        var classes = this.firstChild.className;
        if (classes == "fa fa-caret-right"){
            this.firstChild.className = "fa fa-caret-down";
        }
        else{
            this.firstChild.className = "fa fa-caret-right";
        }
        getDataForCategorized("normal");
    });

    //updates the categorized by date areas of next week
    $("#cat-thismonth").click(function(){
        var classes = this.firstChild.className;
        if (classes == "fa fa-caret-right"){
            this.firstChild.className = "fa fa-caret-down";
        }
        else{
            this.firstChild.className = "fa fa-caret-right";
        }
        getDataForCategorized("normal");
    });


    //updates the categorized normal area
    $("#todo-list-normal").click(function(){
        var classes = this.firstChild.className;
        if (classes == "fa fa-caret-right"){
            this.firstChild.className = "fa fa-caret-down";
        }
        else{
            this.firstChild.className = "fa fa-caret-right";
        }
        getDataForCategorized("normal");
    });

    
    // create Calendar from div HTML element
    $("#mainCalendar").kendoCalendar({
        format: "MM/dd/yyyy",
        change: calendarChange

    });
    $("#fromDate").kendoDatePicker({

        // display month and year in the input
        format: "MM/dd/yyyy",
    });
    $("#toDate").kendoDatePicker({

        // display month and year in the input
        format: "MM/dd/yyyy",
    });
    

    /******************EVENT HANDLING PARTS ONLY********************** */

    //Display selected date on the calendar on load
    var calendar = $("#mainCalendar").data('kendoCalendar');
    var dateSelected = calendar.current();
    displayCalendarValue(toMMDDYYYY(dateSelected));


    //When an item is created
    $('#create-todo-item').click(function(event) {
        event.preventDefault();
        //Gather form data
        var dueDate = dateSelected;
        var formData = $('#create-todo-item-form').serializeArray();
        var name = document.getElementById("simple-input").value
        var importance = formData[0].value;
        addToDoList(name, dueDate, importance, false);
        //reload the entire page
        $('#createdAlert').removeClass('hide').addClass('show');
        rapidRefresh();
    });

    rapidRefresh();

});

//updates and refreshes the todo list
function rapidRefresh(){
    emptyToDoList();
    showToDoList();
    updateToDoCounts()
    initialLateStateVariables();  //intializes the variables that are only now available
}



//moves something to the completed bin or the uncompleted bin
function initialLateStateVariables(){
    $(".form-check-input").change(function(){
        var id = $(this).data("internalid");
        changeStatusOfAToDo(id);
        rapidRefresh();
    });
    $(".trash").click(function(){
        var correctNode = this.parentElement.children[0].children[0];
        var id = $(correctNode).data("internalid");
        deleteItem(id);
        rapidRefresh();
    })
}

//updates the counts above the ToDo list
function updateToDoCounts(){
    var data = showData();
    if(data != null){
        var completedData = data.items.filter(element => element.isCompleted == true);
        document.getElementById("completed-badge").innerText = completedData.length;
        document.getElementById("uncompleted-badge").innerText = data.items.length - completedData.length;
    }
    else{
        document.getElementById("completed-badge").innerText = 0;
        document.getElementById("uncompleted-badge").innerText = 0;
    }
}


//empties the ToDo List
function emptyToDoList(){
    $("#notCompleted").empty();
    $("#completedList").empty();
}

var VERY_HIGH_IMPORTANCE = 'Very High', HIGH_IMPORTANCE = 'High', NORMAL_IMPORTANCE = 'Normal';

//Creates the lists in the "Most Recent Todo Lists" area
function showToDoList(){
    var currentData = showData();
    if(currentData != null){
        for(i = 0; i < currentData.items.length; i++){
            createLineItemInToDoList(currentData.items[i]);
        }
    }
}

//Creates a line item in the #list-group.  Use 1 Array Json Value
function createLineItemInToDoList(data){
    var splitted = data.dueDate.split(":");
    data.dueDate = splitted[0];
    if(data.isCompleted){
        var html ='<li class="list-group-item highList">' +
                    '<label class="form-check-label completed-item">' +
                    '<input type="checkbox" class="form-check-input" data-internalid="' + data.id + '" data-completed="' + data.isCompleted + '" value="' + data.importance + '" checked>' + data.name +
                    '</label>' +
                    '<i class="fa fa-trash float-right trash"></i>' + 
                    '<p class="small-text">Due Date: ' + data.dueDate + '</p>' + 
                    '</li>';
        $("#completedList").append(html);
    }else{
        var html ='<li class="list-group-item highList">' +
                    '<label class="form-check-label">' +
                    '<input type="checkbox" class="form-check-input" data-internalid="' + data.id + '" data-completed="' + data.isCompleted + '" value="' + data.importance + '">' + data.name +
                    '</label>' +
                    '<i class="fa fa-trash float-right trash"></i>' + 
                    '<p class="small-text">Due Date: ' + data.dueDate + '</p>' + 
                    '</li>';
        $("#notCompleted").append(html);
    }  
}


//Creates the line items under a given section of the sort area
function getDataForCategorized(categorization){
    var data = [];
    data = searchByImportance(categorization);
    $("#todo-list-" + categorization +"-hiddenlist").html("<ul id='" + categorization + "-newlist'></ul>");
    for(x = 0; x < data.length; x++){
        var listItem = "<li></li>";
        $(categorization + "-newlist").append(listItem);
    }
}

//to Display the value of the calendar on the text
function displayCalendarValue(val) {
    var selecteDateId = "#selectedDate";
    $(selecteDateId).text(val);
}
//When calendar value changes, change the dates as well
function calendarChange() {
    dateSelected = toMMDDYYYY(this.value());
    displayCalendarValue(dateSelected);
    $("#selected_date").html("Date currently selected on the calendar is: <strong >" + dateSelected + "</strong>");
}

//Class to create todo Object
function Todo(id, name, dueDate, importance, isCompleted) {
    this.id = id;
    this.name = name;
    this.dueDate = dueDate;
    this.importance = importance;
    this.isCompleted = isCompleted;
}
//Class declaration ends
/****************LOCAL STORAGE STUFFS***************/
if (typeof(Storage) !== "undefined") {

} else {
    alert("Local storage not supported.")
}
/****************LOCAL STORAGE STUFFS ENDS***************/
//stored using the key="todos"
function getDataFromLocalStorage() {
    return JSON.parse(localStorage.getItem("todos"));
}
//stored using the key="todos"
function setDataToLocalStorage(data) {
    if (data) {
        localStorage.setItem("todos", JSON.stringify(data));
    }
}
//Users CRUD operations
function addToDoList(name, dueDate, importance, isCompleted) {
    //get the local storage data // get the index of the highest item // add to the list //set the localstorage
    currentData = getDataFromLocalStorage();

    if (!currentData) {
        var currentData = {
            index: 0,
            items: []
        };
        currentData.index += 1;
        var toDo = new Todo(currentData.index, name, dueDate, importance, isCompleted);
        currentData.items.push(toDo);
        setDataToLocalStorage(currentData);
    } else {
        currentData.index += 1;
        var toDo = new Todo(currentData.index, name, dueDate, importance, isCompleted);
        currentData.items.push(toDo);
        setDataToLocalStorage(currentData);
    }
}
//Display all the items
function showData() {
    return getDataFromLocalStorage();
}
//change from completedToNotCompletedAndViceVersa
function changeStatusOfAToDo(id) {
    //Search for the items
    var currentData = showData();
    if (currentData) {
        //Check to see if there is any item in the storage
        if (currentData.index > 0) {
            if (currentData.items[id - 1].isCompleted) {
                currentData.items[id - 1].isCompleted = false;
            } else {
                currentData.items[id - 1].isCompleted = true;
            }
            setDataToLocalStorage(currentData);
        }
    }

}

//search for an item by importance
function searchByImportance(importance) {
    var result = [];
    var currentData = showData();
    if (currentData) {
        if (currentData.index > 0) {
            result = currentData.items.filter(filterByImportance(currentData.items, importance.toLowerCase()));
        }
    }
    return result;
}

//utility for importance search
function filterByImportance(data, importance) {
    if (importance == "normal") {
        return data.importance == "normal";
    } else if (importance == "high") {
        return data.importance == "high";
    } else if (importance == "veryhigh") {
        return data.importance == "veryhigh";
    } else {
        return data;
    }

}
//search by dates
function searchByDates(fromDate, toDate) {
    var result = [];
    //not implemented yet
    return result;
}
//Delete item from the storage
function deleteItem(id) {
    var currentData = showData();
    if (currentData) {
        if (currentData.index == 1) {
            localStorage.clear();
        } else {
            currentData.index -= 1;
            currentData.items = removeItemFromArray(currentData.items, id);
            setDataToLocalStorage(currentData);
        }

    }
}
//Utility methods- this will return a new array
function removeItemFromArray(array, index) {
    return array.filter(e => e !== array[index - 1]);
}

/*************DATE UTILITIES************/
//convert to mm/dd/yyyy
function toMMDDYYYY(date) {
    var dateInMMDDYYYY = date.getMonth() + 1 + "/" + date.getDate() + "/" + date.getFullYear();
    return dateInMMDDYYYY;
}

(function() {
    var currentData = showData();
    var dataSource = new kendo.data.DataSource({
        data: currentData.items,
        schema: {
            model: {
                id: 'id',
                fields: {
                    id : {
                        type: 'number'
                    },
                    name: {
                        type: 'string'
                    },
                    dueDate: {
                        type: 'date'
                    },
                    importance: {
                        type: 'string'
                    },
                    isCompleted: {
                        type: 'boolean'
                    }
                }
            }
        },
        group: {
            field: 'importance',
            aggregates: [{ field: 'importance', aggregate: 'count' }]
        }
    });

    dataSource.read();
    var view = dataSource.view();
    var formatItems = function(count) {
        if (count) {
            return count > 1 ? count + ' items' : '1 item';
        }
        return 'No items';
    };

    console.log(view);
    console.log(currentData.items);

    var aggregateCountByType = function(type) {
        return formatItems(view.find(function(item) { return item.value === type; }).aggregates.importance.count);
    };

    dataSource.query({
        filter: {
            field: 'importance',
            operator: function(importance) {
                return importance === HIGH_IMPORTANCE;
            }
        }
    }).then(function(data) {
        console.log('data', data);
        console.log('data', dataSource.view());

    });

    var byImportance = kendo.observable({
        totalHigh: aggregateCountByType(HIGH_IMPORTANCE),
        totalVeryHigh: aggregateCountByType(VERY_HIGH_IMPORTANCE),
        totalNormal: aggregateCountByType(NORMAL_IMPORTANCE)
    });

    var byDate = kendo.observable({
        today: aggregateCountByType(HIGH_IMPORTANCE),
        thisWeek: aggregateCountByType(VERY_HIGH_IMPORTANCE),
        nextWeek: aggregateCountByType(NORMAL_IMPORTANCE),
        thisMonth: aggregateCountByType(NORMAL_IMPORTANCE)
    });

    kendo.bind($('#categorized-by-importance'), byImportance);

    kendo.bind($('#categorized-by-date'), byDate);

}());
