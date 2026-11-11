import { studentService } from './studentService'

export const classService = {
  getClasses() {
    return studentService.getLiveClasses()
  },
}
