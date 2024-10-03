require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const app = express();
const Person = require("./models/person");

app.use(express.json());
app.use(express.static("dist"));

const errorHandler = (error, request, response, next) => {
  console.log(error.message);

  if (error.name === "CastError") {
    return response.status(400).send({ error: "malformatted id" });
  }

  next(error);
};

const unknowEndPoint = (request, response) => {
  response.status(404).send({ error: "unknow endpoint" });
};

morgan.token("content", (request, response) => {
  const data = request.body;
  return JSON.stringify(data);
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

app.get("/", (request, response) => {
  response.json("<h1>Phone Book is online</h1>");
});

app.get("/api/info", (request, response) => {
  response.send(`<p>Phonebook has info for ${persons.length} people</p>
    <p>${new Date()}</p>`);
});

app.get("/api/persons", (request, response) => {
  Person.find({}).then((persons) => {
    response.json(persons);
  });
});

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
});

app.get("/api/persons/:id", (request, response) => {
  Person.findById(request.params.id)
    .then((person) => {
      if (person) {
        response.json(person);
      } else {
        response.status(404).end();
      }
    })
    .catch((error) => next(error));
});

app.delete("/api/persons/:id", (request, response, next) => {
  Person.findByIdAndDelete(request.params.id)
    .then((result) => {
      response.status(204).end();
    })
    .catch((error) => next(error));
});

app.use(unknowEndPoint);
app.use(errorHandler);

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
