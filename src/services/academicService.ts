import { supabase } from '../lib/supabase'

export interface AcademicCollege {
  id: string
  name: string
  code: string
  degrees: string[]
  specializations: string[] | Record<string, string[]>
  batches?: string[]
}

let cachedColleges: AcademicCollege[] = []
let fetchPromise: Promise<AcademicCollege[]> | null = null

export async function fetchColleges(force = false): Promise<AcademicCollege[]> {
  if (fetchPromise && !force) return fetchPromise

  fetchPromise = (async () => {
    try {
      // 2. Fetch live colleges and departments from Supabase
      const { data: dbColleges, error } = await supabase
        .from('colleges')
        .select('id, name, code, degrees, batches')
        .order('name', { ascending: true })

      if (error) {
        throw new Error(`Could not load colleges from Supabase: ${error.message}`)
      }

      if (dbColleges) {
        let depts: any[] = []
        try {
          const { data: dData } = await supabase
            .from('departments')
            .select('id, name, code, college_id')
          if (dData) depts = dData
        } catch {}

        let specs: any[] = []
        try {
          const { data: sData } = await supabase
            .from('specializations')
            .select('id, name, code, department_id')
          if (sData) specs = sData
        } catch {}

        const mapped: AcademicCollege[] = dbColleges.map((col) => {
          const colDepts = depts.filter((d) => d.college_id === col.id)
          const deptNames = colDepts.map((d) => d.name).filter(Boolean)

          // Gather specializations for this college's departments
          const colDeptIds = new Set(colDepts.map((d) => d.id))
          const colSpecs = specs
            .filter((s) => colDeptIds.has(s.department_id))
            .map((s) => s.name)
            .filter(Boolean)

          const allSpecializations = Array.from(new Set([...colSpecs, ...deptNames]))

          return {
            id: col.id,
            name: col.name,
            code: col.code || '',
            // Degrees and batches are configured by the admin per college (migration 053).
            degrees: Array.isArray((col as any).degrees) ? (col as any).degrees : [],
            specializations: allSpecializations,
            batches: Array.isArray((col as any).batches) ? (col as any).batches : [],
          }
        })

        cachedColleges = mapped
      }
    } catch {
      cachedColleges = []
    } finally {
      // Do not permanently cache an empty result (for example, when fetched
      // before OTP authentication while RLS hides rows from anon users).
      if (cachedColleges.length === 0) {
        fetchPromise = null
      }
    }

    return cachedColleges
  })()

  return fetchPromise
}

export function getCollegesList(): string[] {
  return cachedColleges.map((c) => c.name)
}

function findCollege(collegeName?: string): AcademicCollege | undefined {
  if (!collegeName) return undefined
  const target = collegeName.toLowerCase().trim()
  return (
    cachedColleges.find((c) => c.name.toLowerCase().trim() === target) ||
    cachedColleges.find((c) => {
      const cName = c.name.toLowerCase().trim()
      return cName.includes(target) || target.includes(cName)
    })
  )
}

// Options come only from what the administrator configured for the college.
export function getDegreesForCollege(collegeName?: string): string[] {
  const college = collegeName ? findCollege(collegeName) : undefined;
  return college && Array.isArray(college.degrees) ? college.degrees : [];
}

export function getSpecializationsForCollege(
  collegeName?: string,
  degree?: string
): string[] {
  if (!collegeName) return [];
  const college = findCollege(collegeName);
  if (!college) return [];

  if (Array.isArray(college.specializations) && college.specializations.length > 0) {
    return college.specializations;
  }

  if (college.specializations && typeof college.specializations === 'object') {
    if (degree && (college.specializations as any)[degree]?.length > 0) {
      return (college.specializations as any)[degree];
    }
    const all = new Set<string>();
    Object.values(college.specializations).forEach((list) => {
      if (Array.isArray(list)) list.forEach((item) => all.add(item));
    });
    if (all.size > 0) return Array.from(all);
  }

  return [];
}

export function getBatchesList(collegeName?: string): string[] {
  if (collegeName) {
    const college = findCollege(collegeName)
    return college?.batches || []
  }
  return []
}

export function validateAcademicSelection(
  collegeName: string,
  degree: string,
  specialization: string
): { valid: boolean; reason?: string } {
  if (!collegeName.trim()) {
    return { valid: false, reason: 'Please select a valid college.' }
  }

  const college = findCollege(collegeName)
  if (!college) {
    return {
      valid: false,
      reason: 'Selected college is not registered in the academy administration.',
    }
  }

  const validDegrees = getDegreesForCollege(college.name)
  if (
    !validDegrees.some(
      (d) => d.toLowerCase().trim() === degree.toLowerCase().trim()
    )
  ) {
    return {
      valid: false,
      reason: `Degree "${degree}" is not available for ${college.name}. Available degrees: ${validDegrees.join(', ')}`,
    }
  }

  const validSpecs = getSpecializationsForCollege(college.name, degree)
  if (
    !validSpecs.some(
      (s) => s.toLowerCase().trim() === specialization.toLowerCase().trim()
    )
  ) {
    return {
      valid: false,
      reason: `Specialization "${specialization}" is not available for ${degree} at ${college.name}. Available: ${validSpecs.join(', ')}`,
    }
  }

  return { valid: true }
}
