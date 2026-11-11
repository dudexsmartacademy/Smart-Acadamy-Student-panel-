import { studentService } from './studentService'
import type { CodingProblem } from '../types'

export const codingJudgeService = {
  getCodingProblems(): CodingProblem[] {
    return studentService.getCodingProblems()
  },
  getCodingProblem(): CodingProblem | undefined {
    return studentService.getCodingProblem()
  },
  runCode(
    code: string,
    language: string,
    _input?: string,
  ): { output: string; status: 'Passed' | 'Failed' } {
    if (!code || !code.trim()) {
      return {
        output: 'Evaluation error: Code submission cannot be empty.',
        status: 'Failed',
      }
    }
    return {
      output: `Evaluation unavailable: Remote code execution service for ${language} is not configured on the backend. Client-only sandbox cannot verify test cases.`,
      status: 'Failed',
    }
  },
}
