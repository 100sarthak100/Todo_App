let todos = [];

const dateElement = document.getElementById("date");

// Show todays date
const options = {weekday : "long", month:"short", day:"numeric"};
const today = new Date();

dateElement.innerHTML = today.toLocaleDateString("en-US", options);

const filters = {
  searchText: "",
  hideCompleted: false,
};

$(".search-todo").on("input", () => {
  //console.log($('.search-todo').val());
  filters.searchText = $(".search-todo").val();
  createList(todos, filters);
});

const renderTodos = function () {
  db.collection("todos")
    .get()
    .then((data) => {
      //console.log(data.docs[0].data());
      data.docs.forEach((element) => {
        //console.log(elemnt.data());
        const singleTodo = element.data();
        todos.push(singleTodo);
      });
      createList(todos, filters);
    });
};

// displaying todos in browser
const createList = function (todos) {
  let count = 0;
  const filteredTodos = $.grep(todos, (element) => {
    return element.name
      .toLowerCase()
      .includes(filters.searchText.toLowerCase());
  });
  $(".todos").empty();
  filteredTodos.forEach((element) => {
    let divElement = $('<div class="form-check card singleTodo" style="opacity: 0.4;">');
    let buttonElement = $('<button class="btn btn-danger float-right btn-sm">');
    let labelElement = $('<label class="form-check-label">');
    let checkboxElement = $('<input type="checkbox" class="form-check-input" style="width: 20px; height: 20px;vertical-align: middle;position: relative;bottom: 1px;"/>');
    let cardBodyElement = $('<div class="card-body">')
    buttonElement.text("Delete");
    buttonElement.on("click", () => {
      //console.log("event triggered", element);
      deleteTodo(element);
    });
    checkboxElement.attr('checked', element.isCompleted);
    checkboxElement.on('change', () => {
      toggleTodo(element);
    })
    labelElement.append(checkboxElement);
    labelElement.append('<span style="font-size: 150%;font-weight:700;color:black;padding-left: 0.6em;vertical-align: middle;">' + element.name + "</span>");
    cardBodyElement.append(labelElement);
    cardBodyElement.append(buttonElement);
    divElement.append(cardBodyElement);
    $(".todos").append(divElement);
    if(element.isCompleted == false){
      count++;
    }
  });
  $('.status').text("You have " + count + " todos left");
};

const toggleTodo = function(element){
  const new_todo = {
    id: element.id,
    isCompleted: !element.isCompleted,
    name: element.name
  }
  db.collection('todos').doc(element.id).update(new_todo).then(() => {
    console.log("updated successfully");
    element.isCompleted = !element.isCompleted;
    createList(todos, filters);
  }).catch(error=>{
    console.log("error occured", error);
  })
}

const deleteTodo = function (element) {
  // then is used then it is async
  db.collection("todos").doc(element.id).delete().then(() => {
      console.log("todo deleted successfully");
      const todoIndex = todos.findIndex((todo) => todo.id === element.id);
      if (todoIndex != -1) {
        todos.splice(todoIndex, 1);
        createList(todos, filters);
      }
    });
};

$(".submit-todo").click((event) => {
  event.preventDefault();
  const id = uuidv4();
  const todo = {
    name: $(".new-todo").val(),
    isCompleted: false,
    id: id,
  };
  db.collection("todos")
    .doc(id)
    .set(todo)
    .then(() => {
      console.log("todo added successfully");
      $(".new-todo").val("");
      todos.push(todo);
      createList(todos, filters);
    }).catch((error) => {
      console.log("error occured", e);
    });
});

$('.hideCompleted').change(() => {
  if($('.hideCompleted').prop('checked')){
    hideCompleted(todos, filters);
  }
  else{
    createList(todos, filters);
  }
})

const hideCompleted = function(todos, filters){
  const filteredTodos =  $.grep(todos, (element) => {
    if(element.isCompleted == filters.hideCompleted){
      return element;
    }
  })
  createList(filteredTodos, filters);
}

renderTodos();
