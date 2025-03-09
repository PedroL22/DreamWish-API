import type { InferSelectModel } from 'drizzle-orm'

import type { wishlists } from '~/database/schema'

export type Wishlist = InferSelectModel<typeof wishlists>
