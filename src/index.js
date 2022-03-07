const express = require("express");
const cors = require("cors");

const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

const checksExistsUserAccount = (request, response, next) => {
  const { username } = request.headers;

  const user = users.find((user) => user.username === username);

  if (!user) {
    return response.status(404).json({
      error: "User not found",
    });
  }

  request.user = user;

  return next();
};

app.post("/users", (request, response) => {
  const { name, username } = request.body;

  const userAlreadyExists = users.some((user) => user.username === username);

  if (userAlreadyExists) {
    return response.status(400).json({
      error: "Username is already in use, please, choose another one.",
    });
  }

  const user = {
    id: uuidv4(),
    name,
    username,
    todos: [],
  };

  try {
    users.push(user);
  } catch (error) {
    return response.status(400).send({ error });
  }

  return response.status(201).json(user);
});

app.get("/todos", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  return response.json(user.todos);
});

app.post("/todos", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;

  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  };

  try {
    user.todos.push(todo);
  } catch (error) {
    return response.status(400).json({
      error,
    });
  }

  return response.status(201).json(todo);
});

app.put("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;
  const { title, deadline } = request.body;

  const userTodo = user.todos.find((todo) => todo.id === id);

  if (!userTodo) {
    return response.status(404).json({ error: "Todo not found" });
  }

  try {
    (userTodo.title = title), (userTodo.deadline = new Date(deadline));
  } catch (error) {
    return response.status(400).send(error);
  }

  return response.status(201).json(userTodo);
});

app.patch("/todos/:id/done", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const userTodo = user.todos.find((todo) => todo.id === id);

  if (!userTodo) {
    return response.status(404).json({ error: "Todo not found" });
  }

  try {
    userTodo.done = true;
  } catch (error) {
    return response.status(400).send(error);
  }

  return response.status(201).json(userTodo);
});

app.patch("/todos/:id/undone", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const userTodo = user.todos.find((todo) => todo.id === id);

  if (!userTodo) {
    return response.status(404).json({ error: "Todo not found" });
  }

  try {
    userTodo.done = false;
  } catch (error) {
    return response.status(400).send(error);
  }

  return response.status(201).json(userTodo);
});

app.delete("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const userTodo = user.todos.find((todo) => todo.id === id);

  if (!userTodo) {
    return response.status(404).json({ error: "Todo not found" });
  }

  try {
    user.todos = user.todos.filter((todo) => todo.id !== id);
  } catch (error) {
    return response.status(400).send(error);
  }

  return response.status(204).json(user.todos);
});

module.exports = app;
