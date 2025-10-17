/**
 * Deterministic question randomization for SOP competency tests
 * Ensures same user gets same questions on same attempt, but different on retries
 */

interface Question {
  id: string
  question: string
  options: any
  correctAnswer: string
  order: number
}

/**
 * Simple string hash function for seeding random number generator
 */
function simpleHash(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32bit integer
  }
  return Math.abs(hash)
}

/**
 * Seeded random number generator using Linear Congruential Generator (LCG)
 * Ensures consistent random sequence for same seed
 */
class SeededRandom {
  private seed: number

  constructor(seed: number) {
    this.seed = seed % 2147483647
    if (this.seed <= 0) this.seed += 2147483646
  }

  next(): number {
    this.seed = (this.seed * 16807) % 2147483647
    return (this.seed - 1) / 2147483646
  }
}

/**
 * Fisher-Yates shuffle with seeded random
 */
function seededShuffle<T>(array: T[], seed: number): T[] {
  const shuffled = [...array]
  const rng = new SeededRandom(seed)
  
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rng.next() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  
  return shuffled
}

/**
 * Select N random questions from a pool using deterministic randomization
 * Same userId + attemptNumber + testId will always return the same questions
 * 
 * @param allQuestions - Full array of questions in the test
 * @param userId - User's unique ID
 * @param attemptNumber - Attempt number (1, 2, 3, etc.)
 * @param testId - Test's unique ID
 * @param count - Number of questions to select (default: 3)
 * @returns Array of selected questions
 */
export function selectRandomQuestions(
  allQuestions: Question[],
  userId: string,
  attemptNumber: number,
  testId: string,
  count: number = 3
): Question[] {
  // Create deterministic seed from user ID + attempt + test ID
  const seedString = `${userId}-${attemptNumber}-${testId}`
  const seed = simpleHash(seedString)
  
  // Shuffle questions using seeded random
  const shuffled = seededShuffle(allQuestions, seed)
  
  // Return first N questions
  return shuffled.slice(0, count)
}

/**
 * Calculate the attempt number for a user on a specific test
 * Based on count of existing test results
 * 
 * @param existingResultsCount - Number of previous attempts
 * @returns Next attempt number (1-based)
 */
export function calculateAttemptNumber(existingResultsCount: number): number {
  return existingResultsCount + 1
}

