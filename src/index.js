const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find(user => user.username === username)

  if(!user) {
    return response.status(404).json({ error: "User not found!" })
  }

  request.user = user;

  next();
  
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;

  const userExists = users.some(user => user.username === username)

  if(userExists) {
    return response.status(400).json({ error: "User already exists!" })
  }

  const user = {
    id: uuidv4(),
    name,
    username,
    todos: []
  }

  users.push(user)

  return response.status(201).json(user)
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { username } = request.user;

  const user = users.find(user => user.username === username)

  return response.json(user.todos)
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } =  request.body;

  const newTodo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }

  user.todos.push(newTodo)

  return response.status(201).json(newTodo);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const { title, deadline } = request.body;

  const todoIndex = user.todos.findIndex(td => td.id === id);

  if (!!todoIndex) {
    return response.status(404).json({ error: "ToDo not found!" });
  }

  user.todos[todoIndex].title = title;
  user.todos[todoIndex].deadline = new Date(deadline);

  return response.json(user.todos[todoIndex]);
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const todoIndex = user.todos.findIndex(td => td.id === id);

  if (!!todoIndex) {
    return response.status(404).json({ error: "ToDo not found!" });
  }

  user.todos[todoIndex].done = true;

  return response.json(user.todos[todoIndex]);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  // const todos = user.todos.filter(todo => todo.id !== id);

  // if(todos.length === user.todos.length) {
  //   return response.status(404).json({ error: "ToDo not found!" });
  // }

  const todoExists = user.todos.some(td => td.id === id);

  if (!todoExists) {
    return response.status(404).json({ error: "ToDo not found!" });
  }

  user.todos = user.todos.filter(todo => todo.id !== id)
  
  return response.status(204).json()

});

module.exports = app;