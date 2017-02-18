// We use a library to called alexa-app to make it much easier to
// interpret input from Alexa, and format output to send back to Alexa.
// See the documentation here: https://github.com/alexa-js/alexa-app
import alexa from 'alexa-app'
import fetch from 'node-fetch'

// Initialize the app.
export const app = new alexa.app('lwd_alexa')

// An intent is like a function. It's one action that an Alexa app can do.
app.intent(
  // This is the name of the intent.
  'rsvps',

  // If Alexa hears these phrases, this intent will run.
  { utterances: ['how many people will be at the {next |}{meetup|event}{| today}'] },

  (req, response) => {
    fetch('https://api.meetup.com/webdev-phx/events/237088129/rsvps')
      .then((resp) => resp.json())
      .then((data) => {
        const yesGuests = data.filter((g) => g.response === 'yes')
        const plusOnes = yesGuests.reduce((t, g) => t + g.guests, 0)
        const answer = `${yesGuests.length + plusOnes} people have r s v peed`

        // This is what the echo will say in response.
        response.say(answer)

        // This card will show up in the Alexa phone app.
        response.card({
          type: 'Simple',
          content: answer,
        })

        // Send response asynchronously.
        response.send()
      })

    // Return false to tell alexa-app library that this is an
    // asynchronous intent.
    return false
  },
 )

app.intent(
  'person',
  {
    // These are "variables" used by this intent.
    slots: { NAME: 'AMAZON.US_FIRST_NAME' },

    // If Alexa hears these phrases, this intent will run.
    utterances: [
      'will {-|NAME} be at the {next |}{meetup|event}{ today|}',
      'if {-|NAME} will be at the {next |}{meetup|event}{ today|}',
    ],
  },
  (req, response) => {
    const nameToLookFor = req.slot('NAME')

    // If this intent is invoked without a name, we need to
    // tell the user and send the response before we send the request.
    if (!nameToLookFor) {
      // Speak this error message out loud.
      response.say('Sorry, I did not hear a name')

      // Show a card on the Alexa app.
      response.card({
        type: 'Simple',
        content: 'Did not hear a name',
      })

      // Return now so that the rest of the function does not get evaluated.
      return
    }

    fetch('https://api.meetup.com/webdev-phx/events/237088129/rsvps')
      .then((resp) => resp.json())
      .then((data) => {
        // First, filter guests to be the ones that RSVPed "yes" on meetup.
        const yesGuests = data.filter((g) => g.response === 'yes')

        // Then, try to find a guest with the same name.
        const result = yesGuests.find((r) =>
          r.member.name.toLowerCase() === nameToLookFor.toLowerCase()
        )

        // Formulate an answer to speak and show on a card.
        let answer
        if (result) {
          answer = `${nameToLookFor} will be there`
        } else {
          answer = `${nameToLookFor} won't be there`
        }

        // Speak the answer.
        response.say(answer)

        // Show a card with the answer.
        response.card({
          type: 'Simple',
          content: answer,
        })

        // Send the response asynchronously.
        response.send()
      })

    // Return false to tell alexa-app library that this is an
    // asynchronous intent.
    return false
  },
 )

/* ########################## */
/*      some intent ideas     */
/*      do one of these or    */
/*        make your own!      */
/* ########################## */


// This intent repeats a number spoken by the user.
// "Alexa, ask learn webdev to repeat 3"
// > "You asked me to repeat 3"
// app.intent(
//   'repeater',
//   {
//     slots: { NUMBER: 'AMAZON.NUMBER' },
//     // Fill in the blank
//     // utterances: [
//       // '...',
//     // ],
//   },
//   (req, response) => {
//     // Get the number spoken by the user.
//     const number = req.slot('NUMBER')

//     // Tell Alexa to repeat the number
//   },
// )

// This intent adds two numbers spoken by the user.
// "Alexa, ask learn webdev to add 3 and 4"
// > "The sum is 7"
// app.intent(
//   'adder',
//   {
//     slots: {
//       // ...
//     },
//     // utterances: [
//       // '...',
//     // ],
//   },
//   (req, response) => {
//     // Get the numbers spoken by the user.
//
//     // Tell Alexa to speak the sum of the numbers
//   },
// )

// This intent spells a word spoken by the user.
// "Alexa, ask learn webdev how to spell cat"
// > "Cat is spelled c a t"
// Note: Lookup SSML to see how to get Alexa to spell out a word.
// app.intent(
//   'speller',
//   {
//     slots: {
//       // ...
//     },
//     utterances: [
//       // '...',
//     ],
//   },
//   (req, response) => {
//     // Get the word spoken by the user.
//
//     // Tell Alexa to spell out the word.
//   },
// )

// This intent looks up how many people have RSVPed "no" to the meetup.
// "Alexa, ask learn webdev how many people r s v peed no"
// > "3 people have r s v peed no"
// app.intent(
//   'rsvpno',
//   {
//     // utterances: [
//       // '...',
//     // ],
//   },
//   (req, response) => {
//     // Look up how many people rsvped no and have alexa speak the answer
//   },
// )
export const handler = app.lambda()
