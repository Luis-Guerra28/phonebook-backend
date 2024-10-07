const mongoose = require('mongoose')

const URL = process.env.MONGODB_URI

mongoose.set('strictQuery', false)
mongoose
  .connect(URL)
  .then(() => {
    console.log('Connecting to', URL)
  })
  .catch((error) => {
    console.log('error conecting to MongoDB', error.message)
  })

const isValidNumber = (number) => /^\d{2,3}-\d*$/.test(number)

const personSchema = new mongoose.Schema({
  name: {
    type: String,
    minLength: 3,
    required: true,
  },
  number: {
    type: String,
    minLength: 8,
    required: true,
    validate: {
      validator: isValidNumber,
    },
  },
})

personSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  },
})

module.exports = mongoose.model('Person', personSchema)
