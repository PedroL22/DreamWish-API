import { CronJob } from 'cron'

import { TokenService } from '~/services/token.service'

export const scheduleCleanupExpiredTokensJob = () => {
  const tokenService = new TokenService()

  new CronJob(
    '0 * * * *', // Runs at the start of every hour
    () => {
      console.log('⏳ Cleaning up expired tokens...')
      tokenService.cleanupExpiredTokens()
    }, // onTick
    null, // onComplete
    true, // start
    'America/Los_Angeles' // timeZone
  )
}
