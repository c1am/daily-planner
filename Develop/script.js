$(document).ready(function(){

    let time = moment().format("h:mm:ss");
    let timeSplit = time.split(":");
    let minuteRefresh = 59 - parseInt(timeSplit[1]);
    let secondRefresh = 60 - parseInt(timeSplit[2]);
    let timeRefresh = minuteRefresh*60 + secondRefresh;
    let secondsPassed = 0;

    let reloadTimer = setInterval(function() {
        secondsPassed++
        if (secondsPassed === timeRefresh) { 
            let isReloading = confirm("An hour has passed, let's reload the page!");
            if (isReloading) {
                window.location.reload();
            } else {
                alert("Hourly auto-refresh has turned off, please reload the page to turn it back on.");
            }
        }

    }, 1000);

});


// Elements
let timeBlockContainer = $(".container");
let currentDate = $("#currentDay");


// The current date
currentDate.text(moment().format("dddd, MMMM Do"));


// Time block array
let timeArray = ["9AM", "10AM", "11AM", "12PM", "1PM", "2PM", "3PM", "4PM", "5PM"];

for (let i=1; i<timeArray.length; i++) {

    let newTimeBlockEl = $("#9AM").clone();
    newTimeBlockEl.attr("id", timeArray[i]);
    newTimeBlockEl.children(".row").attr("style", "white-space: pre-wrap");
    newTimeBlockEl.children(".row").children(".hour").text(timeArray[i]);
    newTimeBlockEl.appendTo(".container");

}


// Show saved items
let savedItems;
let locationArray = [];

function showSavedItems() {
    savedItems = localStorage.getItem("savedItems");
    locationArray = [];
    if (savedItems === null || savedItems === "") {
        savedItems = [];
    } else {
        savedItems = JSON.parse(savedItems);
        for (i=0; i<savedItems.length; i++) {
            locationArray.push(savedItems[i].time);
        }
    }

    for (let i=0; i<locationArray.length; i++) {
        let timeBlockElId = "#" + locationArray[i]; 
        let timeBlockEl = $(timeBlockElId).children(".row").children("textarea"); 
        $(timeBlockElId).children(".row").children("button").attr("data-event", "yes");
        timeBlockEl.val(savedItems[i].event);
    }
}

showSavedItems();



// Clear local storage function
function clearLocalStorage() {
    savedItems = [];
    localStorage.setItem("savedItems", savedItems);
}


// Save event to local storage function
function saveEvent(time, input) {
    alert("Event saved.");
    savedItems.push({"time" :time, "event": input});
    localStorage.setItem("savedItems", JSON.stringify(savedItems));
}

function removeEvent(index){
    locationArray.splice([index], 1);
    savedItems.splice([index], 1);
}

function clearEvent(isClear, index, location, buttonEl){
    if (isClear) {
        alert("Event cleared.");
        removeEvent(index);
        buttonEl.attr("data-event", "none");
        localStorage.setItem("savedItems", JSON.stringify(savedItems));

    } else {
        location.val(savedItems[index].event);
        alert("Event not cleared.");
    } 
    console.log("The data-event is set to " + buttonEl.attr("data-event") + " at " + buttonEl.siblings("p").text());
}

function changeEvent(time, index, location, buttonEl, eventInput, isPopulated) {
    if (eventInput.trim() === "" && isPopulated === "yes") {
        let isSaved= confirm("Would you like to clear the event '" + savedItems[index].event + "' at " + time + "?");
        clearEvent(isSaved, index, location, buttonEl);

    } else if (eventInput.trim() !== "" && isPopulated === "none") {
        let isSaved= confirm("Would you like to add the event '" + eventInput + "' at " + time + "?");
        
        if (isSaved) {
            saveEvent(time, eventInput);

        } else {
             location.val("");
        }

    } else if (eventInput.trim() !== "" && isPopulated === "yes") {
        
        if (savedItems[index].event !== eventInput) {     
            let isSaved = confirm("Would you like to change the event from '" + savedItems[index].event+ "' to '" + eventInput + "' at " + time + "?");
            
            if (isSaved) {
                removeEvent(index);
                saveEvent(time, eventInput);
            
            } else {
                alert("Change was not saved.");
                location.val(savedItems[index].event);
            }
        }
     }
};

$(".time-block").delegate("button", "click", function(event){
    event.preventDefault();
    let isPopulated = $(this).attr("data-event");
    let eventInput = $(this).siblings("textarea").val();
    let index = locationArray.indexOf(time);
    let buttonEl = $(this);
    let location = $(this).siblings("textarea");
    let time = $(this).siblings("p").text();

    changeEvent(time, index, location, buttonEl, eventInput, isPopulated);
    showSavedItems();
});


// Get current time of day
let timeOfDay= moment().format("hA");


// Change color block to past/present/future and change based on current time of day
let allTimeBlockEl= $(".time-block");

 for (let i=0; i<allTimeBlockEl.length; i++) {
    let timeBlock= $(allTimeBlockEl[i]);
    let timeBlockId= timeBlock.attr("id");
    let timeBlockTextarea=timeBlock.children(".row").children("textarea");
    if (timeBlockId === timeOfDay){
        timeBlockTextarea.addClass("present");
    } else if (moment(timeBlockId, "hA").isBefore()) {
        timeBlockTextarea.addClass("past");
    } else if (moment(timeBlockId, "hA").isAfter()) {
        timeBlockTextarea.addClass("future");
    }
};


// Button to clear all events
$("#clear").on("click", function() {

    if(confirm("Clear all saved events?")) {
       clearLocalStorage();
       $(".time-block").find("textarea").val("");
       $(".time-block").find("button").attr("data-event", "none");

       locationArray = [];
      }
});

// Button to save all events
 $("#saveAllEvents").on("click", function() {
     for(let i=0; i < allTimeBlockEl.length; i++) {
        let timeBlock = $(allTimeBlockEl[i]);
        let buttonEl = timeBlock.children(".row").children("button");
        let time = timeBlock.attr("id");
        let location = timeBlock.children(".row").children("textarea");
        let isPopulated = buttonEl.attr("data-event");
        let eventInput = location.val();
        let index = locationArray.indexOf(time);
    
        changeEvent(time, index, location, buttonEl, eventInput, isPopulated);
        }
    showSavedItems();

    alert("There are no new changes to save.");

 });