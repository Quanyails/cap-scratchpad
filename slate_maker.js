/*jshint esversion: 6 */
(function() {

"use strict";

if (typeof window.$ !== 'function') {
    window.console.log('jQuery must be loaded. :(');
	// TODO: load jQuery if this is missing.
}

// Post base class

const USERNAME_SELECTOR = '.message-name';
const POST_ID_SELECTOR = '.message-userContent';
const POST_ID_DATA_ATTR = 'data-lb-id';

class Post {
	constructor(text) {
		this.$post = window.$('<div/>').html(text);
	}

	/**
	 * final
	 * @returns {string}
	 */
	get username() {
		return this.$post.find(USERNAME_SELECTOR).text();
	}

	/**
	 * final
	 * @returns {number}
	 */
	get id() {
		const $idEl = this.$post.find(POST_ID_SELECTOR);
		const idStr = $idEl.attr(POST_ID_DATA_ATTR).replace('post-', '');
		return parseInt(idStr, 10);
	}

	/**
	 * @returns {string}
	 */
	get postUrl() {
		// Don't use .attr(), since that only gives the relative path.
		return this.$post.find(LINK_SELECTOR).prop('href');
	}

	/**
	 * @returns {boolean}
	 */
	isFinalSubmission() {
		throw new Error('This method must be implemented by a subclass!');
	}

	/**
	 * @returns {boolean}
	 */
	isValidSubmission() {
		return true;
	}

	/**
	 * @returns {string} in BBcode format
	 */
	getSubmission() {
		throw new Error('This method must be implemented by a subclass!');
	}
}


// Scraper base class

// Different from Vote4CAP's scraper!
class Scraper {
	constructor() {}

	/**
	 * Asynchronous.
	 * @param {string} url
	 * @returns {Promise<string>}
	 */
	makeBbCode(url) {
		throw new Error('This method must be implemented by a subclass!');
	}
}


const SMOGON_HOSTNAME = 'smogon.com';

const NEXT_SELECTOR = 'a.pageNav-jump--next';
const POST_SELECTOR = '[data-lb-id^="thread"] .message';

class XenForoScraper extends Scraper {
	constructor() {
		super();
	}

	/**
	 * @param {string} text
	 * @returns {string|null}
	 */
	static getNextLink(text) {
		const $nextEl = $('<div/>').html(text).find(NEXT_SELECTOR);
		return ($nextEl.length === 0)? null : $nextEl[0].href;
	}

	/**
	 * @param {HTMLElement} postEl
	 * @returns {Post} use subclasses here!
	 */
	static makePost(postEl) {
		throw new Error('This method must be implemented by a subclass!');
	}

	/**
	 * @param {string} text: an HTML-embedded string
	 * @returns {Post[]}
	 */
	static makePosts(text) {
		const $pageEl = $('<div/>').html(text);
		const $postEls = $pageEl.find(POST_SELECTOR);
		return $postEls.toArray().map((postEl) => {
			return this.makePost(postEl);
		});
	}

	/**
	 * @param {Post[]} posts
	 * @returns {Post[]}
	 */
	static validatePosts(posts) {
		return posts;
	}

	/**
	 * final
	 * @param {string} url
	 * @returns {Promise<Post[]>}
	 */
	static fetchPosts(url) {
		if (!window.location.hostname.includes(SMOGON_HOSTNAME)) {
			throw new Error('Script must be run on ' + SMOGON_HOSTNAME);
		}
		let posts = [];
		// Async recursive loop.
		const self = this;
		const fetchPage = function(url) {
			return fetch(url)
				.then((response) => {
					return response.text(); // Promise<USVtring>
				})
				.then((text) => {
					const pagePosts = self.makePosts(text);
					posts = posts.concat(pagePosts);

					const nextLink = self.getNextLink(text);
					if (nextLink !== null) {
						return fetchPage(nextLink);
					} else {
						// Don't perform recursion and return result.
						return posts;
					}
				});
		};
		return fetchPage(url);
	}

	/**
	 * final
	 * @param {string} url
	 * @returns {Promise<String[]>}
	 */
	static fetchSubmissions(url) {
		return this.fetchPosts(url)
			.then((posts) => {
				let finalPosts = posts.filter((post) => {
						return post.isFinalSubmission() &&
							post.isValidSubmission();
					});
				let validPosts = this.validatePosts(finalPosts);
				let result = validPosts.map((post) => {
						return post.getSubmission();
					});
				return result;
			});
	}

	/**
	 * final
	 * @override
	 */
	static makeBbCode(url) {
		return this.fetchSubmissions(url)
			.then((submissions) => {
				const bbCode = submissions.join('\n');
				return bbCode;
			});
	}
}


// Art thread scraper

const FINAL_SUBMISSION_TEXT = 'final submission';
const MESSAGE_SELECTOR = '.message-body';

const IMG_SELECTOR = '.bbImage';
const IMG_DATA_ATTR = 'data-url';
const LINK_SELECTOR = '.message-attribution-main a';

class ArtThreadPost extends Post {
	constructor(text) {
		super(text);
	}

	/**
	 * @returns {boolean}
	 */
	hasSupportingMaterial() {
		return this.$post.find(MESSAGE_SELECTOR).find('a[href]').length > 0;
	}

	/**
	 * @returns {string[]}
	 */
	get messageLines() {
		const message = this.$post.find(MESSAGE_SELECTOR).text().trim();
		const messageLines = message.split('\n').map((s) => s.trim());
		return messageLines;
	}

	/**
	 * @returns {string}
	 */
	get finalSubmissionText() {
		return this.messageLines[0];
	}

	/**
	 * @override
	 */
	isFinalSubmission() {
		// Does post start with the words 'final submission'?
		const hasFinalSubmissionText = this.finalSubmissionText.toLowerCase() === FINAL_SUBMISSION_TEXT;
		if (!hasFinalSubmissionText) {
			return false;
		}
		return true;
	}

	/**
	 * @returns {string}
	 */
	get imgUrl() {
		const imgUrls = this.$post.find(IMG_SELECTOR).toArray()
			.map((img) => {
			return window.$(img).attr(IMG_DATA_ATTR);
		});

		let imgUrl = null;
		if (imgUrls.length >= 0) {
			imgUrl = imgUrls[0];
		}
		return imgUrl;
	}

	/**
	 * @override
	 */
	 isValidSubmission() {
		if (this.imgUrl === null) {
            window.console.warn(this.username + ' declared a final submission without an image.');
		}

		// TODO: add other legality checks.
		return true;
	 }

	/**
	 * @override
	 */
	getSubmission() {
		// window.console.assert(this.isFinalSubmission() && this.isValidSubmission());
		let bbCode = [
				'--------------------------------------------------------------------------------------------',
				'[B]' + this.username + '[/B]',
				'[IMG]' + this.imgUrl + '[/IMG]',
				'--------------------------------------------------------------------------------------------',
			];
		if (this.hasSupportingMaterial()) {
			bbCode = [
				'--------------------------------------------------------------------------------------------',
				'[B]' + this.username + '[/B]',
				'[IMG]' + this.imgUrl + '[/IMG]',
				'[URL=' + this.postUrl + ']Supporting Material[/URL]',
				'--------------------------------------------------------------------------------------------',
			];
		}
		return bbCode.join('\n');
	}
}


class ArtPollScraper extends XenForoScraper {
	constructor() {
		super();
	}

	static makePost(postEl) {
		return new ArtThreadPost(postEl);
	}
}

// Name thread scraper

const MAX_DESCRIPTION_LENGTH = 25;
const PRONUNCIATION_TEXT = 'Pronounced: ';

class NameThreadPost extends Post {
	constructor(text) {
		super(text);
	}

	static isNameLegal(str) {
		// Names cannot be longer than 12 letters.
		if (str.length > 12) {
			return false;
		}
		// Names can only contain ... characters.
		if (!str.match(/^[A-Za-z0-9 \.\-':]+$/)){
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
		}
		else {
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

	/**
	 * @returns {string[]}
	 */
	get messageLines() {
		const message = this.$post.find(MESSAGE_SELECTOR).text().trim();
		const messageLines = message.split('\n').map((s) => s.trim());
		return messageLines;
	}

	/**
	 * @returns {string}
	 */
	get finalSubmissionText() {
		return this.messageLines[0];
	}

	/**
	 * @returns {string}
	 */
	get name() {
		return this.messageLines[2];
	}

	/**
	 * @returns {string}
	 */
	get description() {
		return this.messageLines[4];
	}

	/**
	 * @returns {string}
	 */
	get pronunciation() {
		return this.messageLines[6];
	}

	/**
	 * @override
	 */
	isFinalSubmission() {
		// Does post start with the words 'final submission'?
		const hasFinalSubmissionText = this.finalSubmissionText.toLowerCase() === FINAL_SUBMISSION_TEXT;
		if (!hasFinalSubmissionText) {
			return false;
		}

		return true;
	}

	/**
	 * @override
	 */
	 isValidSubmission() {
		// Doesn't have enough fields.
		if (this.messageLines.length < 7) {
			return false;
		}

		const isNameLegal = NameThreadPost.isNameLegal(this.name);
		if (!isNameLegal) {
            window.console.warn(this.username + ' has an illegal name!');
            window.console.warn(this.name + ' does not meet the format rules.');
            window.console.warn('Post: ' + this.postUrl);
			return false;
		}

		// Is descrption no longer than 25 words?
		// TODO: Use a library to count words.
		// Try: https://github.com/RadLikeWhoa/Countable
		const descriptionWords = this.description.split(' ');
		const isDescribedCorrectly = descriptionWords.length <= MAX_DESCRIPTION_LENGTH;
		if (!isDescribedCorrectly) {
            window.console.warn(this.username + ' has an illegal description!');
            window.console.warn('"' + this.description + '" has length ' + descriptionWords.length +
				', which is longer than the maximum description length of ' + MAX_DESCRIPTION_LENGTH + '.');
            window.console.warn('Post: ' + this.postUrl);
			return false;
		}

		// Is the "pronounced" line correct?
		const isPronouncedCorrectly = this.pronunciation.startsWith(PRONUNCIATION_TEXT);
		if (!isPronouncedCorrectly) {
            window.console.warn(this.username + ' has an illegal pronunciation!');
            window.console.warn('"' + this.pronunciation + '" does not start with ' +
				'"' + PRONUNCIATION_TEXT + '".');
            window.console.warn('Post: ' + this.postUrl);
			return false;
		}

		return true;
	 }

	/**
	 * @override
	 */
	getSubmission() {
		// window.console.assert(this.isFinalSubmission() && this.isValidSubmission());
		// return `[B]${this.name}[/B]`;
		return `[B]${this.name}[/B] [URL=${this.postUrl}]>>>[/URL]`;
	}
}

class NamePollScraper extends XenForoScraper {
	constructor() {
		super();
	}

	/**
	 * @override
	 */
	static makePost(postEl) {
		return new NameThreadPost(postEl);
	}

	/**
	 * @override
	 */
	static validatePosts(posts) {
		// TODO check that posts are after moderator post.
		return posts;
	}
}


ArtPollScraper.makeBbCode(window.location.href)
 	.then((result) => window.console.log(result));


// NamePollScraper.makeBbCode(window.location.href)
//  	.then((result) => window.console.log(result));

})();