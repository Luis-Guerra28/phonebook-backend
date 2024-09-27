require("dotenv").config();
const mongoose = require("mongoose");
const express = require("express");
const morgan = require("morgan");
const app = express();

app.use(express.json());
app.use(express.static("dist"));

const url = process.env.MONGODB_URI;

mongoose.set("strictQuery", false);
mongoose
  .connect(url)
  .then((result) => {
    console.log("connecting to", url);
  })
  .catch((error) => {
    console.log("error connecting to MongoDB", error.message);
  });

const personSchema = new mongoose.Schema({
  name: String,
  number: String,
});

const Person = mongoose.model("Person", personSchema);

morgan.token("content", (request, response) => {
  const data = request.body;
  return JSON.stringify({ name: data.name, number: data.number });
});

app.use(
  morgan(function (tokens, req, res) {
    return [
      tokens.method(req, res),
      tokens.url(req, res),
      tokens.status(req, res),
      tokens.res(req, res, "content-length"),
      "-",
      tokens["response-time"](req, res),
      "ms",
      tokens.content(req, res),
    ].join(" ");
  })
);

let persons = [];

app.get("/", (request, response) => {
  response.json("<h1>Phone Book is online</h1>");
});

app.get("/api/persons", (request, response) => {
  Person.find({}).then((persons) => {
    response.json(persons);
  });
});

app.get("/api/info", (request, response) => {
  response.send(`<p>Phonebook has info for ${persons.length} people</p>
    <p>${new Date()}</p>`);
});

app.get("/api/persons/:id", (request, response) => {
  const id = Number(request.params.id);
  const person = persons.find((person) => person.id === id);

  if (person) {
    response.json(person);
  } else {
    response.status(404).end();
  }
});

app.delete("/api/persons/:id", (request, response) => {
  const id = Number(request.params.id);
  persons = persons.filter((person) => person.id !== id);

  response.status(204).end();
});

const generateId = () => {
  return Math.round(Math.random() * 10000);
};

app.post("/api/persons", (request, response) => {
  const newPerson = request.body;

  if (!newPerson.name || !newPerson.number) {
    return response.status(400).json({
      error: "name or number missing",
    });
  }

  const person = new Person({
    name: newPerson.name,
    number: newPerson.number,
  });

  person.save().then((personSaved) => {
    response.json(personSaved);
  });

  //newPerson.id = generateId();
  //persons = persons.concat(newPerson);
  //response.json(newPerson);
});

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
