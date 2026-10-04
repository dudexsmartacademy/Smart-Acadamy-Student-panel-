import { studentService } from './studentService'
import type { Assessment, McqQuestion } from '../types'

export const mcqAssessmentService = {
  getAssessments(): Assessment[] {
    return studentService.getAssessments()
  },
  getAssessmentById(id: string): Assessment | undefined {
    return studentService.getAssessmentById(id)
  },
  getMcqQuestions(): McqQuestion[] {
    return studentService.getMcqQuestions()
  },
}
