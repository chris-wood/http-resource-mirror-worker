const url = require("url");
import { parse } from "@tusbar/cache-control";
import { BHttpEncoder } from "bhttp-js";

/**
 * Handle requests to the mirror
 * @param {Request} request
 */
export default {
	async fetch(request, env, ctx) {
		const url = new URL(request.url);
		let params = url.searchParams;
		let target = params.get("target");
		if (target == "") {
			return new Response('missing target parameter', { status: 400 })
		}

		// Check the cache for an entry first
		var encodedResponse = await env.MIRROR.get(target);
		if (encodedResponse === null) {
			// If the response is not cached, fetch a new copy
			const response = await fetch(target);
			const headers = response.headers;
			const cacheControl = headers.get("Cache-Control");
			var secondsFromNow = 1; // default TTL
			if (cacheControl != null) {
				const parsedCacheValue = parse(cacheControl);
				secondsFromNow = parsedCacheValue.maxAge;
			}

			// Encode the response
			var encoder = new BHttpEncoder();
			encodedResponse = await encoder.encodeResponse(response);

			// Insert the response into the cache with a TTL according to the resource's cache control directives
			await env.MIRROR.put(target, encodedResponse, { expirationTtl: secondsFromNow });
		}
		
		return new Response(encodedResponse);
	}
}
