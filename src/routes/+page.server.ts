// // since there's no dynamic data here, we can prerender
// // it so that it gets served as a static asset in production
//  export const prerender = true;
//  export const ssr = true;


import type { PageServerLoad } from './$types';
import { v4 as uuidv4 } from 'uuid';

export const load: PageServerLoad = async ({ params }) => {
    const newUuid = uuidv4();

	return {newUuid}
};