addEventListener('fetch', event => {
	event.respondWith(handleRequest(event));
  });

  async function recordRequest(request) {

	const analyticsData = {
	  timestamp: Date.now(),
	  domain: new URL(request.url).hostname,
	  method: request.method,
	  path: new URL(request.url).pathname,
	  ipcountry: request.cf.country,
	}
	const ANALYTICS_URL = 'https://analytics.jonasjones.dev/requests/record';

	const response = await fetch(ANALYTICS_URL, {
	  method: 'POST',
	  headers: {
		'Content-Type': 'application/json',
		'Authorization': ANALYTICS_API_KEY,
	  },
	  body: JSON.stringify(analyticsData)
	});

	if (response.ok) {
	  console.log('Request recorded successfully');
	} else {
	  console.error('Failed to record request:', response.status, await response.text());
	}
  }

  async function handleRequest(event) {
	event.waitUntil(recordRequest(event.request));
	const request = event.request;
	const { pathname, search } = new URL(request.url);

	// List of built-in paths that should not trigger an error
	const allowedPaths = ['/health', '/status'];

	// if (allowedPaths.includes(pathname)) {
	//   // Allow requests to built-in paths
	//   return fetch(request);
	// }

	// Make a request to someapi.jonasjones.dev/[PATH] including URL parameters
	const apiUrl = `https://someapi.jonasjones.dev${pathname}${search}`;
	const apiRequest = new Request(apiUrl, {
	  method: request.method,
	  headers: request.headers,
	  body: request.body
	});

	try {
	  const apiResponse = await fetch(apiRequest);

	  if (pathname === '/status' && apiResponse.ok) {
		// If the request is to the /status path and the API request is successful, return a custom response
		return new Response('API is up and running', {
		  status: 200,
		  statusText: 'OK'
		})} else if (pathname === '/status' && !apiResponse.ok) {
		// If the request is to the /status path and the API request fails, return a custom response
		return new Response('API is down', {
		  status: 503,
		  statusText: 'Service Unavailable'
		})};


	  if (apiResponse.status === 502 || apiResponse.status === 530) {
		// If the API request fails, return an error response
		return new Response('Service Unavailable', {
		  status: 503,
		  statusText: 'Service Unavailable'
		});
	  } else {
		// If the API request fails, return an error response
		return apiResponse;
	  }
	} catch (error) {
		console.log(error);
	  // If an error occurs during the API request, return an error response
	  return new Response('Internal Server Error', {
		status: 500,
		statusText: 'Internal Server Error'
	  });
	}
  }
