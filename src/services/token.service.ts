import { and, eq, lt } from 'drizzle-orm'
import { db } from '~/database'
import { refreshTokens } from '~/database/schema'

interface RefreshTokenData {
  userId: string
  tokenId: string
  expiresAt: Date
  userAgent: string
  ip: string
}

export class TokenService {
  async storeRefreshToken(data: RefreshTokenData) {
    return db.insert(refreshTokens).values({
      id: data.tokenId,
      userId: data.userId,
      expiresAt: data.expiresAt,
      userAgent: data.userAgent,
      ipAddress: data.ip,
      isValid: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
  }

  async verifyRefreshToken(userId: string, tokenId: string): Promise<boolean> {
    const token = await db.select().from(refreshTokens).where(eq(refreshTokens.id, tokenId)).limit(1)

    if (!token.length) return false

    const refreshToken = token[0]
    if (!refreshToken.isValid) return false
    if (refreshToken.userId !== userId) return false
    if (refreshToken.expiresAt < new Date()) return false

    return true
  }

  async invalidateRefreshToken(tokenId: string) {
    return db
      .update(refreshTokens)
      .set({
        isValid: false,
        updatedAt: new Date(),
      })
      .where(eq(refreshTokens.id, tokenId))
  }

  async invalidateAllUserTokens(userId: string) {
    return db
      .update(refreshTokens)
      .set({
        isValid: false,
        updatedAt: new Date(),
      })
      .where(and(eq(refreshTokens.userId, userId), eq(refreshTokens.isValid, true)))
  }

  async cleanupExpiredTokens() {
    const now = new Date()
    return db.delete(refreshTokens).where(lt(refreshTokens.expiresAt, now))
  }
}
