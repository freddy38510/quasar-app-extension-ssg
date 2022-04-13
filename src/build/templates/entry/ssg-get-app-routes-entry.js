/**
 * THIS FILE IS GENERATED AUTOMATICALLY.
 * DO NOT EDIT.
 * */
import createRouter from 'app/<%= sourceFiles.router %>';

const getRouter = async () => (typeof createRouter === 'function'
  ? createRouter()
  : createRouter);

export default async () => {
  const router = await getRouter();

  return router.getRoutes();
};
