import config from "config";

// Given a body array(usually sourced from CSV), and an object key for that array convert the array into an object.
// For example giving it ['potato', 4] as a body array and ['vegetable','amount'] as a params key you get an object
// {"vegetable":"potato", "amount": 4}, JSON is easier to work with.
export function convertArray(paramsKey, body) {
    // Weird lengths can mess with the array so we block them here.
    if (body.length !== paramsKey.length) {
        throw new Error(
            `Invalid Request Body, Expected: ${paramsKey.length} params but got ${body.length} params.`
        );
    }
    // Just a simple for loop at this point that maps index to index, key[i] = body[i]
    const ret = {};
    paramsKey.forEach((value, index) => {
        ret[value] = body[index];
    });
    return ret;
}

const competitions = config.get("competitions");
const categories = config.get("categories");
const mainCategories = Object.keys(categories);

// Is this a valid competition and category, uses the configuration files
export function validateVoteTarget(competition, incomingCategories) {
    return (
        validateCompetition(competition) &&
        validateCategories(incomingCategories)
    );
}

export function validateCompetition(competition) {
    return competitions.includes(competition);
}

/*
 * Categories got a little more complicated this year as we now have subcategories. This is ok as we now have code to check they are ok.
 * one category "meme" doesn't have subcategories, so we just check if the config for a category has subcategories.
 */
export function validateCategories(incomingCategories) {
    // Invalid main category.
    if (!mainCategories.includes(incomingCategories.category)) return false;

    // Check for invalid subcategories.
    const subcategories = categories[incomingCategories.category];
    if (
        !subcategories.includes(incomingCategories.subcategory) &&
        subcategories.length > 0
    )
        return false;

    return true;
}

// Just a helper function to ensure we're getting these in a standard format that won't break anywhere else.
export function extractCategories(req) {
    const ret = {};
    if (req.params.category) {
        ret.category = req.params.category;
    }
    if (req.params.subcategory) {
        ret.subcategory = req.params.subcategory;
    }
    return ret;
}

// Simple includes check for if this vote target is blocked from voting in the config.
const blocked = config.get("blocked");
export function isBlocked(voteTarget) {
    return blocked.includes(voteTarget);
}
