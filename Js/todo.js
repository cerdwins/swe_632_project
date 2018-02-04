$(document).ready(function() {
    // create Calendar from div HTML element
    $("#mainCalendar").kendoCalendar();
    $("#fromDate").kendoDatePicker({

        // display month and year in the input
        format: "MMMM yyyy",
    });
    $("#toDate").kendoDatePicker({

        // display month and year in the input
        format: "MMMM yyyy",
    });
});