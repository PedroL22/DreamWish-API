import type { Context } from 'hono'

import type { WishlistService } from '~/services/wishlist.service'

export class WishlistController {
  constructor(private wishlistService: WishlistService) {}

  async listWishlists(c: Context): Promise<Response> {
    const wishlists = await this.wishlistService.listWishlists()

    return c.json(wishlists)
  }
}
