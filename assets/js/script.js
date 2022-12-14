var tasks = {};

var createTask = function(taskText, taskDate, taskList) {
  // create elements that make up a task item
  var taskLi = $("<li>").addClass("list-group-item");
  var taskSpan = $("<span>")
    .addClass("badge badge-primary badge-pill")
    .text(taskDate);

  var taskP = $("<p>")
    .addClass("m-1")
    .text(taskText);

  // append span and p element to parent li
  taskLi.append(taskSpan, taskP);

  //check due date
  auditTask(taskLi);

  // append to ul list on the page
  $("#list-" + taskList).append(taskLi);
};

var loadTasks = function() {
  tasks = JSON.parse(localStorage.getItem("tasks"));

  // if nothing in localStorage, create a new object to track all task status arrays
  if (!tasks) {
    tasks = {
      toDo: [],
      inProgress: [],
      inReview: [],
      done: []
    };
  }

  // loop over object properties
  $.each(tasks, function(list, arr) {
    // then loop over sub-array
    arr.forEach(function(task) {
      createTask(task.text, task.date, list);
    });
  });
};

var saveTasks = function() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
};



// modal was triggered
$("#task-form-modal").on("show.bs.modal", function() {
  // clear values
  $("#modalTaskDescription, #modalDueDate").val("");
});

// modal is fully visible
$("#task-form-modal").on("shown.bs.modal", function() {
  // highlight textarea
  $("#modalTaskDescription").trigger("focus");
});

// save button in modal was clicked
$("#task-form-modal .btn-save").click(function() {
  // get form values
  var taskText = $("#modalTaskDescription").val();
  var taskDate = $("#modalDueDate").val();

  if (taskText && taskDate) {
    createTask(taskText, taskDate, "toDo");

    // close modal
    $("#task-form-modal").modal("hide");

    // save in tasks array
    tasks.toDo.push({
      text: taskText,
      date: taskDate
    });

    saveTasks();
  }
});


//task text was clicked
$(".list-group").on("click", "p", function() {
  // get current text of p element
  var text = $(this)
    .text()
    .trim();

  // replace p element with a new textarea
  var textInput = $("<textarea>")
    .addClass("form-control")
    .val(text);

  $(this).replaceWith(textInput);
    // auto focus new element
  textInput.trigger("focus");

});

// editable field was un-focused
$(".list-group").on("blur", "textarea", function() {
  // get the textarea's current value/text
  var text = $(this)
  .val()
  .trim();

  //get the parent ul'd id attribute 
  var status =$(this)
  .closest(".list-group")
  .attr("id")
  .replace("list-", "");

  // get the task's position in the list of the other li elements 
  var index = $(this)
  .closest(".list-group-item")
  .index();


  tasks[status][index].text = text;
  saveTasks();

  // recreate p element
  var taskP = $("<p>")
  .addClass("m-1")
  .text(text);

  // replace textarea with p element
  $(this).replaceWith(taskP);
});

 // due date was clicked
 $(".list-group").on("click", "span", function() {
  //get current text
  var date =$(this)
  .text()
  .trim();

  //create new input element
  var dateInput  = $("<input>")
  .attr("type", "text")
  .addClass("form-control")
  .val(date);

  //swap out elements
  $(this).replaceWith(dateInput);

  //enable jquery ui datepicker
  dateInput.datepicker({
    minDate: 1,

    onClose: function() {
      //when calendar is closed, force a "change" event on the 'dateInput'
      $(this).trigger("change");
    }
  });

    // automatically bring up the calendar
    dateInput.trigger("focus");

 });



 // value of due date was changed
 $(".list-group").on("change", "input[type='text']", function() {
  // get current text 
  var date = $(this)
  .val()
  .trim();

  // get the parent ul's id attribute 
  var status = $(this)
  .closest(".list-group")
  .attr("id")
  .replace("list-", "");

  //get the task's position in the list of other li elements
  var index = $(this)
    .closest(".list-group-item")
    .index();

    // update task in array and re-save to localStorage
    tasks[status][index].date = date;
    saveTasks();

    // recreate span element with bootstrap classes
    var taskSpan = $("<span>")
      .addClass("badge badge-primary badge-pill")
      .text(date);


    // replace input with span element 
    $(this).replaceWith(taskSpan);

    // pass task's <li> element into auditTask() to check new due date 
    auditTask($(taskSpan).closest(".list-group-item"));
 });



// remove all tasks
$("#remove-tasks").on("click", function() {
  for (var key in tasks) {
    tasks[key].length = 0;
    $("#list-" + key).empty();
  }
  saveTasks();
});


$(".card .list-group").sortable({
  connectWith: $(".card .list-group"),

  scroll:false,

  tolerance: "pointer", 
  
  helper: "clone",
  activate: function(event) {
    console.log("activate", this);
    $(this).addClass("dropover");
    $(".bottom-trash").addClass("bottom-trash-drag");
  },

  deactivate: function(event) {
    console.log("deactivate", this);
    $(this).removeClass("dropover");
    $(".bottom-trash").removeClass("bottom-trash-drag");
  },

  over: function(event) {
    console.log("over", event.target);
    $(event.target).addClass("dropover-active");
  },

  out: function(event) {
    console.log("out", event.target);
    $(event.target).removeClass("dropover-active");
  },

  update: function(event) {
    //array to store the task data in
    var tempArr = [];

    //loop over current set of children in sortable list 
    $(this).children().each(function() {
      
      var text = $(this)
        .find("p")
        .text()
        .trim();

      var date = $(this)
        .find("span")
        .text()
        .trim();

      tempArr.push({
        text: text,
        date: date
      });      
    });
    console.log(tempArr);

    //trim down list's ID to match object property
    var arrName = $(this)
      .attr("id")
      .replace("list-", "");

    //update array on tasks object and save 
    tasks[arrName] = tempArr;
    saveTasks();
  }
});


$("#trash").droppable({
  accept: ".card .list-group-item",
  tolerance:"touch",

  drop: function(event, ui){
   ui.draggable.remove();
  },
  over: function(event, ui) {
    console.log(ui);
    $(".bottom-trash").addClass("bottom-trash-active");
  },

  out: function(event,ui) {
    console.log("out");
    $(".bottom-trash").removeClass("bottom-trash-active");
  }
});


$("#modalDueDate").datepicker({
  minDate: 1
});


//checks for current dates 
//checks for over duedates with coloring it red(danger)
//check if the date is imminent(see how many days awy the due date is)
var auditTask = function (taskEl) {

  //get date from task element
  var date = $(taskEl).find("span").text().trim();


  //convert to moment object at 5:00pm
  var time = moment(date, "L").set("hour", 17);

  // remove any old clases from element
  $(taskEl).removeClass("list-group-item-warning list-group-item-danger");

  // apply new class if task is near/over due date 
  if (moment().isAfter(time)) {
    $(taskEl).addClass("list-group-item-danger");
  }
  //if less than or equal to 2 days away then set the class to have a background of warning (light yellow)
  // we use moment() to get right now; we use .diff() to get the difference of right now to a day in the future, well get back a negative number
  else if (Math.abs(moment().diff(time, "days")) <= 2) {
    $(taskEl).addClass("list-group-item-warning");
  }
  console.log(taskEl)
}

setInterval(function() {
  $(".card .list-group-item").each(function(index, el) {
    auditTask(el);
  });
  // we multiply 1,000 milliseconds by 60 to convert it to 1 minute. Then we multiply that minute by 30 to get a 30-minute timer.
}, (1000 * 60) * 30);

// load tasks for the first time
loadTasks();


