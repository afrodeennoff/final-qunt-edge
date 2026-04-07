import { describe, it, expect } from 'vitest'
import {
  PASSWORD_MIN_LENGTH,
  PASSWORD_REGEX,
  validatePasswordStrength,
  getPasswordRequirements,
} from '@/lib/security/password-validation'

describe('password-validation', () => {
  describe('PASSWORD_MIN_LENGTH', () => {
    it('should be 8', () => {
      expect(PASSWORD_MIN_LENGTH).toBe(8)
    })
  })

  describe('PASSWORD_REGEX', () => {
    it('should reject strings without uppercase', () => {
      expect(PASSWORD_REGEX.test('abcdefgh1')).toBe(false)
    })
    it('should reject strings without lowercase', () => {
      expect(PASSWORD_REGEX.test('ABCDEFGH1')).toBe(false)
    })
    it('should reject strings without digit', () => {
      expect(PASSWORD_REGEX.test('Abcdefgh')).toBe(false)
    })
    it('should accept valid passwords', () => {
      expect(PASSWORD_REGEX.test('Abcdefgh1')).toBe(true)
    })
  })

  describe('validatePasswordStrength', () => {
    it('should return errors for too-short password', () => {
      const result = validatePasswordStrength('Ab1')
      expect(result.valid).toBe(false)
      expect(result.errors).toContain(`Password must be at least ${PASSWORD_MIN_LENGTH} characters long`)
    })
    it('should return errors for missing uppercase', () => {
      const result = validatePasswordStrength('abcdefgh1')
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Password must contain at least one uppercase letter')
    })
    it('should return errors for missing lowercase', () => {
      const result = validatePasswordStrength('ABCDEFGH1')
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Password must contain at least one lowercase letter')
    })
    it('should return errors for missing digit', () => {
      const result = validatePasswordStrength('Abcdefgh')
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Password must contain at least one digit')
    })
    it('should return valid for strong password', () => {
      const result = validatePasswordStrength('Abcdefgh1')
      expect(result.valid).toBe(true)
      expect(result.errors).toEqual([])
    })
  })

  describe('getPasswordRequirements', () => {
    it('should return all requirements unmet for empty string', () => {
      const reqs = getPasswordRequirements('')
      expect(reqs).toHaveLength(4)
      expect(reqs.every(r => !r.met)).toBe(true)
    })
    it('should show all met for strong password', () => {
      const reqs = getPasswordRequirements('Abcdefgh1')
      expect(reqs.every(r => r.met)).toBe(true)
    })
  })
})
