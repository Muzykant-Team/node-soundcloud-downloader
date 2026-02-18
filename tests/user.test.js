/**
 * @jest-environment node
 */

import scdl from '..'


const describeIntegration = process.env.RUN_INTEGRATION_TESTS === 'true' ? describe : describe.skip
describeIntegration('getUser()', () => {
  const profileURL = 'https://soundcloud.com/uiceheidd'

  it('returns a valid user response', async () => {
    try {
      const user = await scdl.getUser(profileURL)

      expect(user).toBeDefined()
      expect(user.kind).toEqual('user')
      
    } catch (err) {
      console.error(err)
      throw err
    }
  })
})
