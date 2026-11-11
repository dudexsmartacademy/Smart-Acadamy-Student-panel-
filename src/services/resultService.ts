import { studentService } from './studentService'
import type { ResultRecord } from '../types'

export const resultService = {
  getResults(): ResultRecord[] {
    return studentService.getResults()
  },
}
