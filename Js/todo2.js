$(document).ready(function() {
    //moves something to the completed bin or the uncompleted bin
    $(".form-check-input").is(':checked', function() {

    });

    var notification = $('#notification').kendoNotification({
        position: {
            top: 30
        },
        autoHideAfter: 2000,
        templates: [{
            type: 'info',
            template: $('#notification-template').html()
        }],
        width: 300,
        height: 50
    }).data('kendoNotification');

    // create Calendar from div HTML element
    $("#mainCalendar").kendoCalendar({
        value: kendo.date.today(),
        format: "MM/dd/yyyy",
        //When calendar value changes, change the dates as well
        change: function() {
            var dateSelected = toMMDDYYYY(this.value());
            displayCalendarValue(dateSelected);
        }
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
        var dueDate = calendar.value();
        var formData = $('#create-todo-item-form').serializeArray();
        var name = document.getElementById("simple-input").value;
        var importance = formData[0].value;
        if (name) {
            addToDoList(name, dueDate, importance, false);
            //reload the entire page
            $('#createdAlert').removeClass('hide').addClass('show');
            rapidRefresh();
            notification.show({ message: 'Your ToDo item has been added' });
        } else {
            notification.show('Todo Name must be specified.', "error");
        }

    });

    rapidRefresh();

});

//updates and refreshes the todo list
function rapidRefresh() {
    emptyToDoList();
    showToDoList();
    updateToDoCounts();
    initialLateStateVariables(); //intializes the variables that are only now available
}

//moves something to the completed bin or the uncompleted bin
function initialLateStateVariables() {
    $(".form-check-input").change(function() {
        var id = $(this).data("internalid");
        changeStatusOfAToDo(id);
        rapidRefresh();
    });
    $(".trash").click(function() {
        var info = this.parentElement.children[0].innerText;
        var date = this.parentElement.children[2].innerText;
        date = date.replace("Due Date: ", "");
        if (!confirm('Are you sure you want to delete to do with ' + info + ' importance todo for ' + date + '?')) return;
        var correctNode = this.parentElement.children[0].children[0];
        var id = $(correctNode).data("internalid");
        deleteItem(id);
        rapidRefresh();
        $('#notification').data('kendoNotification').show({ message: 'todo list with ' + info + ' importance has been deleted.' });
    })
}

//updates the counts above the ToDo list
function updateToDoCounts() {
    var data = showData();
    if (data != null) {
        $('.totalTodos').text(data.index);
        var completedData = data.items.filter(element => element.isCompleted);

        document.getElementById("completed-badge").innerText = completedData.length;
        document.getElementById("uncompleted-badge").innerText = data.items.length - completedData.length;
    } else {
        $('.totalTodos').text('0');
        document.getElementById("completed-badge").innerText = 0;
        document.getElementById("uncompleted-badge").innerText = 0;
    }
}


//empties the ToDo List
function emptyToDoList() {
    $("#notCompleted").empty();
    $("#completedList").empty();
}

var VERY_HIGH_IMPORTANCE = 'Very High',
    HIGH_IMPORTANCE = 'High',
    NORMAL_IMPORTANCE = 'Normal';

//Creates the lists in the "Most Recent Todo Lists" area
function showToDoList() {
    var currentData = showData();
    if (currentData != null) {
        for (i = 0; i < currentData.items.length; i++) {
            createLineItemInToDoList(currentData.items[i]);
        }

    }
}
//convert to mm/dd/yyyy
function toMMDDYYYYString(date) {
    var dateInMMDDYYYY = date.getMonth() + 1 + "/" + date.getDate() + "/" + date.getFullYear();
    return dateInMMDDYYYY;
}

//Creates a line item in the #list-group.  Use 1 Array Json Value
function createLineItemInToDoList(data) {
    //var splitted = data.dueDate.split(":");
    //data.dueDate = splitted[0];
    if (data.importance == VERY_HIGH_IMPORTANCE) {
        var listType = "veryHighList";
    }
    if (data.importance == HIGH_IMPORTANCE) {
        var listType = "highList";
    }
    if (data.importance == NORMAL_IMPORTANCE) {
        var listType = "normalList";
    }

    if (data.isCompleted) {
        var html = '<li class="list-group-item ' + listType + '">' +
            '<label class="form-check-label completed-item main">' +
            '<input type="checkbox" class="form-check-input" data-internalid="' + data.id + '" data-completed="' + data.isCompleted + '" value="' + data.importance + '" checked>' + data.name +
            '<span class="checkmark"></span></label>' +
            '<i class="fa fa-trash float-right trash"></i>' +
            '<p class="small-text">Due Date: ' + toMMDDYYYYString(new Date(data.dueDate)) + '</p>' +
            '</li>';
        $("#completedList").append(html);
    } else {
        var html = '<li class="list-group-item ' + listType + '">' +
            '<label class="form-check-label main">' +
            '<input type="checkbox" class="form-check-input" data-internalid="' + data.id + '" data-completed="' + data.isCompleted + '" value="' + data.importance + '">' + data.name +
            '<span class="checkmark"></span></label>' +
            '<i class="fa fa-trash float-right trash"></i>' +
            '<p class="small-text">Due Date: ' + toMMDDYYYYString(new Date(data.dueDate)) + '</p>' +
            '</li>';
        $("#notCompleted").append(html);
    }
}

//to Display the value of the calendar on the text
function displayCalendarValue(val) {
    $("#selected-date").text(val);
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
    alert("Local storage not supported.");
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
    $('#simple-input').val('');
}
//Display all the data
function showData() {
    return getDataFromLocalStorage();
}
//change from completedToNotCompletedAndViceVersa
function changeStatusOfAToDo(id) {
    var i, len;
    //Search for the items
    var currentData = showData();
    //Check to see if there is any item in the storage
    if (currentData && currentData.index > 0) {
        for (i = 0, len = currentData.items.length; i < len; i++) {
            var item = currentData.items[i];
            if (item.id === id) {
                item.isCompleted = !item.isCompleted;
                setDataToLocalStorage(currentData);
                break;
            }
        }
    }
}
//delete entire storage
$("#deleteStorage").click(function() {
    if (confirm("Are you sure you would like to remove all the data?")) {

        $('#notification').data('kendoNotification').show({ message: 'Please wait...refreshing data' });
        localStorage.clear();
        location.reload();
    }

});
//Delete item from the storage
function deleteItem(id) {
    if (id) {
        var currentData = showData();
        if (currentData) {
            if (currentData.index == 1) {
                localStorage.clear();
            } else {
                currentData.index -= 1;
                currentData.items = removeItemFromArray(currentData.items, id);
                setDataToLocalStorage(currentData);
            }
            categorizedItems.removeItem(id);
        }
    }

}
//Utility methods- this will return a new array
function removeItemFromArray(array, id) {
    return array.filter(e => e.id !== id);
}



/*************DATE UTILITIES************/
//convert to mm/dd/yyyy
function toMMDDYYYY(date) {
    return kendo.toString(date, 'MM/dd/yyyy');
}
//convert to mm/dd/yyyy
function toMMDDYYYYString(date) {
    var dateInMMDDYYYY = date.getMonth() + 1 + "/" + date.getDate() + "/" + date.getFullYear();
    return dateInMMDDYYYY;
}

//format
function toMMDDYYYYForComparing(date) {
    var dateInMMDDYYYY = date.getMonth() + 1 + "/" + date.getDate() + "/" + date.getFullYear();
    return new Date(dateInMMDDYYYY);
}
//***********BOSTRAP MODAL AND THEIR OPERATIONS************ */
function DisplayDataInModal(isModalRefresh, category, filter) {
    var currentData = showData();
    if (currentData) {
        var dataToBeBound = null;

        if (category == "1") {
            //this is for importance
            var allImportantData = searchByImportance(currentData.items);
            if (filter == "veryhigh") {
                dataToBeBound = allImportantData.veryHigh;
            } else if (filter == "high") {
                dataToBeBound = allImportantData.high;
            } else if (filter == "normal") {
                dataToBeBound = allImportantData.normal;
            } else {
                alert("no filter found");
            }

        } else if (category == "2") {
            //this is for predefined dates
            var allDatesData = searchByPredefinedDates(currentData.items);
            if (filter == "today") {
                dataToBeBound = allDatesData.today;
            } else if (filter == "thisweek") {
                dataToBeBound = allDatesData.thisWeek;
            } else if (filter == "nextweek") {
                dataToBeBound = allDatesData.nextWeek;

            } else if (filter == "thismonth") {
                dataToBeBound = allDatesData.thisMonth;
            } else {
                alert("no filter found");
            }

        } else if (category == "3") {

            //this is for custom search

            //check to see if any of the fields are empty
            if ($("#fromDate").val() == "" || $("#toDate").val() == "") {
                $('#notification').data('kendoNotification').show('Missing From or To date.Try again', "error");
            } else {

                //todate cannot be smaller than the 
                var fromDate = $("#fromDate").data("kendoDatePicker").value();
                var toDate = $("#toDate").data("kendoDatePicker").value();
                if (fromDate && toDate) {
                    if (toDate < fromDate) {
                        $('#notification').data('kendoNotification').show('“From” date must be prior to the “To” date.Try again', "error");
                    } else {
                        dataToBeBound = searchBetweenDates(currentData.items, fromDate, toDate);
                    }
                } else {
                    $('#notification').data('kendoNotification').show('Date entered is not valid.Try again', "error");
                }
            }
        } else {
            alert("no category found");
        }
        if (dataToBeBound.length > 0) {
            bindDataToModal(dataToBeBound, isModalRefresh, category, filter);
        } else {

            if (isModalRefresh) {
                $('#toDoModal').modal('hide');
            } else {
                alert("No data to display");
            }

        }
    } else {

        if (isModalRefresh) {
            $('#toDoModal').modal('hide');
        } else {
            alert("No data found in your system");
        }

    }
}
//When users click on the items on the left panel 
$('.category').on('click', '.openModal', function() {
    var category = $(this).attr('data-category');
    var filter = $(this).attr('data-filter');
    DisplayDataInModal(false, category, filter);
});
$('#todoModal').on('hidden.bs.modal', function() {
    $('#md-todoList ul.list-group').empty();
});
//this will create a modal and bind the incoming data to it
function bindDataToModal(data, isModalRefresh, category, filter) {
    $('#md-todoList ul.list-group').empty();
    $('#md-todoList #categoryAndFilter').attr('data-category', "");
    $('#md-todoList #categoryAndFilter').attr('data-filter', "");
    $('#md-todoList #categoryAndFilter').attr('data-category', category);
    $('#md-todoList #categoryAndFilter').attr('data-filter', filter);
    //populate the recent data
    $.each(data, function(index, value) {
        var importanceClass = "";
        var completed = "";
        var checked = "";
        if (value.isCompleted) {
            completed = "completed-item";
            checked = "checked";
        }
        if (value.importance.toLowerCase() == VERY_HIGH_IMPORTANCE) {
            importanceClass = "veryHighList";
        } else if (value.importance.toLowerCase() == HIGH_IMPORTANCE) {
            importanceClass = "highList";
        } else if (value.importance.toLowerCase() == HIGH_IMPORTANCE) {
            importanceClass = "normalList";
        } else {
            //no class
        }


        $('#md-todoList ul.list-group').append('<li class="list-group-item ' + importanceClass + '"><label class="form-check-label main ' + completed + '">' +
            '<input data-id="' + value.id + '" type="checkbox" class="form-check-input changeStatus" value="" ' + checked + '>' + value.name + '<span class="checkmark"></span></label><i data-id="' + value.id +
            '"  class="fa fa-trash float-right trash">' +
            '</i><p class="small-text">Due Date: ' + toMMDDYYYYString(new Date(value.dueDate)) + '</p></li>');


    });
    if (!isModalRefresh) {
        $('#toDoModal').modal('show');
    }

}

//search between dates
function searchBetweenDates(currentData, fromDate, toDate) {
    var result = [];
    if (currentData) {

        result = currentData.filter(function(element, index) {
            return toMMDDYYYYForComparing(new Date(element.dueDate)).getTime() >= toMMDDYYYYForComparing(fromDate) && toMMDDYYYYForComparing(new Date(element.dueDate)).getTime() <= toMMDDYYYYForComparing(toDate);
        });
    }
    return result;
}
//on delete event in the modal
$("#md-todoList").on('click', '.trash', function() {
    var index = parseInt($(this).attr("data-id"));
    if (confirm("Are you sure you would like to delete this item?")) {
        deleteItem(index);
        $('#notification').data('kendoNotification').show({ message: 'ToDo item has been deleted.' })
        rapidRefresh();
        var category = $('#md-todoList #categoryAndFilter').attr('data-category');
        var filter = $('#md-todoList #categoryAndFilter').attr('data-filter');
        if (category == "3") {
            location.reload();
        } else {
            DisplayDataInModal(true, category, filter);
        }

    }

});
//Chaneg status within the modal
$("#md-todoList").on('change', '.changeStatus', function() {
    var currentData = showData();
    var index = parseInt($(this).attr("data-id"));
    changeStatusOfAToDo(index);
    $('#notification').data('kendoNotification').show({ message: "Completion status changed" })
    rapidRefresh();
});

//search by predefined dates
function searchByPredefinedDates(currentData) {
    var result = {
        today: [],
        thisWeek: [],
        nextWeek: [],
        thisMonth: []
    };
    if (currentData) {
        result.today = currentData.filter(function(element, index) {
            return toMMDDYYYYForComparing(new Date(element.dueDate)).getTime() == toMMDDYYYYForComparing(new Date()).getTime();
        });
        result.thisWeek = currentData.filter(function(element, index) {
            var startDate = getStartAndEndDate("thisweek").start;
            var endDate = getStartAndEndDate("thisweek").end;
            return toMMDDYYYYForComparing(new Date(element.dueDate)).getTime() >= startDate && toMMDDYYYYForComparing(new Date(element.dueDate)).getTime() <= endDate;
        });
        result.nextWeek = currentData.filter(function(element, index) {

            var startDate = getStartAndEndDate("nextweek").start;
            var endDate = getStartAndEndDate("nextweek").end;
            return toMMDDYYYYForComparing(new Date(element.dueDate)).getTime() >= startDate && toMMDDYYYYForComparing(new Date(element.dueDate)).getTime() <= endDate;
        });
        result.thisMonth = currentData.filter(function(element, index) {
            var startDate = getStartAndEndDate("thismonth").start;
            var endDate = getStartAndEndDate("thismonth").end;
            return toMMDDYYYYForComparing(new Date(element.dueDate)).getTime() >= startDate && toMMDDYYYYForComparing(new Date(element.dueDate)).getTime() <= endDate;
        });

    }
    return result;
}
//based on the params, it will generate start and end date
function getStartAndEndDate(range) {
    let result = { start: new Date(), end: new Date() };
    if (range.toLowerCase() == "today") {
        result.start = toMMDDYYYYForComparing(new Date());
        result.end = toMMDDYYYYForComparing(new Date());
    }
    if (range.toLowerCase() == "thisweek") {
        var current = new Date();
        var diff = current.getDate() - current.getDay();
        result.start = toMMDDYYYYForComparing(new Date(current.setDate(diff)));
        result.end = toMMDDYYYYForComparing(new Date(current.setDate(result.start.getDate() + 6)));
    }
    if (range.toLowerCase() == "nextweek") {
        var today = new Date();
        var nextSunday = new Date(today.getFullYear(), today.getMonth(), today.getDate() + (7 - today.getDay()));
        result.start = toMMDDYYYYForComparing(nextSunday);
        result.end = toMMDDYYYYForComparing(new Date(today.setDate(result.start.getDate() + 6)));
    }
    if (range.toLowerCase() == "thismonth") {
        var date = new Date(),
            year = date.getFullYear(),
            month = date.getMonth();
        result.start = toMMDDYYYYForComparing(new Date(year, month, 1));
        result.end = toMMDDYYYYForComparing(new Date(year, month + 1, 0));
    }
    return result;
}
//search for an item by importance
function searchByImportance(currentData) {
    var result = { veryHigh: [], high: [], normal: [] };
    if (currentData) {
        result.veryHigh = currentData.filter(function(element) {
            return element.importance == VERY_HIGH_IMPORTANCE;
        });
        result.high = currentData.filter(function(element) {
            return element.importance == HIGH_IMPORTANCE;
        });
        result.normal = currentData.filter(function(element) {
            return element.importance == NORMAL_IMPORTANCE;
        });

    }
    return result;
}



/**********MODAL DONE*************** */

var categorizedItems = (function() {
    var formatItems = function(count) {
        if (count) {
            return count > 1 ? count + ' items' : '1 item';
        }
        return 'No items';
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

    var dataModel = kendo.data.Model.define({
        id: 'id',
        fields: {
            id: {
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

    var dataSources = [];
    var createFilteredDataSource = function(filterDefinition) {
        var ds = new kendo.data.DataSource({
            data: currentData.items,
            schema: { model: dataModel },
            sort: [{ field: 'dueDate', dir: 'desc' }, { field: 'name', dir: 'asc' }],
            filter: filterDefinition
        });
        dataSources.push(ds);
        return ds;
    };

    var createDataSourceByImportance = function(importanceType) {
        return createFilteredDataSource({
            field: 'importance',
            operator: 'eq',
            value: importanceType
        });
    };

    var CARET_RIGHT_CLASS = 'fa-caret-right',
        CARET_DOWN_CLASS = 'fa-caret-down';
    var toggleCaret = function($element, display) {
        $element.addClass(display ? CARET_DOWN_CLASS : CARET_RIGHT_CLASS)
            .removeClass(display ? CARET_RIGHT_CLASS : CARET_DOWN_CLASS);
    };

    var veryHigh = createDataSourceByImportance(VERY_HIGH_IMPORTANCE);
    var high = createDataSourceByImportance(HIGH_IMPORTANCE);
    var normal = createDataSourceByImportance(NORMAL_IMPORTANCE);

    var byImportance = kendo.observable({
        veryHigh: veryHigh,
        veryHighTotal: null,
        high: high,
        highTotal: null,
        normal: normal,
        normalTotal: null,
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
        today: createDataSourceByDate(today, today),
        thisWeek: createDataSourceByDate(dateUtils.dayOfWeek(today, 0, -1), dateUtils.dayOfWeek(today, 6, 1)),
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
            $.map(dataSources, function(ds) {
                ds.add(item);
            });
            byImportance.trigger('change');
            byDate.trigger('change');
        },
        removeItem: function(itemId) {
            $.map(dataSources, function(ds) {
                ds.remove(ds.get(itemId));
            });
            byImportance.trigger('change');
            byDate.trigger('change');
        }
    }
}());