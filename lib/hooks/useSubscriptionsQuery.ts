import { db } from "../db";

export const useSubscriptionsQuery = () => {
  const { user } = db.useAuth();

  return db.useQuery(
    user
      ? {
          subscriptions: {
            $: {
              where: {
                "$user.id": user.id,
              },
            },
          },
        }
      : null,
  );
};
