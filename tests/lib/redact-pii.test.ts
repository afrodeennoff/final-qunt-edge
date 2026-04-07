import { describe, it, expect } from 'vitest'
import { maskEmail, maskString, redactUserResponse } from '@/lib/redact-pii'

describe('redact-pii', () => {
  describe('maskEmail', () => {
    it('should mask standard email', () => {
      expect(maskEmail('john.doe@gmail.com')).toBe('jo***@gmail.com')
    })
    it('should mask short email', () => {
      expect(maskEmail('ab@example.com')).toBe('ab***@example.com')
    })
    it('should handle null/undefined', () => {
      expect(maskEmail(null as unknown as string)).toBe('')
      expect(maskEmail(undefined as unknown as string)).toBe('')
    })
    it('should handle email with subdomains', () => {
      expect(maskEmail('user@mail.example.com')).toBe('us***@mail.example.com')
    })
  })

  describe('maskString', () => {
    it('should mask middle of string', () => {
      expect(maskString('abcdef')).toBe('ab***ef')
    })
    it('should handle short strings', () => {
      expect(maskString('ab')).toBe('ab****')
    })
    it('should handle empty string', () => {
      expect(maskString('')).toBe('')
    })
    it('should handle custom visible chars', () => {
      expect(maskString('abcdefghij', 3, 3)).toBe('abc***hij')
    })
  })

  describe('redactUserResponse', () => {
    it('should redact specified fields in flat object', () => {
      const input = { id: 'abc-123', email: 'test@example.com', name: 'John' }
      const result = redactUserResponse(input, ['email'])
      expect(result.email).toBe('te***@example.com')
      expect(result.id).toBe('abc-123')
      expect(result.name).toBe('John')
    })
    it('should redact fields in nested arrays', () => {
      const input = { users: [{ email: 'a@test.com', role: 'admin' }, { email: 'b@test.com', role: 'user' }] }
      const result = redactUserResponse(input, ['email'])
      expect(result.users[0].email).toBe('a***@test.com')
      expect(result.users[0].role).toBe('admin')
    })
    it('should not mutate original object', () => {
      const input = { email: 'test@example.com', name: 'John' }
      redactUserResponse(input, ['email'])
      expect(input.email).toBe('test@example.com')
    })
  })
})
