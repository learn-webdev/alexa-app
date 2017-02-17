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
      'will {-|NAME} be at the {next |}{meetup|event}',
      'if {-|NAME} will be at the {next |}{meetup|event}',
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

export const handler = app.lambda()
