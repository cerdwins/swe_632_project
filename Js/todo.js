$(document).ready(function() {
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
                currentData.items = removeItemFromArray(currentData.items, currentData.index);
                setDataToLocalStorage(currentData);
            }

        }
    }
    //Utility methods- this will return a new array
    function removeItemFromArray(array, index) {
        return array.filter(e => e !== array[index]);
    }

    /*************DATE UTILITIES************/
    //convert to mm/dd/yyyy
    function toMMDDYYYY(date) {
        var dateInMMDDYYYY = date.getMonth() + 1 + "/" + date.getDate() + "/" + date.getFullYear();
        return dateInMMDDYYYY;
    }

    /******************EVENT HANDLING PARTS ONLY********************** */

    //Display selected date on the calendar on load
    var calendar = $("#mainCalendar").data('kendoCalendar');
    var dateSelected = calendar.current();
    displayCalendarValue(toMMDDYYYY(dateSelected));
    //to Display the value of the calendar on the text
    function displayCalendarValue(val) {
        var selecteDateId = "#selectedDate";
        $(selecteDateId).text(val);
    }
    //When calendar value changes, change the dates as well
    function calendarChange() {
        dateSelected = toMMDDYYYY(this.value());
        displayCalendarValue(dateSelected)
    }

    //When an item is created
    $('#createForm').submit(function(event) {
        event.preventDefault();
        //Gather form data
        var dueDate = dateSelected;
        var formData = $(this).serializeArray();
        var name = formData[0].value;
        var importance = formData[1].value;
        addToDoList(name, dueDate, importance, false);
        //reload the entire page
        $('#createdAlert').removeClass('hide').addClass('show');
    });


});