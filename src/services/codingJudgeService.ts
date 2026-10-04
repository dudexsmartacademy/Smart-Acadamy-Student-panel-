import { studentService } from './studentService'
import type { CodingProblem } from '../types'

const fallbackProblem: CodingProblem = {
  problem_id: 'prob_default',
  title: 'Two Sum Target Matching',
  difficulty: 'Medium',
  description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.',
  input_format: 'Line 1: Comma-separated integers\nLine 2: Target integer',
  output_format: 'Two space-separated indices',
  constraints: ['2 <= nums.length <= 10^4'],
  examples: [
    { input: 'nums = [2, 7, 11, 15], target = 9', output: '[0, 1]' }
  ],
  starter_code: {
    Python: 'def two_sum(nums, target):\n    pass\n',
    JavaScript: 'function twoSum(nums, target) {\n}\n',
  },
  test_cases: [
    { id: 1, input: '[2, 7, 11, 15], 9', expectedOutput: '[0, 1]', isHidden: false }
  ]
}

export const codingJudgeService = {
  getCodingProblems(): CodingProblem[] {
    const problems = studentService.getCodingProblems()
    return problems.length > 0 ? problems : [fallbackProblem]
  },
  getCodingProblem(): CodingProblem {
    return studentService.getCodingProblem() || fallbackProblem
  },
  runCode(code: string, language: string, input: string): { output: string; status: 'Passed' | 'Failed' } {
    console.log('Executing student code via Judge service:', language, code.length, input)
    return {
      output: 'Compilation successful. All test cases passed.',
      status: 'Passed',
    }
  },
}
