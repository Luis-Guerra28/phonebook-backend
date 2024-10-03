const mongoose = require("mongoose");

const URL = process.env.MONGODB_URI;

mongoose.set("strictQuery", false);
mongoose
  .connect(URL)
  .then((result) => {
    console.log("Connecting to", URL);
  })
  .catch((error) => {
    console.log("error conecting to MongoDB", error.message);
  });

const personSchema = new mongoose.Schema({
  name: String,
  number: String,
});

personSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

module.exports = mongoose.model("Person", personSchema);
