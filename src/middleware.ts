/*
 * adonisjs-log-http
 *
 * (c) AKAGO SAS <po@akago.fr>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import type { HttpContext } from '@adonisjs/core/http'
import app from '@adonisjs/core/services/app'
import logger from '@adonisjs/core/services/logger'
import kleur from 'kleur'
import _ from 'lodash'
import { hrtime } from 'node:process'
import { LogHTTPConfig } from './define_config.js'

export default class LogHTTP {
  public async handle({ request, response }: HttpContext, next: () => Promise<void>) {
    const config = app.config.get<LogHTTPConfig>('log_http', {})

    const path = request.url()
    const excludePath = (config.excludedPaths ?? []).includes(path)
    const excludeRequest = config.excludedRequest ? await config.excludedRequest(request) : false
    const skip = excludePath || excludeRequest || config.enabled === false

    const startTime = hrtime.bigint()
    if (!skip)
      logger.info(
        `${kleur.bold().green('<')} [${kleur.bold(request.method())}] ${kleur.white(request.url())}`
      )

    await next()

    const duration = (hrtime.bigint() - startTime) / 1000000n
    const durationNumber = Math.floor(Number(duration))
    response.header('x-duration-ms', durationNumber)

    if (!skip) {
      const query = _.isEmpty(request.qs())
        ? ''
        : '?' +
          _(request.qs())
            .map((v, k) => `${k}=${v}`)
            .join('&')
      logger.info(
        `${kleur.bold().blue('>')} [${kleur.bold(request.method())}] ${kleur.white(request.url())}${kleur.grey(query)} ${kleur.bold(response.response.statusCode)} ${duration}ms`
      )
    }
  }
}
