const API_URL = 'https://api.rescuegroups.org/v5/public/animals/search/available/';
const DETAIL_URL = 'https://api.rescuegroups.org/v5/public/animals';

const jsonResponse = (statusCode, body) => ({
    statusCode,
    headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type'
    },
    body: JSON.stringify(body)
});

exports.handler = async (event) => {
    const apiKey = process.env.RESCUE_GROUPS_API_KEY;

    if (!apiKey) {
        return jsonResponse(500, { error: 'RESCUE_GROUPS_API_KEY is not configured.' });
    }

    const id = event.queryStringParameters?.id;
    const query = event.queryStringParameters || {};
    const filters = [];
    const speciesViews = {
        Cat: 'cats',
        Dog: 'dogs',
        Rabbit: 'rabbits',
        Bird: 'birds',
        Fish: 'fish',
        Ferret: 'ferrets',
        'Guinea Pig': 'guineapigs',
        Hamster: 'hamsters',
        Horse: 'horses',
        Lizard: 'lizards',
        Turtle: 'turtles'
    };

    if (!id) {
        if (query.species && speciesViews[query.species]) {
            filters.push({
                fieldName: 'species.plural',
                operation: 'equal',
                criteria: speciesViews[query.species]
            });
        }
        if (query.sex && query.sex !== 'no-pref') {
            filters.push({
                fieldName: 'animals.sex',
                operation: 'equal',
                criteria: query.sex
            });
        }
    }

    const fields = [
        'name', 'species', 'sex', 'ageString', 'description', 'pictureThumbnailUrl',
        'pictureUrl', 'url', 'contactEmail', 'contactPhone', 'contactAddress',
        'contactCity', 'contactState', 'distance'
    ].join(',');
    const searchParams = new URLSearchParams({
        page: '1',
        limit: '12',
        sort: '-animals.createdDate',
        'fields[animals]': fields
    });
    const filterRadius = query.zip ? {
        postalcode: query.zip,
        miles: query.distance && query.distance !== 'no-limit' ? query.distance : 500
    } : undefined;
    const requestUrl = id ? `${DETAIL_URL}/${encodeURIComponent(id)}` : `${API_URL}?${searchParams}`;
    const requestBody = id ? undefined : JSON.stringify({
        data: {
            filters,
            ...(filterRadius ? { filterRadius } : {})
        }
    });

    try {
        const response = await fetch(requestUrl, {
            method: id ? 'GET' : 'POST',
            headers: {
                Authorization: apiKey,
                Accept: 'application/vnd.api+json',
                'Content-Type': 'application/vnd.api+json',
            },
            body: requestBody
        });

        const body = await response.text();
        if (!response.ok) {
            return jsonResponse(response.status, {
                error: 'RescueGroups API request failed.',
                details: body
            });
        }

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/vnd.api+json',
                'Access-Control-Allow-Origin': '*'
            },
            body
        };
    } catch (error) {
        return jsonResponse(502, {
            error: 'Could not reach RescueGroups API.',
            details: error.message
        });
    }
};
