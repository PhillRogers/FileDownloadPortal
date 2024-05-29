# Purpose:
	Example of web page for downloading files to demonstrate best practices for human usability & automation.  
	Reduce the barriers for maintainers of existing portals with poor usability, to replace their front-end.  
# Version:
	Copyright (c) 2024 Phill Rogers.  Last update: 2024-05-29
# License:
	GPL3 https://www.gnu.org/licenses/gpl-3.0.txt  
	Enhance Group Ltd. hereby disclaims all copyright interest in the program "FileDownloadPortal" (which demonstrates good portal design) written by Phill Rogers.  
# Features:
	Modern standard DHTML requiring no external library.  
	Standard HTML inputs for date to use built-in validation, accessible usability & compliant browser compatibility.  
	Resulting UI is automatable and UX is accessible by keyboard alone with expected tab order.  
	HTML structure, CSS style, JavaScript code can all be maintained separately by delegated subject matter experts.  
	Preferred language selector uses ISO639 standard & enables typing code to get to the desired selection.  
	Search starts on submit, after all filter criteria are set. Prevents wasted resources & slow interactivity of continuous update.  
	Form can be reset without reloading page - saving resources & preserving language preference.  
	Single-click buttons for commonly desired date selection presets.  
	Date selector displays in visiting user's browser locale & accepts keyboard typed digits in same order.  
	Inter-connected date selection methods with sensible defaults, saving time & highlighting when first-date is after last-date.  
	Back-end returns whole dataset (records are just text - images & downloads are via links) so pagination does no more requests & last page doesn't change.  
	DOM contains tfoot which only becomes visible after all rows have populated, so you can be certain when request response and rendering is complete.  
	DOM contains version identifier for HTML & JS so automation maintainers can detect when to test for changed behaviour.  
	Full results summary showing what records & page is in view, and what the record and page counts are in total.  
	Vertical pad at end so last row is not obscured by status messages.  
	Key parameters can be saved as a direct link (using common GET query format) for bookmarking - saving the user time for common queries.  
	Example call to back-end uses common GET request query format & returns common JSON format.  
	Page load parameters (GET query) are separate from back-end request parameters, easing retrofitting of new front-end on old back-end.  
	Row selection is preserved across page navigation to help user explore as required and still only need one download.  
	Ascending or descending sort by clicking on any column name. Column names are accessible from keyboard tab index.  
	Can show only checked, unchecked or both.  Download selected includes unseen pages.  
	Optional column filters dynamically created, with clear 'AND' / 'OR' choice.  
	Per-column filter search method is clear and at user's choice for text/regex, case sensitive/insensitive, inclusive/exclusive.
# Examples:
	?period-preset=last-quarter&page-size=0&search-submit#search-results  
# References:
	"A practical guide to MFT automation.pdf" > "Portal website design"  
	https://dev.to/popoolatopzy/how-to-convert-html-table-to-csv-file-14p3  
	https://www.geeksforgeeks.org/checksum-algorithms-in-javascript/#crc-cyclic-redundancy-check  
	https://www.svgrepo.com/svg/521156/home-4  
	https://www.w3schools.com/js/js_cookies.asp  
# Notes:
	Form input fields which might be "required" in production are "notrequired" here for easier demonstration.  
# Work in progress:
	Should add ISO8601 weeks E.g. (1995-W03) which may be useful for retail & hospitality.  
	Get lang-pref from cookie or GET params is work-in-progress.  
	Basket
		to build up selection across multiple different query criteria.
		"Download selected n" -> "Add selected n to basket" ... 
		separate page?  No date selector or column filters.
		would that be too disconnected from the page in front of the data?
	GET params to include: sort col number, col filters
	Distinguish which col was last sorted by & which direction
	Back-end simulation:
		delay between submitting search request & receiving search results
		Make async so we can show the user an hourglass or similar.  Promise? WebWorker in separate JS file?
	Only un-hide cookie save/delete if the lang-pref drop-down has been used
	Consider: automatically populate lang-pref in HTML from those available in JS
	Sub-function to build-up full record set by repeated requests of limited size?  Should be up to the implementer.
