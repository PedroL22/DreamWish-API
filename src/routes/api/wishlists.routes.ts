import { Hono } from 'hono'

import { WishlistController } from '~/controllers/wishlist.controller'
import { authMiddleware } from '~/middleware/auth.middleware'
import { WishlistService } from '~/services/wishlist.service'

const wishlistsRouter = new Hono()

wishlistsRouter.use(authMiddleware)

const wishlistService = new WishlistService()
const wishlistController = new WishlistController(wishlistService)

wishlistsRouter.get('/', wishlistController.listWishlists.bind(wishlistController))

export { wishlistsRouter }
