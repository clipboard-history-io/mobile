import { db } from "../db";

export const useCloudEntriesQuery = () => {
  const { user } = db.useAuth();

  return db.useQuery(
    user
      ? {
          entries: {
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
