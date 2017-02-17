/* global describe, context, it, beforeEach, afterEach */
import { expect } from 'chai'
import nock from 'nock'
import _ from 'lodash'

import { app } from '../src/index'
import mockRsvpEvent from '../../../test/mock_rsvp_event.json'
import mockRsvpResponse from '../../../test/mock_rsvps_response.json'
import mockPersonEvent from '../../../test/mock_person_event.json'

describe('rsvps', () => {
  beforeEach(() => {
    nock('https://api.meetup.com')
      .get('/webdev-phx/events/237088129/rsvps')
      .reply(200, mockRsvpResponse)
  })

  it('returns correct speech', () => {
    return app.request(mockRsvpEvent)
      .then((r) => {
        expect(r.response.outputSpeech.ssml).to.eq('<speak>4 people have r s v peed</speak>')
      })
  })
})

describe('person', () => {
  beforeEach(() => {
    nock('https://api.meetup.com')
      .get('/webdev-phx/events/237088129/rsvps')
      .reply(200, mockRsvpResponse)
  })

  context('with guest that will be there', () => {
    it('returns correct speech', () => {
      return app.request(mockPersonEvent)
        .then((r) => {
          expect(r.response.outputSpeech.ssml).to.eq('<speak>Guest 1 will be there</speak>')
        })
    })
  })

  context('with guest that will not be there', () => {
    it('returns correct speech', () => {
      const ghostData = _.set(_.cloneDeep(mockPersonEvent), 'request.intent.slots.NAME.value', 'Ghost')
      return app.request(ghostData)
        .then((r) => {
          expect(r.response.outputSpeech.ssml).to.eq('<speak>Ghost won\'t be there</speak>')
        })
    })
  })
})
