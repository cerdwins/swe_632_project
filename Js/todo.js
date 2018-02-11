$(document).ready(function() {
    //moves something to the completed bin or the uncompleted bin
    $(".form-check-input").is(':checked', function() {

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
    var currentData = getDataFromLocalStorage() || {
        index: 0,
        items: []
    };
    currentData.index += 1;
    var toDo = new Todo(currentData.index, name, dueDate, importance, isCompleted);
    currentData.items.push(toDo);
    setDataToLocalStorage(currentData);
    categorizedItems.addItem(toDo);
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
        categorizedItems.removeItem(id)
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

var categorizedItems = (function() {
    var formatItems = function(count) {
        if (count) {
            return count > 1 ? count + ' items' : '1 item';
        }
        return 'No items';
    };

    var createFilteredDataSource = function(filterDefinition) {
        return new kendo.data.DataSource({
            data: currentData.items,
            schema: { model: dataModel },
            sort: [{ field: 'dueDate', dir: 'desc' }, { field: 'name', dir: 'asc' }],
            filter: filterDefinition
        });
    };

    var currentData = showData() || { items: [] };

    kendo.data.binders.slide = kendo.data.Binder.extend({
        refresh: function() {
            var value = this.bindings["slide"].get();

            if (value) {
                $(this.element).slideDown();
            } else {
                $(this.element).slideUp();
            }
        }
    });

    var dataModel = new kendo.data.Model.define({
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
    });

    var createDataSourceByImportance = function(importanceType) {
        return createFilteredDataSource({
            field: 'importance',
            operator: 'eq',
            value: importanceType
        });
    };

    var veryHigh = createDataSourceByImportance(VERY_HIGH_IMPORTANCE);
    var high     = createDataSourceByImportance(HIGH_IMPORTANCE);
    var normal   = createDataSourceByImportance(NORMAL_IMPORTANCE);

    var CARET_RIGHT_CLASS = 'fa-caret-right', CARET_DOWN_CLASS = 'fa-caret-down';

    var byImportance = kendo.observable({
        veryHigh: veryHigh,
        veryHighTotal: null,
        high: high,
        highTotal: null,
        normal: normal,
        normalTotal: null,
        toggleList: function(e) {
            var $target = $(e.currentTarget);
            var displayVeryHigh = $target.is('#todo-list-very')     && ! this.displayVeryHigh;
            var displayHigh     = $target.is('#todo-list-high')     && ! this.displayHigh;
            var displayNormal   = $target.is('#todo-list-normal')   && ! this.displayNormal;
            this.set('displayVeryHigh', displayVeryHigh);
            $('#todo-list-very i').addClass(displayVeryHigh ? CARET_DOWN_CLASS : CARET_RIGHT_CLASS)
                .removeClass(displayVeryHigh ? CARET_RIGHT_CLASS : CARET_DOWN_CLASS);
            this.set('displayHigh', displayHigh);
            $('#todo-list-high i').addClass(displayHigh ? CARET_DOWN_CLASS : CARET_RIGHT_CLASS)
                .removeClass(displayHigh ? CARET_RIGHT_CLASS : CARET_DOWN_CLASS);
            this.set('displayNormal', displayNormal);
            $('#todo-list-normal i').addClass(displayNormal ? CARET_DOWN_CLASS : CARET_RIGHT_CLASS)
                .removeClass(displayNormal ? CARET_RIGHT_CLASS : CARET_DOWN_CLASS);
        },
        displayVeryHigh: false,
        displayHigh: false,
        displayNormal: false,
        dataBound: function(e) {
            this.set('veryHighTotal', formatItems(this.veryHigh.total()));
            this.set('highTotal', formatItems(this.high.total()));
            this.set('normalTotal', formatItems(this.normal.total()));
        }
    });

    var createDataSourceByDate = function(rangeStart, rangeEnd) {
        return createFilteredDataSource({
            field: 'dueDate',
            operator: function(dueDate) {
                return dateUtils.isInDateRange(dueDate, rangeStart, rangeEnd);
            }
        });
    };

    var dateUtils = kendo.date;
    var today = dateUtils.today();
    var nextSunday = dateUtils.today();
    nextSunday = dateUtils.addDays(nextSunday, 7 - nextSunday.getDay());

    var byDate = kendo.observable({
        displayToday: false,
        displayThisWeek: false,
        displayNextWeek: false,
        displayThisMonth: false,
        toggleList: function(e) {
            var $target = $(e.currentTarget);
            var displayToday        = $target.is('#cat-today')      && ! this.displayToday;
            var displayThisWeek     = $target.is('#cat-thisweek')   && ! this.displayThisWeek;
            var displayNextWeek     = $target.is('#cat-nextweek')   && ! this.displayNextWeek;
            var displayThisMonth    = $target.is('#cat-thismonth')  && ! this.displayThisMonth;
            this.set('displayToday', displayToday);
            $('#cat-today i').addClass(displayToday ? CARET_DOWN_CLASS : CARET_RIGHT_CLASS)
                .removeClass(displayToday ? CARET_RIGHT_CLASS : CARET_DOWN_CLASS);
            this.set('displayThisWeek', displayThisWeek);
            $('#cat-thisweek i').addClass(displayThisWeek ? CARET_DOWN_CLASS : CARET_RIGHT_CLASS)
                .removeClass(displayThisWeek ? CARET_RIGHT_CLASS : CARET_DOWN_CLASS);
            this.set('displayNextWeek', displayNextWeek);
            $('#cat-nextweek i').addClass(displayNextWeek ? CARET_DOWN_CLASS : CARET_RIGHT_CLASS)
                .removeClass(displayNextWeek ? CARET_RIGHT_CLASS : CARET_DOWN_CLASS);
            this.set('displayThisMonth', displayThisMonth);
            $('#cat-thismonth i').addClass(displayThisMonth ? CARET_DOWN_CLASS : CARET_RIGHT_CLASS)
                .removeClass(displayThisMonth ? CARET_RIGHT_CLASS : CARET_DOWN_CLASS);
        },
        today: createDataSourceByDate(today, today),
        thisWeek: createDataSourceByDate(dateUtils.dayOfWeek(today, 0, 1), dateUtils.dayOfWeek(today, 6, 1)),
        nextWeek: createDataSourceByDate(nextSunday, dateUtils.dayOfWeek(nextSunday, 6, 1)),
        thisMonth: createDataSourceByDate(dateUtils.firstDayOfMonth(today), dateUtils.lastDayOfMonth(today)),
        dataBound: function(e) {
            this.set('todayTotal', formatItems(this.today.total()));
            this.set('thisWeekTotal', formatItems(this.thisWeek.total()));
            this.set('nextWeekTotal', formatItems(this.nextWeek.total()));
            this.set('thisMonthTotal', formatItems(this.thisMonth.total()));
        }
    });

    kendo.bind($('#categorized-by-importance'), byImportance);
    kendo.bind($('#categorized-by-date'), byDate);

    return {
        addItem: function(item) {
            console.log('addItem', item);
            veryHigh.add(item);
        },
        removeItem: function(itemId) {
            console.log('removeItem', itemId);
        }
    }
}());
