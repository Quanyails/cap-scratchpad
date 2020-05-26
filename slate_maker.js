/*jshint esversion: 6 */
(() => {

"use strict";

if (typeof window.$ !== 'function') {
	window.console.log('jQuery must be loaded. :(');
	// TODO: load jQuery if this is missing.
}

// Types

/**
 * Interface representing the four values making a Pokemon's rating.
 *
 * @interface Post
 * @property {string} bbCode the BBCode to be posted in the opening post of the poll
 * @property {number} id the ID of the post
 * @property {boolean} isFinalSubmission if the post is a final submission post
 * @property {boolean} isValidSubmission if the post is a valid submission
 * @property {string} postUrl the URL to the post
 * @property {string} username the name of the user who made the post
 */

// Post base class

const IMG_SELECTOR = '.bbImage';
const LINK_SELECTOR = '.message-attribution-main a';
const MESSAGE_SELECTOR = '.message-body';
const MESSAGE_DELETED_SELECTOR = '.message--deleted';
const POST_ID_SELECTOR = '.message-userContent';
const USERNAME_SELECTOR = '.message-name';

const IMG_DATA_ATTR = 'data-url';
const POST_ID_DATA_ATTR = 'data-lb-id';

const FINAL_SUBMISSION_TEXT = 'final submission';

const MAX_DESCRIPTION_LENGTH = 25;
const PRONUNCIATION_TEXT = 'Pronounced: ';

const isNameLegal = (str) => {
	// Names cannot be longer than 12 letters.
	if (str.length > 12) {
		return false;
	}
	// Names can only contain ... characters.
	if (!str.match(/^[A-Za-z0-9 \.\-':]+$/)) {
		return false;
	}
	// No more than two capital letters can be included in the name,
	// and capital letters cannot be consecutive.
	const capitals = str.match(/[A-Z]/g);
	if (capitals) {
		switch (capitals.length) {
			case 1:
				if (!str.startsWith(capitals[0])) {
					return false;
				}
				break;
			case 2:
				if (!str.startsWith(capitals[0])) {
					return false;
				}
				let rest = str.substring(1);
				if (rest.startsWith(capitals[0])) {
					return false;
				}
				break;
			default:
				return false;
		}
	} else {
		return false;
	}

	// A maximum of two non-letters can be included in the name,
	// and a maximum of one non-letter of each type can be included
	// (i.e. You can't have two numbers, or two apostrophes,
	// but you could have one number and one apostrophe).
	// NOTE: This only works because underlines are filtered out above.
	// \W is shorthand for not alphabetical + underscore.
	const nonLetters = str.match(/\W/g);
	const uniqueNonLetters = new Set(nonLetters);

	if (nonLetters !== null) {
		if (nonLetters.length > uniqueNonLetters.size) {
			return false;
		}
	}

	return true;
}


const isValidNameSubmission = ({
								   description,
								   name,
								   postUrl,
								   pronunciation,
								   username,
							   }) => {
	if (!isNameLegal(name)) {
		window.console.warn(`${username} has an illegal name!`);
		window.console.warn(`${name} does not meet the format rules.`);
		window.console.warn(`Post: ${postUrl}`);
		return false;
	}

	// Is descrption no longer than 25 words?
	// TODO: Use a library to count words.
	// Try: https://github.com/RadLikeWhoa/Countable
	const descriptionWords = description.split(' ');
	const isDescribedCorrectly = descriptionWords.length <= MAX_DESCRIPTION_LENGTH;
	if (!isDescribedCorrectly) {
		window.console.warn(`${username} has an illegal description!`);
		window.console.warn(`"${description}" has length ${descriptionWords.length}, which is longer than the maximum description length of ${MAX_DESCRIPTION_LENGTH}.`);
		window.console.warn(`Post: ${postUrl}`);
		return false;
	}

	// Is the "pronounced" line correct?
	const isPronouncedCorrectly = pronunciation.startsWith(PRONUNCIATION_TEXT);
	if (!isPronouncedCorrectly) {
		window.console.warn(`${username} has an illegal pronunciation!`);
		window.console.warn(`"${pronunciation}" does not start with "${PRONUNCIATION_TEXT}".`);
		window.console.warn(`Post: ${postUrl}`);
		return false;
	}

	return true;
}

const makeBasePost = ($post) => {
	const id = (() => {
		if ($post.is(MESSAGE_DELETED_SELECTOR)) {
			return null;
		}
		const $idEl = $post.find(POST_ID_SELECTOR);
		const idStr = $idEl.attr(POST_ID_DATA_ATTR).replace('post-', '');

		return parseInt(idStr, 10);
	})();

	const message = $post.find(MESSAGE_SELECTOR).text().trim();
	const messageLines = message.split('\n').map((s) => s.trim());

	return {
		id,
		messageLines,
		// Don't use .attr(), since that only gives the relative path.
		postUrl: $post.find(LINK_SELECTOR).prop('href'),
		username: $post.find(USERNAME_SELECTOR).text(),
	}
};

/**
 *
 * @param {HTMLElement} el
 * @returns {Post}
 */
const makeArtThreadPost = (el) => {
	const $post = window.$(el);

	const {
		id,
		messageLines,
		postUrl,
		username,
	} = makeBasePost($post);

	const finalSubmissionText = messageLines[0];
	const isFinalSubmission = finalSubmissionText.toLowerCase() === FINAL_SUBMISSION_TEXT;

	if (!isFinalSubmission) {
		return {
			...{
				id,
				messageLines,
				postUrl,
				username,
			},
			bbCode: '',
			isFinalSubmission,
			isValidSubmission: false,
		}
	}

	const imgUrls = Array.from($post.find(IMG_SELECTOR))
		.map((img) => {
			return window.$(img).attr(IMG_DATA_ATTR);
		});
	const mainImageUrl = (imgUrls.length > 0) ? imgUrls[0] : null;
	if (mainImageUrl === null) {
		window.console.warn(`${username} declared a final submission without an image.`);
	}
	const supportingMaterial = $post.find(MESSAGE_SELECTOR).find('a[href]');

	const bbCode = ((
		mainImageUrl && supportingMaterial.length > 0 ?
			[
				'--------------------------------------------------------------------------------------------',
				`[B]${username}[/B]`,
				`[IMG]${mainImageUrl}[/IMG]`,
				`[URL=${postUrl}]Supporting Material[/URL]`,
				'--------------------------------------------------------------------------------------------',
			] :
			[
				'--------------------------------------------------------------------------------------------',
				`[B]${username}[/B]`,
				`[IMG]${mainImageUrl}[/IMG]`,
				'--------------------------------------------------------------------------------------------',
			]
	).join('\n'));

	return {
		...{
			id,
			postUrl,
			username,
		},
		bbCode,
		isFinalSubmission,
		isValidSubmission: mainImageUrl !== null,
	}
};

/**
 *
 * @param {HTMLElement} el
 * @returns {Post}
 */
const makeNameThreadPost = (el) => {
	const $post = window.$(el);

	const {
		id,
		messageLines,
		postUrl,
		username,
	} = makeBasePost($post);

	// Doesn't have enough fields
	if (messageLines.length < 7) {
		return {
			...{
				id,
				postUrl,
				username,
			},
			bbCode: '',
			name: '',
			isFinalSubmission: false,
			isValidSubmission: false,
		}
	}

	const finalSubmissionText = messageLines[0];
	const name = messageLines[2];
	const description = messageLines[4];
	const pronunciation = messageLines[6];

	const isFinalSubmission = finalSubmissionText.toLowerCase() === FINAL_SUBMISSION_TEXT;

	if (!isFinalSubmission) {
		return {
			...{
				id,
				postUrl,
				username,
			},
			bbCode: '',
			name: '',
			isFinalSubmission,
			isValidSubmission: false,
		}
	}

	const bbCode = `[B]${name}[/B] [URL=${postUrl}]>>>[/URL]`;

	return {
		...{
			id,
			postUrl,
			username,
		},
		bbCode,
		isFinalSubmission,
		isValidSubmission: isValidNameSubmission({
			description,
			name,
			postUrl,
			pronunciation,
			username,
		}),
	};
};

// Scraper base class

// Different from Vote4CAP's scraper!

const SMOGON_HOSTNAME = 'smogon.com';

const NEXT_SELECTOR = 'a.pageNav-jump--next';
const POST_SELECTOR = '[data-lb-id^="thread"] .message';

const xenForoScraper = ({
							type,
							url,
						}) => {

	/**
	 * @param {string} text
	 * @returns {string|null}
	 */
	const getNextLink = (text) => {
		const $nextEl = $('<div/>').html(text).find(NEXT_SELECTOR);
		return ($nextEl.length === 0) ? null : $nextEl[0].href;
	}

	/**
	 * @param {HTMLElement} el
	 * @returns {Post}
	 */
	const makePost = (el) => {
		switch (type) {
			case "art": {
				return makeArtThreadPost(el);
			}
			case "name": {
				return makeNameThreadPost(el);
			}
			default: {
				throw Error(`Unsupported poll scraper type: ${type}`);
			}
		}
	};

	/**
	 * @param {string} text: an HTML-embedded string
	 * @returns {Post[]}
	 */
	const makePosts = (text) => {
		const $pageEl = window.$('<div/>').html(text);
		const $postEls = $pageEl.find(POST_SELECTOR);
		return Array.from($postEls).map((postEl) => {
			return makePost(postEl);
		});
	}

	/**
	 * @param {Post[]} posts
	 * @returns {Post[]}
	 */
	const validatePosts = (posts) => {
		switch (type) {
			case "art": {
				return posts;
			}
			case "name": {
				// TODO check that posts are after moderator post.
				return posts;
			}
			default: {
				return posts;
			}
		}
	}

	/**
	 * @param {string} url
	 * @returns {Promise<Post[]>}
	 */
	const fetchPosts = async (url) => {
		if (!window.location.hostname.includes(SMOGON_HOSTNAME)) {
			throw new Error(`Script must be run on ${SMOGON_HOSTNAME}`);
		}

		let posts = [];

		let nextUrl = url;
		while (nextUrl !== null) {
			const response = await fetch(nextUrl);
			const pageText = await response.text();
			const pagePosts = makePosts(pageText);
			posts = posts.concat(pagePosts);

			nextUrl = getNextLink(pageText);
		}

		posts = validatePosts(posts);
		return posts;
	}

	return fetchPosts(url);
}

/**
 *
 * @param {Post[]} posts
 * @returns {string}
 */
const makeBbCode = (posts) => {
	return posts
		// get valid final submission posts
		.filter((post) => {
			return post.isFinalSubmission && post.isValidSubmission;
		})
		// map to BBCode
		.map((post) => {
			return post.bbCode;
		})
		.join('\n');
}

const main = async () => {
	const posts = await xenForoScraper({
		url: window.location.href,
		type: "art",
		// type: "name",
	});

	const bbCode = makeBbCode(posts);
	console.log(bbCode);
}

main();
})();
