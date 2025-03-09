import { db } from '~/database'
import { wishlists } from '~/database/schema'

import type { Wishlist } from '~/models/wishlist.model'

export class WishlistService {
  async listWishlists(): Promise<Wishlist[]> {
    return await db.select().from(wishlists)
  }
}
