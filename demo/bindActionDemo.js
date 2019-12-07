function addTodo(text) {
  return {
    type: 'ADD_TODO',
    text
  };
}

function removeTodo(id) {
  return {
    type: 'REMOVE_TODO',
    id
  };
}
