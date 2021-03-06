$(document).ready(function() {

    $('#notification').kendoNotification({
        position: {
            top: 30
        },
        autoHideAfter: 2000,
        templates: [{
            type: 'info',
            template: $('#notification-template').html()
        }],
        height: 50
    });

    var currentData = showData();
    var dates = null;
    if (currentData && currentData.items) {
        dates = getDatesForCalendar(currentData.items);
    }
    var popupTemplate = kendo.template('<div class="todo-toolTip">There #= numItems != 1 ? "are" : "is" # #= numItems > 0 ? numItems : "no" # ' +
        'ToDo #= numItems != 1 ? "items" : "item" # due on #= date #</div>' +
        '<div  class="todo-toolTip">Double-click to view</div>');
    // create Calendar from div HTML element
    $("#mainCalendar").kendoCalendar({
        value: kendo.date.today(),
        format: "MM/dd/yyyy",
        //When calendar value changes, change the dates as well
        change: function() {
            var dateSelected = toMMDDYYYY(this.value());
            displayCalendarValue(dateSelected);
            $('#create-todo-item-form').change();
        },
        navigate: function() {
            $(".k-month td").off('dblclick').dblclick(function() {
                displayDataInModal(false, "4", "custom");
            });
        },
        month: {
            content: '<div class="#= $.inArray(data.date.getTime(), data.dates) > -1 ? "badge badge-info badge-pill" : "" #">#= data.value #</div>'
        },
        dates: dates
    }).kendoTooltip({
        filter: 'td',
        width: 200,
        height: 50,
        position: 'top',
        showAfter: 500,
        content: function(e) {
            var dateString = $(e.target).find('.k-link').data().value;
            var dateParts = dateString.split('/');
            var date = new Date(parseInt(dateParts[0]), parseInt(dateParts[1]), parseInt(dateParts[2]));
            var currentData = showData();
            var itemsOnDate = searchBetweenDates(currentData.items, date, date).filter(function(item) {
                return !item.isCompleted;
            });
            return popupTemplate({ numItems: itemsOnDate.length, date: kendo.toString(date, 'M/d/yyyy') });
        }
    });

    $("#toDate, #fromDate").kendoDatePicker({
        // display month and year in the input
        format: "MM/dd/yyyy",
        change: filterModal
    }).kendoMaskedTextBox({ mask: '00/00/0000' });

    $("#todoDueDate").kendoDatePicker({
        // display month and year in the input
        format: "MM/dd/yyyy",
        change: function() {
            if (this.value()) {
                calendar.value(this.value());
            }
        }
    }).kendoMaskedTextBox({ mask: '00/00/0000' });
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
        var $nameInput = $('#simple-input');
        var $dateInput = $('#todoDueDate');
        var name = $nameInput.val();
        var date = $dateInput.data('kendoDatePicker').value();
        var importance = formData[0].value;
        var validated = true;
        if (!name) {
            notifyError('ToDo Name must be specified.');
            $nameInput.addClass('invalid-input');
            validated = false;
        } else {
            $nameInput.removeClass('invalid-input');
        }
        if (!date) {
            notifyError('Please enter a valid date or select a date from the calendar.');
            $dateInput.closest('.k-picker-wrap').addClass('invalid-input');
            validated = false;
        } else {
            $dateInput.closest('.k-picker-wrap').removeClass('invalid-input');
        }
        if (validated) {
            addToDoList(name, dueDate, importance, false);
            //reload the entire page
            $('#createdAlert').removeClass('hide').addClass('show');
            rapidRefresh();
            notify('Your ToDo item has been added');
            $('#create-todo-item-form').change();
        }

    });

    $('#simple-input').change(function() {
        var $input = $(this);
        if ($input.is('.invalid-input')) {
            if ($input.val()) {
                $input.removeClass('invalid-input');
            }
        }
    });

    $('[name=importance-filter]').change(filterModal);
    $('#text-filter').on('keyup', filterModal);

    $('#toggle-filters-btn').click(function() {
        var toggleOff = $(this).val() === 'on';
        toggleFilters(!toggleOff);
    });

    $('#clear-filters-btn').click(function() {
        clearFilters();
        var currentData = showData();
        if (currentData && currentData.items) {
            clearFilters();
            bindDataToModal(currentData.items, false);
        }
    });

    $('#search_area').click(function() {
        var currentData = showData();
        if (currentData && currentData.items) {
            clearFilters();
            bindDataToModal(currentData.items, false);
            $('#toDoModal').modal('show');
        } else {
            notify('No ToDo items have been create yet.');
        }
    });

    //When users click on the items on the left panel
    $('.category').on('click', '.openModal', function() {
        var data = $(this).data();
        displayDataInModal(false, data.category, data.filter);
    });

    $('#todoModal').on('hidden.bs.modal', function() {
        $('#md-todoList ul.list-group').empty();
    });

    var isData = showData();
    if (isData == null || isData.index == undefined || isData.index == 0) {
        showTutorial();
    }

    $('#create-todo-item-form').on('change keyup', function() {
        var arrowRightClass = 'fa-arrow-right',
            checkClass = 'fa-check';
        var todoName = $('#simple-input').val();
        var dueDate = $('#todoDueDate').data().kendoDatePicker.value();
        if (!todoName) {
            $('#simple-input-icon').removeClass(checkClass).addClass(arrowRightClass);
        } else {
            $('#simple-input-icon').removeClass(arrowRightClass).addClass(checkClass);
        }
        if (!dueDate) {
            $('#due-date-icon').removeClass(checkClass).addClass(arrowRightClass);
        } else {
            $('#due-date-icon').removeClass(arrowRightClass).addClass(checkClass);
        }
        if (!(todoName && dueDate)) {
            $('#create-todo-item-icon').removeClass(checkClass).addClass(arrowRightClass);
            $('#create-todo-item').prop('disabled', true);
        } else {
            $('#create-todo-item-icon').removeClass(arrowRightClass).addClass(checkClass);
            $('#create-todo-item').prop('disabled', false);
        }
    }).change();

    rapidRefresh();
});

function toggleFilters(filtersOn) {
    var $button = $('#toggle-filters-btn');
    if (filtersOn) {
        $('#modal-filters').show(200);
        $button.val('on');
    } else {
        $('#modal-filters').hide(200);
        $button.val('off');
    }
    $('#toggle-filters-btn').text(filtersOn ? 'Hide Filters' : 'Show Filters');
}

function clearFilters() {
    $('[name=importance-filter]').prop('checked', false);
    $('#text-filter').val('');
    $('#fromDate').data('kendoDatePicker').value(null);
    $('#toDate').data('kendoDatePicker').value(null);
}

function filterModal(isModalRefresh) {
    isModalRefresh = typeof isModalRefresh === 'undefined' ? false : isModalRefresh;
    toggleFilters(true);
    var currentData = showData();
    if (currentData.items) {
        var filteredItems = currentData.items;
        var importanceFilters = [];
        $('[name=importance-filter]').map(function() {
            var $this = $(this);
            if ($this.prop('checked')) {
                importanceFilters.push($this.val());
            }
        });
        if (importanceFilters.length) {
            filteredItems = filterByImportance(importanceFilters, filteredItems);
        }
        var textFilter = $('#text-filter').val();
        if (textFilter) {
            filteredItems = filterByText(textFilter, filteredItems);
        }
        var fromDate = $('#fromDate').data('kendoDatePicker').value(),
            toDate = $('#toDate').data('kendoDatePicker').value();
        if (fromDate && toDate) {
            filteredItems = searchBetweenDates(filteredItems, fromDate, toDate);
        }
        bindDataToModal(filteredItems, isModalRefresh);
    }

    $('#toDoModal').on('hidden.bs.modal', clearFilters);
}

var VERY_HIGH_IMPORTANCE = 'Very High',
    HIGH_IMPORTANCE = 'High',
    NORMAL_IMPORTANCE = 'Normal';

var importanceClass = {};
importanceClass[VERY_HIGH_IMPORTANCE] = "veryHighList";
importanceClass[HIGH_IMPORTANCE] = "highList";
importanceClass[NORMAL_IMPORTANCE] = "normalList";

var searchCategory = {
    BY_IMPORTANCE: '1',
    BY_DATE: '2',
    SEARCH: '3',
    BY_CAL: '4'
};

var dateCategory = {
    TODAY: "today",
    THIS_WEEK: 'thisweek',
    NEXT_WEEK: 'nextweek',
    THIS_MONTH: 'thismonth'
};

var searchType = {
    DAY: 'day',
    MONTH: 'month',
    CUSTOM: 'custom'
};


function getDatesForCalendar(currentData) {
    currentData = currentData || [];
    var dates = currentData.filter(function(item) {
        return !item.isCompleted;
    }).map(function(item) {
        return new Date(item.dueDate).getTime();
    });
    return dates;
}

//updates and refreshes the todo list
function rapidRefresh() {
    var currentData = showData();
    emptyToDoList();
    showToDoList(currentData);
    updateToDoCounts(currentData);
    initialLateStateVariables(); //intializes the variables that are only now available
    var calendar = $("#mainCalendar").data().kendoCalendar;
    calendar.setOptions({ dates: getDatesForCalendar(currentData.items) });
}

//moves something to the completed bin or the uncompleted bin
function initialLateStateVariables() {
    $(".form-check-input").off('change').change(function() {
        var id = $(this).data("internalid");
        changeStatusOfAToDo(id);
        rapidRefresh();
    });
    $("#display-section").off('click').on('click', '.trash', function() {
        var id = $(this).data().id;
        deleteItem(id);
    });
}

function deleteItem(id) {
    var item = findToDoItemById(parseInt(id));
    if (confirm('Are you sure you would like to delete this item? "' + item.name + '"')) {
        deleteItemFromStorage(id);
        notify('ToDo item has been deleted.');
        rapidRefresh();
    }
}

//updates the counts above the ToDo list
function updateToDoCounts(data) {
    if (data != null) {
        updateTotalTODO(data.items.length)
        var completedData = data.items.filter(element => element.isCompleted);
        document.getElementById("completed-badge").innerText = completedData.length;
        document.getElementById("uncompleted-badge").innerText = data.items.length - completedData.length;
        document.getElementById("all-todos-badge").innerText = data.items.length;
    } else {
        document.getElementById("completed-badge").innerText = 0;
        document.getElementById("uncompleted-badge").innerText = 0;
        document.getElementById("all-todos-badge").innerText = 0;
    }
}


//empties the ToDo List
function emptyToDoList() {
    $("#notCompletedList").empty();
    $("#completedList").empty();
}


//Creates the lists in the "Most Recent Todo Items" area
function showToDoList(currentData) {
    if (currentData && currentData.items) {
        var $completedList = $("#completedList");
        var $notCompletedList = $("#notCompletedList");
        var $allToDosList = $("#allToDosList");
        for (i = 0; i < currentData.items.length; i++) {
            var item = currentData.items[i];
            var html = itemTemplate(item);
            if (item.isCompleted) {
                $completedList.append(html);
            } else {
                $notCompletedList.append(html);
            }
            $allToDosList.append(html);
        }
    }
}

//to Display the value of the calendar on the text
function displayCalendarValue(val) {
    $('#todoDueDate').data('kendoDatePicker').value(val);
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

function findToDoItemById(id) {
    var data = showData();
    if (data && data.items) {
        return data.items.find(function(item) {
            return item.id === id;
        });
    }
    return null;
}

//Display all the data
function showData() {
    return getDataFromLocalStorage() || {};
}

//change from completedToNotCompletedAndViceVersa
function changeStatusOfAToDo(id) {
    var i, len;
    //Search for the items
    var currentData = showData();
    //Check to see if there is any item in the storage
    if (currentData && currentData.items.length > 0) {
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

        notify('Please wait...refreshing data');
        localStorage.clear();
        location.reload();
    }

});

//Delete item from the storage
function deleteItemFromStorage(id) {
    if (id) {
        var currentData = showData();
        if (currentData) {
            if (currentData.items.length == 1) {
                localStorage.clear();
            } else {
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

function notify(message) {
    $('#notification').data('kendoNotification').show({ message: message });
}

function notifyError(message) {
    $('#notification').data('kendoNotification').error(message);
}

var searchActions = {};
searchActions[searchCategory.BY_IMPORTANCE] = function(items, filter) {
    switch (filter) {
        case "veryhigh":
            $('[name=importance-filter][value="Very High"]').prop('checked', true);
            break;
        case "high":
            $('[name=importance-filter][value="High"]').prop('checked', true);
            break;
        case "normal":
            $('[name=importance-filter][value="Normal"]').prop('checked', true);
            break;
        default:
            alert("no filter found");
            break;
    }
};

searchActions[searchCategory.BY_DATE] = function(items, filter) {
    //this is for predefined dates
    var dateUtils = kendo.date;
    var fromDate, toDate, today = dateUtils.today();
    switch (filter) {
        case dateCategory.TODAY:
            fromDate = toDate = today;
            break;
        case dateCategory.THIS_WEEK:
            fromDate = dateUtils.dayOfWeek(today, 0, -1);
            toDate = dateUtils.dayOfWeek(today, 6, 1);
            break;
        case dateCategory.NEXT_WEEK:
            var nextSunday = dateUtils.addDays(today, 7 - today.getDay());
            fromDate = nextSunday;
            toDate = dateUtils.dayOfWeek(nextSunday, 6, 1);
            break;
        case dateCategory.THIS_MONTH:
            fromDate = dateUtils.firstDayOfMonth(today);
            toDate = dateUtils.lastDayOfMonth(today);
            break;
        default:
            alert("no filter found");
            break;
    }
    $('#fromDate').data('kendoDatePicker').value(fromDate);
    $('#toDate').data('kendoDatePicker').value(toDate);
};

searchActions[searchCategory.SEARCH] = function(items, filter) {
    var dateUtils = kendo.date;
    var fromDate, toDate;
    var calendar = $("#mainCalendar").data('kendoCalendar');
    switch (filter) {
        case searchType.DAY:
            fromDate = toDate = calendar.value();
            break;
        case searchType.MONTH:
            var selectedDate = calendar.current();
            fromDate = dateUtils.firstDayOfMonth(selectedDate);
            toDate = dateUtils.lastDayOfMonth(selectedDate);
            break;
        case searchType.CUSTOM:
            var selectedDate = calendar.current();
            fromDate = dateUtils.firstDayOfMonth(selectedDate);
            toDate = dateUtils.lastDayOfMonth(selectedDate);
            break;
    }

    $('#fromDate').data('kendoDatePicker').value(fromDate);
    $('#toDate').data('kendoDatePicker').value(toDate);
};


searchActions[searchCategory.BY_CAL] = function() {
    var date = $("#mainCalendar").data('kendoCalendar').value();
    $('#fromDate').data('kendoDatePicker').value(date);
    $('#toDate').data('kendoDatePicker').value(date);

};

//***********BOOTSTRAP MODAL AND THEIR OPERATIONS************ */
function displayDataInModal(isModalRefresh, category, filter) {
    var currentData = showData();
    if (currentData) {
        var action = searchActions[category];
        if (action) {
            action(currentData.items, filter);
            filterModal();
        } else {
            bindDataToModal(currentData.items, isModalRefresh);
        }
    } else {
        if (isModalRefresh) {
            $('#toDoModal').modal('hide');
        } else {
            notify("No ToDo items have been created yet.");
        }
    }
}

var itemTemplate = kendo.template(
    '<li class="list-group-item #= importanceClass[importance] #">' +
    '     <label class="form-check-label main #= isCompleted ? "completed-item" : "" #">' +
    '         <input data-internalid="#= id #" data-completed="#= isCompleted #" type="checkbox" ' +
    '             class="form-check-input changeStatus" value="#= importance #" #= isCompleted ? "checked" : "" #>' +
    '           #= name #<span class="checkmark" title="Click to mark ToDo item as #= isCompleted ? "not completed" : "completed" #"></span>' +
    '     </label>' +
    '     <i data-id="#= id #" class="fa fa-trash float-right trash" title="Click to delete ToDo item">' +
    '     </i><p class="small-text">Due Date: #= kendo.toString(new Date(dueDate), "MM/dd/yyyy") #</p>' +
    '</li>');

//this will create a modal and bind the incoming data to it
function bindDataToModal(data, isModalRefresh) {
    $('#md-todoList ul.list-group').empty();
    if (data.length) {
        $('#todo-item-list-row').show();
        $('#no-data-message-row').hide();
        //populate the recent data
        $.each(data, function(index, value) {
            $('#md-todoList ul.list-group').append(itemTemplate(value));
        });
    } else {
        $('#todo-item-list-row').hide();
        $('#no-data-message-row').show();
    }
    if (!isModalRefresh) {
        $('#toDoModal').modal('show');
    }

    $("#md-todoList").off('click').on('click', '.trash', function() {
        var id = parseInt($(this).attr("data-id"));
        deleteItem(id);
        filterModal();
    });
}

//search between dates
function searchBetweenDates(currentData, fromDate, toDate) {
    var result = [];
    if (currentData) {
        result = currentData.filter(function(element, index) {
            return kendo.date.isInDateRange(new Date(element.dueDate), fromDate, toDate);
        });
    }
    return result;
}

//Change status within the modal
$("#md-todoList").on('change', '.changeStatus', function() {
    var index = parseInt($(this).attr("data-internalid"));
    changeStatusOfAToDo(index);
    notify("Completion status changed");
    rapidRefresh();
});

function filterByText(text, items) {
    text = text.toLowerCase();
    return items.filter(function(element) {
        return element.name.toLowerCase().indexOf(text) > -1;
    });
}

function filterByImportance(importanceTypes, items) {
    return items.filter(function(element) {
        return importanceTypes.indexOf(element.importance) > -1;
    });
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

    var ToDoItemModel = kendo.data.Model.define({
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
            schema: { model: ToDoItemModel },
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


//updates the total number of todo items 
function updateTotalTODO(total) {
    $("span.totalTodos").text(total);
}

//displays a short tutorial
function showTutorial() {
    $("#overlay").css("visibility", "visible");
    $("#overlay").one("click", function() {
        displaySlide1();
    })
}


//displays the first tutorial slide
function displaySlide1() {
    $("#overlay div").css("right", "0");
    $("#overlay div").css("bottom", "0");
    $("#overlay div").css("position", "absolute");
    $("#tutorialdata").html("<h5 class='card-header'>How to create TODO?</h5><br/><br/>Use the highlighted area to input new data into the ToDo List. <br/>1)You will need to enter a date <br/>" +
        "2)Enter the ToDo item's name <br/>3)Select the Importance <br/>4)Press the Create ToDo Item button <br/><br/>")
    $("#createArea").css("z-index", "5");
    $("#createArea").css("background-color", "white");
    $("body").one("click", function() {
        $("body").one("click", function() {
            $("#createArea").css("z-index", "0");
            displaySlide2();
        });
    });
}

//displays slide 2
function displaySlide2() {
    $("#overlay div").css("left", "0");
    $("#overlay div").css("bottom", "0");
    $("#tutorialdata").html("<h5 class='card-header'>Select dates on calendar</h5><br/><br/>Click a date on the Calendar one time to select date for Step 1.  <br/>Click two times to search for any ToDo items on a given day. <br/><br/>");
    $("#upper-section").css("z-index", "5");
    $("#upper-section").css("background-color", "white");
    $("body").one("click", function() {
        $("#upper-section").css("z-index", "");
        displaySlide3();
    });
}

function displaySlide3() {
    $("#tutorialdata").html("<h5 class='card-header'>Searching for todo</h5><br/><br/>To search for items use the highlighted area or to perform a master search, click on the search link.  You can search based on date or importance.<br/><br/>");
    $("#searchArea").css("z-index", "5");
    $("#searchArea").css("background-color", "white");
    $("body").one("click", function() {
        $("#searchArea").css("z-index", "0");
        $("#overlay").css("visibility", "hidden");
    });
}