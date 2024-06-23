import { env } from "~/env";

export const jwtConstants = {
	secret: `${env.JWT_SECRET_KEY}`,
};
