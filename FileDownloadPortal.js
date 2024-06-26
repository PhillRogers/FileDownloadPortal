// console.log('__LINE__1 ');
var js_ver = "2024-05-29c";
var period_preset = ''; // remember last button pressed
var page_num = 0;
var page_max = 0;
var page_size = 0;
var sort_col = 0; // index from 1
var record_ary = []; // data records indexed from 1 as 0 contains the column header row
var shown = 'both' // checked unchecked both
var filter_enabled = false;
init_event_handlers();
function init_event_handlers(){
	window.addEventListener("load", body_load, false);
	document.getElementById("iso-period").addEventListener("change", update_period_fromhtml, false);
	document.getElementById("last-month").addEventListener("click", update_period_fromhtml, false);
	document.getElementById("last-quarter").addEventListener("click", update_period_fromhtml, false);
	document.getElementById("last-year").addEventListener("click", update_period_fromhtml, false);
	document.getElementById("since-som").addEventListener("click", update_period_fromhtml, false);
	document.getElementById("since-soq").addEventListener("click", update_period_fromhtml, false);
	document.getElementById("since-soy").addEventListener("click", update_period_fromhtml, false);
	document.getElementById("since-creation").addEventListener("click", update_period_fromhtml, false);
	document.getElementById("first-date").addEventListener("change", update_period_fromhtml, false);
	document.getElementById("last-date").addEventListener("change", update_period_fromhtml, false);
	document.getElementById("lang-pref").addEventListener("click", update_lang_fromhtml, false);
	document.getElementById("cookie-save").addEventListener("click", update_cookies_fromhtml, false);
	document.getElementById("cookie-delete").addEventListener("click", update_cookies_fromhtml, false);
	document.getElementById("filter-enable").addEventListener("click", update_filter_fromhtml, false);
	document.getElementById("copy-link").addEventListener("click", copy_link, false);
	document.getElementById("search-submit").addEventListener("click", search_submit_fromhtml, false);
	document.getElementById("page-size").addEventListener("change", update_page_size_fromhtml, false);
	for(let pnl of document.getElementsByName("page-nav-link")){
		pnl.addEventListener('click', proc_page_nav_link_fromhtml, false);
	}
	document.getElementById("select-all").addEventListener("click", update_selected_fromhtml, false);
	document.getElementById("select-none").addEventListener("click", update_selected_fromhtml, false);
	document.getElementById("select-inverse").addEventListener("click", update_selected_fromhtml, false);
	document.getElementById("shown-checked").addEventListener("click", update_shown_fromhtml, false);
	document.getElementById("shown-unchecked").addEventListener("click", update_shown_fromhtml, false);
	document.getElementById("shown-both").addEventListener("click", update_shown_fromhtml, false);
	document.getElementById("download-all").addEventListener("click", do_download_fromhtml, false);
	document.getElementById("download-selected").addEventListener("click", do_download_fromhtml, false);
	document.getElementById("results-list").addEventListener("click", download_table_as_csv, false);
}
function body_load(){
	document.getElementById("js-ver").value = js_ver;
    if(true){
		let today = new Date().toJSON().split('T')[0];
		let year = parseInt(today.split('-')[0]);
		let month = parseInt(today.split('-')[1]);
		let quarter = Math.ceil(month /3);
		let iso_period = "";
		let first_date = '';
		let last_date = '';
		document.getElementById("iso-period").value = iso_period;
		document.getElementById("first-date").value = today;
		document.getElementById("last-date").value = today;
	}
	if(false){ // cookie
		console.log(`__LINE__59 DocumentCookie-=>${document.cookie}<=-`);
		let lang_pref = " "+getCookie("lang-pref")+" ";
		console.log(`__LINE__61 lp-=>${lang_pref}<=-`);
		if(" en fr ".includes(lang_pref) ){
			document.getElementById('lang-pref').value = lang_pref;
			console.log('__LINE__64 ');
			update_lang_fromjs(document.getElementById('lang-pref'));
			console.log('__LINE__66 ');
		}
	}
	if(window.location.search.length >0){ // should do some validation on each
		const urlParams = new URLSearchParams(window.location.search);
		if(urlParams.has('first-date')){
			first_date = urlParams.get('first-date');
			document.getElementById("first-date").value = first_date;
			update_period_fromjs(document.getElementById("first-date"));
		}
		if(urlParams.has('last-date')){
			last_date = urlParams.get('last-date');
			document.getElementById("last-date").value = last_date;
			update_period_fromjs(document.getElementById("last-date"));
		}
		if(urlParams.has('iso-period')){
			iso_period = urlParams.get('iso-period');
			document.getElementById("iso-period").value = iso_period;
			update_period_fromjs(document.getElementById("iso-period"));
		}
		if(urlParams.has('period-preset')){
			period_preset = urlParams.get('period-preset');
			update_period_fromjs(document.getElementById(period_preset));
		}
		if(urlParams.has('lang-pref')){
			let lang_pref = urlParams.get('lang-pref');
			document.getElementById('lang-pref').value = lang_pref;
			update_lang_fromjs(document.getElementById('lang-pref'));
		}
		if(urlParams.has('page-size')){
			page_size = parseInt( urlParams.get('page-size') );
			document.getElementById("page-size").value = page_size.toString();
		}
		if(urlParams.has('search-submit')){
			search_submit_fromjs();
			// DeBug: does not get search results. Consider as a promise, after loading has settled?
		}
	}
}
function update_filter_fromhtml(){
	update_filter_fromjs(this);
}
function update_filter_fromjs(caling_element){
	filter_enabled = document.getElementById('filter-enable').checked;
	let dl = document.getElementById('query-fields');
	if(filter_enabled){
		document.getElementById('filter-logic-radio').style.display = "inline";
		let col_names = ['Check'];
		response_json_txt = back_end_interface(''); // call back-end search to get array of just header row.
		let jo = JSON.parse(response_json_txt);
		for(let col_name in jo.records[0]) col_names.push(col_name);
		record_ary.push(col_names);
		let num_cols = record_ary[0].length;
		if(true){ // just using "dl.innerHTML += " breaks the date selectors.
			let new_dt = document.createElement("dt"); dl.appendChild(new_dt);
			new_dt.setAttribute("name", "filter");
			new_dt.innerHTML = '<b>Filters:</b>';
			let new_dd = document.createElement("dd"); dl.appendChild(new_dd);
			new_dd.setAttribute("name", "filter");
			new_dd.innerHTML = '<small>Enter the exact text which must appear in the record field ... </small>';
			for(let col_idx=1; col_idx < num_cols; col_idx++){
				let new_dt = document.createElement("dt"); dl.appendChild(new_dt);
				new_dt.setAttribute("name", "filter");
				new_dt.innerHTML = record_ary[0][col_idx];
				let new_dd = document.createElement("dd"); dl.appendChild(new_dd);
				new_dd.setAttribute("name", "filter");
				new_dd.innerHTML = `<input type="text" value="" name="filter-input" id="filter-${col_idx}-pattern" title="filter on ${col_idx}"/>`;
				new_dd.innerHTML += `
				<span id="filter-${col_idx}-radio">Method:
					<label for="filter-${col_idx}-text">Text</label><input type="radio" name="filter-${col_idx}-method" id="filter-${col_idx}-text" value="Text" checked />
					<label for="filter-${col_idx}-regex">RegEx</label><input type="radio" name="filter-${col_idx}-method" id="filter-${col_idx}-regex" value="RegEx" />
				</span>`;
				new_dd.innerHTML += `&nbsp;<label for="filter-${col_idx}-ignorecase">Ignore case:</label><input type="checkbox" id="filter-${col_idx}-ignorecase" />`;
				new_dd.innerHTML += `&nbsp;<label for="filter-${col_idx}-exclude">Exclude:</label><input type="checkbox" id="filter-${col_idx}-exclude" />`;
			}
		}
	} else {
		document.getElementById('filter-logic-radio').style.display = "none";
		while(fe = document.getElementsByName("filter")[0]){ fe.remove(); }
	}
}
function update_period_fromhtml(){
	update_period_fromjs(this);
}
function update_period_fromjs(calling_element){
	let today = new Date().toJSON().split('T')[0];
	let year = parseInt(today.split('-')[0]);
	let month = parseInt(today.split('-')[1]);
	let day = parseInt(today.split('-')[2]);
	let quarter = Math.ceil(month /3);
	let iso_period = '';
	let first_date = '';
	let last_date = '';
	let last_day_of_month = 0;

    switch(calling_element.id){
		case "iso-period": if(true){
			const new_val = document.getElementById("iso-period").value.trim().toUpperCase().replace(/-/g, '')
			iso_period = "";
			if(new_val.length == 4){
				year = parseInt(new_val);
				iso_period = `${year}`;
				first_date = `${year}-01-01`;
				last_date = `${year}-12-31`;
				document.getElementById("first-date").value = first_date;
				document.getElementById("last-date").value = last_date;
				document.getElementById("iso-period").value = iso_period;
			} else {
				year = parseInt(new_val.substring(0, 4));
				if(new_val.substring(4, 5) == "Q"){
					quarter = parseInt(new_val.substring(5, 6));
					iso_period = `${year}-Q${quarter}`;
					let eoqm = quarter * 3;
					let soqm = eoqm - 2;
					last_day_of_month = new Date(year, eoqm, 0).getDate();
					first_date = `${year}-${soqm.toString().padStart(2,"0")}-01`;
					last_date = `${year}-${eoqm.toString().padStart(2,"0")}-${last_day_of_month}`;
					document.getElementById("first-date").value = first_date;
					document.getElementById("last-date").value = last_date;
					document.getElementById("iso-period").value = iso_period;
				} else {
					month = parseInt(new_val.substring(4, 6));
					iso_period = `${year}-${month.toString().padStart(2,"0")}`;
					last_day_of_month = new Date(year, month, 0).getDate();
					first_date = `${year}-${month.toString().padStart(2,"0")}-01`;
					last_date = `${year}-${month.toString().padStart(2,"0")}-${last_day_of_month}`;
					document.getElementById("first-date").value = first_date;
					document.getElementById("last-date").value = last_date;
					document.getElementById("iso-period").value = iso_period;
				}
			}
			period_preset = '';
			break;
		}
		case "last-month": if(true){
			month--;
			if(month == 0){
				month = 12;
				year--;
			}
			iso_period = `${year}-${month.toString().padStart(2,"0")}`;
			last_day_of_month = new Date(year, month, 0).getDate();
			first_date = `${year}-${month.toString().padStart(2,"0")}-01`;
			last_date = `${year}-${month.toString().padStart(2,"0")}-${last_day_of_month}`;
			document.getElementById("iso-period").value = iso_period;
			document.getElementById("first-date").value = first_date;
			document.getElementById("last-date").value = last_date;
			period_preset = calling_element.id;
			break;
		}
		case "last-quarter": if(true){
			if(quarter == 1){
				quarter = 4;
				year--;
			} else {
				quarter--;
			}
			iso_period = `${year}-Q${quarter}`;
			let eoqm = quarter * 3;
			let soqm = eoqm - 2;
			last_day_of_month = new Date(year, eoqm, 0).getDate();
			first_date = `${year}-${soqm.toString().padStart(2,"0")}-01`;
			last_date = `${year}-${eoqm.toString().padStart(2,"0")}-${last_day_of_month}`;
			document.getElementById("iso-period").value = iso_period;
			document.getElementById("first-date").value = first_date;
			document.getElementById("last-date").value = last_date;
			period_preset = calling_element.id;
			break;
		}
		case "last-year": if(true){
			year--;
			iso_period = `${year}`;
			first_date = `${year}-01-01`;
			last_date = `${year}-12-31`;
			document.getElementById("iso-period").value = iso_period;
			document.getElementById("first-date").value = first_date;
			document.getElementById("last-date").value = last_date;
			period_preset = calling_element.id;
			break;
		}
		case "since-som": if(true){
			first_date = `${year}-${month.toString().padStart(2,"0")}-01`;
			document.getElementById("first-date").value = first_date;
			document.getElementById("last-date").value = today;
			iso_period = get_iso_period_from_date_range(first_date, today);
			document.getElementById("iso-period").value = iso_period;
			period_preset = calling_element.id;
			break;
		}
		case "since-soq": if(true){
			let eoqm = quarter * 3;
			let soqm = eoqm - 2;
			last_day_of_month = new Date(year, month, 0).getDate();
			iso_period = "";
			if(month == eoqm && day == last_day_of_month){
				iso_period = `${year}Q${quarter}`;
			}
			first_date = `${year}-${soqm.toString().padStart(2,"0")}-01`;
			last_date = `${year}-${month.toString().padStart(2,"0")}-${day.toString().padStart(2,"0")}`;
			document.getElementById("first-date").value = first_date;
			document.getElementById("last-date").value = last_date;
			iso_period = get_iso_period_from_date_range(first_date, last_date);
			document.getElementById("iso-period").value = iso_period;
			period_preset = calling_element.id;
			break;
		}
		case "since-soy": if(true){
			first_date = `${year}-01-01`;
			document.getElementById("first-date").value = first_date;
			document.getElementById("last-date").value = today;
			iso_period = get_iso_period_from_date_range(first_date, today);
			document.getElementById("iso-period").value = iso_period;
			period_preset = calling_element.id;
			break;
		}
		case "since-creation": if(true){
			first_date = "1970-01-01";
			document.getElementById("first-date").value = first_date;
			document.getElementById("last-date").value = today;
			iso_period = get_iso_period_from_date_range(first_date, today);
			document.getElementById("iso-period").value = iso_period;
			period_preset = calling_element.id;
			break;
		}
		case "first-date": if(true){
			first_date = document.getElementById("first-date").value;
			last_date = document.getElementById("last-date").value;
			if( Date.parse(first_date) > Date.parse(last_date) ){
				document.getElementById("last-date").style.color = "red";
				document.getElementById("first-date").style.color = "black";
			} else {
				document.getElementById("first-date").style.color = "black";
				document.getElementById("last-date").style.color = "black";
			}
			iso_period = get_iso_period_from_date_range(first_date, last_date);
			document.getElementById("iso-period").value = iso_period;
			period_preset = '';
			break;
		}
		case "last-date": if(true){
			first_date = document.getElementById("first-date").value;
			last_date = document.getElementById("last-date").value;
			if( Date.parse(first_date) > Date.parse(last_date) ){
				document.getElementById("first-date").style.color = "red";
				document.getElementById("last-date").style.color = "black";
			} else {
				document.getElementById("first-date").style.color = "black";
				document.getElementById("last-date").style.color = "black";
			}
			iso_period = get_iso_period_from_date_range(first_date, last_date);
			document.getElementById("iso-period").value = iso_period;
			period_preset = '';
			break;
		}
	}
}
function get_iso_period_from_date_range(first_date, last_date){
	let iso_period = '';
	let sodt = new Date(first_date);
	let eodt = new Date(last_date);
	let fd_y = sodt.getFullYear();
	let fd_m = sodt.getMonth()+1;
	let fd_d = sodt.getDate();
	let ld_y = eodt.getFullYear();
	let ld_m = eodt.getMonth()+1;
	let ld_d = eodt.getDate();
	let ld_ldom = new Date(ld_y, ld_m, 0).getDate(); // last day of the month
	if(!iso_period && ( fd_y != ld_y )){ iso_period = "-1"; }
	if(!iso_period && ( fd_d != 1 )){ iso_period = "-2"; }
	if(!iso_period && ( ld_d != ld_ldom )){ iso_period = "-3"; }
	if(!iso_period && ( eodt <= sodt )){ iso_period = "-4"; }
	if(!iso_period && ( fd_m == 1 && ld_m == 12 )){ iso_period = fd_y.toString(); }
	if(!iso_period && ( fd_m == ld_m )){ iso_period = `${fd_y.toString()}-${fd_m.toString().padStart(2,"0")}`; }
	if(!iso_period && ( (ld_m - fd_m) != 2 )){ iso_period = "-5"; }
	if(!iso_period && ( !(ld_m % 3) )){ iso_period = `${ld_y.toString()}-Q${(ld_m/3).toString()}`; }
	if(iso_period.substring(0,1) == '-'){ iso_period = ''; }
	return iso_period;
}
function update_lang_fromhtml(){
	update_lang_fromjs(this);
}
function update_lang_fromjs(calling_element){
	switch(calling_element.value){
		case "en": if(true){
			document.querySelector("#search-criteria > h3").innerText = "Search criteria"; 
			document.querySelector("#search-summary > h3").innerText = "Search summary";
			document.querySelector("#search-results > h3").innerText = "Search results";
			document.querySelector("#date-range\\\" > dt:nth-child(1) > label").innerText = "Accounting period:";
			document.querySelector("#date-range\\\" > dt:nth-child(3) > label").innerText = "Date of first day within period range:";
			document.querySelector("#date-range\\\" > dt:nth-child(5) > label").innerText = "Date of last day within period range:";
			document.querySelector("#page-nav-top > label").innerText = "Page size:";
			document.querySelector("#last-month").value = "Last month";
			document.querySelector("#last-quarter").value = "Last quarter";
			document.querySelector("#last-year").value = "Last year";
			document.querySelector("#since-som").value = "Since SOM";
			document.querySelector("#since-soq").value = "Since SOQ";
			document.querySelector("#since-soy").value = "Since SOY";
			document.querySelector("#since-creation").value = "Since creation";
			document.querySelector("#copy-link").innerText = "Copy link";
			document.querySelector("#select-all").innerText = "All";
			document.querySelector("#select-none").innerText = "None";
			document.querySelector("#select-inverse").innerText = "Invert";
			break;
		}
		case "fr": if(true){
			document.querySelector("#search-criteria > h3").innerText = "Critères de recherche"; 
			document.querySelector("#search-summary > h3").innerText = "Résumé de la recherche";
			document.querySelector("#search-results > h3").innerText = "Résultats de recherche";
			document.querySelector("#date-range\\\" > dt:nth-child(1) > label").innerText = "Période comptable:";
			document.querySelector("#date-range\\\" > dt:nth-child(3) > label").innerText = "Date du premier jour dans la plage de périodes:";
			document.querySelector("#date-range\\\" > dt:nth-child(5) > label").innerText = "Date du dernier jour dans la plage de périodes:";
			document.querySelector("#page-nav-top > label").innerText = "Taille de la page:";
			document.querySelector("#last-month").value = "Le mois dernier";
			document.querySelector("#last-quarter").value = "Dernier quart";
			document.querySelector("#last-year").value = "L'année dernière";
			document.querySelector("#since-som").value = "Depuis le début du mois";
			document.querySelector("#since-soq").value = "Depuis le début du trimestre";
			document.querySelector("#since-soy").value = "Depuis le début de l'année";
			document.querySelector("#since-creation").value = "Depuis la création";
			document.querySelector("#copy-link").innerText = "Copier le lien";
			document.querySelector("#select-all").innerText = "Toute";
			document.querySelector("#select-none").innerText = "Aucune";
			document.querySelector("#select-inverse").innerText = "Inverse";
			break;
		}
	}
}
function update_cookies_fromhtml(){
	update_cookies_fromjs(this);
}
function update_cookies_fromjs(calling_element){
	console.log(`__LINE__391 DocumentCookie-=>${document.cookie}<=-`);
    switch(calling_element.id){
		case "cookie-save": if(true){
			console.log('__LINE__394 ');
			let lang_pref = document.getElementById('lang-pref').value;
			setCookie("lang-pref", lang_pref, 365);
			break;
		}
		case "cookie-delete": if(true){
			console.log('__LINE__400 ');
			setCookie("lang-pref", "", 0);
			break;
		}
	}
	console.log(`__LINE__405 DocumentCookie-=>${document.cookie}<=-`);
}
function copy_link(){
	navigator.clipboard.writeText('');
	let iso_period = document.getElementById("iso-period").value;
	let first_date = document.getElementById("first-date").value;
	let last_date = document.getElementById("last-date").value;
	let lang_pref = document.getElementById("lang-pref").value;
	let direct_url = window.location.href;
	if(direct_url.includes('#')){ direct_url = direct_url.split('#')[0]; }
	if(direct_url.includes('?')){ direct_url = direct_url.split('?')[0]; }
	direct_url += '?';
	// direct_url += `lang-pref=${lang_pref}&`; 
	if(period_preset){
		direct_url += `period-preset=${period_preset}&`;
	} else {
		if(iso_period){
			direct_url += `iso-period=${iso_period}&`;
		} else {
			if(first_date){ direct_url += `first-date=${first_date}&`; }
			if(last_date){ direct_url += `last-date=${last_date}&`; }
		}
	}
	direct_url = direct_url.slice(0,-1);
	navigator.clipboard.writeText(direct_url);
}
function search_submit_fromhtml(){
	search_submit_fromjs(this);
	event.preventDefault();
}
function search_submit_fromjs(submited){
	document.getElementById("search-summary").style.display = "block";
	const elapsed_time = Date.parse(document.getElementById("last-date").value) - Date.parse(document.getElementById("first-date").value) ;
	const num_days = 1 + Math.round(elapsed_time / (1000 * 60 * 60 * 24));
	document.getElementById("num-days").textContent = num_days;
	document.getElementById("num-recs").textContent = "0";
	page_size = document.getElementById("page-size").value;
	// want the display up-to-date here, before we wait for the results.
	document.getElementById("search-results").getElementsByTagName("thead")[0].replaceChildren(); // clear previous results if re-submitting with modified criteria
	document.getElementById("search-results").getElementsByTagName("tbody")[0].replaceChildren(); // clear previous results if re-submitting with modified criteria
	document.getElementById("search-results").getElementsByTagName("tfoot")[0].style.display = "none";
	if(record_ary.length > 1){ record_ary = record_ary.slice(0,1); }

	// simplified example ... 
	let col_names = ['Check'];
	let query = '?first-date='+ document.getElementById("first-date").value +'&last-date='+ document.getElementById("last-date").value
	if(filter_enabled){ // filters
		let filter_logic = document.querySelector('input[name="filter-logic"]:checked').value;
		query += `&filter-logic=${filter_logic}`;
		let num_cols = document.getElementsByName("filter-input").length;
		for(let col_idx = 1; col_idx <= num_cols; col_idx++){
			let f_pattern = document.getElementById(`filter-${col_idx}-pattern`).value;
			if(f_pattern != ""){ query += `&filter-${col_idx}-pattern=${f_pattern}`; }
			let f_method = document.querySelector('input[name="'+`filter-${col_idx}-method`+'"]:checked').value;
			if(f_method != ""){ query += `&filter-${col_idx}-method=${f_method}`; }
			let f_ignorecase = document.getElementById(`filter-${col_idx}-ignorecase`).checked;
			if(f_ignorecase != ""){ query += `&filter-${col_idx}-ignorecase=${f_ignorecase}`; }
			let f_exclude = document.getElementById(`filter-${col_idx}-exclude`).checked;
			if(f_exclude != ""){ query += `&filter-${col_idx}-exclude=${f_exclude}`; }
		}
	}
	// console.log(`__LINE__469 -=>${query}<=-`);
	record_ary = [];
	response_json_txt = back_end_interface(query); // call back-end search to get array of results.
	let jo = JSON.parse(response_json_txt);
	for(let col_name in jo.records[0]) col_names.push(col_name);
	record_ary.push(col_names);
	for(let row_idx in jo.records) {
		let fld_ary = []
		for(let col_idx in col_names ) {
			let col_name = col_names[col_idx];
			if(col_idx == 0) {
				fld_ary.push('');
			} else {
				fld_ary.push( Object.values(jo.records[row_idx])[col_idx -1] );
			}
		}
		record_ary.push(fld_ary);
	}

	let num_recs = record_ary.length -1;
	if(num_recs > 0){ // render table of results
		// consider pre-pending a column for checked state
		render_table();
		document.getElementById("skip-to-content").style.display = "inline";
		document.getElementById("search-results").style.display = "block";
		document.getElementById("search-results").getElementsByTagName("tfoot")[0].style.display = "block";
		// the visibility of tfoot can be tested to ensure the whole table has finished loading
	} // handle zero results with grace.
}
function back_end_interface(query){ // basic simulation of a back-end database query
	let json_txt = '';
	// console.log(`__LINE__503 -=>${query}<=-`);
	if(query){ 
		// replace with your own code to send the request and get the response
		const backendParams = new URLSearchParams(query);
		const first_date = backendParams.get('first-date');
		const last_date = backendParams.get('last-date');
		const elapsed_time = Date.parse(last_date) - Date.parse(first_date);
		const num_days = 1 + Math.round(elapsed_time / (1000 * 60 * 60 * 24));
		json_txt = '{ "records" : [ ';
		let rec_count = 0;
		let f_logic = backendParams.get('filter-logic');
		let f1_pattern = backendParams.get('filter-1-pattern');
		let f1_method = backendParams.get('filter-1-method');
		let f1_ignorecase = (backendParams.get('filter-1-ignorecase') == "true");
		let f1_exclude = (backendParams.get('filter-1-exclude') == "true");
		let f2_pattern = backendParams.get('filter-2-pattern');
		let f2_method = backendParams.get('filter-2-method');
		let f2_ignorecase = (backendParams.get('filter-2-ignorecase') == "true");
		let f2_exclude = (backendParams.get('filter-2-exclude') == "true");
		if( f1_ignorecase || f2_ignorecase || f1_exclude || f2_exclude || (f1_method && f1_method.toLowerCase()=="regex") || (f2_method && f2_method.toLowerCase()=="regex") ){
			let msg = "Simulated back-end only does inclusive case-sensitive text matching.";
			setTimeout(function(){ alert(msg); },1); // window.status = msg; // modern browsers hide the status bar :-(
		}
		for(let day_idx=0; day_idx < num_days; day_idx++){
			if( Math.random() >0.4 ){ // 0.4 = 60% chance a file is available. Use 0.0 for all rows, making off-by-one issues easier to spot.
				let date_stamp = (new Date(Date.parse(first_date) + (day_idx * 1000 * 60 * 60 * 24)).toISOString()).split('T')[0];
				// let download_link = `Example_${date_stamp}.pdf`
				let download_link = `http://downloads/Example_${date_stamp}.`;
				if( Math.random() >0.8 ){ download_link += 'xlsx'; } else { download_link += 'pdf'; }
				let other_info = calculateCRC(download_link.split('/').slice(-1)[0]).toString();
				let matches_filters = true;

				if(f_logic){
					if(f_logic == "and"){
						matches_filters = true;
						if(f1_pattern) if(!(other_info.includes(f1_pattern))) matches_filters = false;
						if(f2_pattern) if(!(download_link.includes(f2_pattern))) matches_filters = false;
					}
					if(f_logic == "or"){
						matches_filters = false;
						if(f1_pattern) if(other_info.includes(f1_pattern)) matches_filters = true;
						if(f2_pattern) if(download_link.includes(f2_pattern)) matches_filters = true;
					}
				}

				if(matches_filters){
					json_txt += `{ "Other info":"${other_info}", "Report download":"${download_link}" },`;
					rec_count++;
				}
			}
		}
		if(rec_count > 0){ json_txt = json_txt.trim().slice(0,-1); }
		json_txt += ' ]}';
	} else {
		json_txt = '{ "records" : [ { "Other info":"", "Report download":"" } ]}';
	}
	let validate_jo = JSON.parse(json_txt); // tilt here if it fails basic validation
	return json_txt;
}
function render_table(){
	let num_recs = record_ary.length -1;
	let num_cols = record_ary[0].length;
	const thead = document.getElementById("search-results").getElementsByTagName("thead")[0];
	const tbody = document.getElementById("search-results").getElementsByTagName("tbody")[0];
	const tfoot = document.getElementById("search-results").getElementsByTagName("tfoot")[0];
	tfoot.style.display = "none";
	thead.replaceChildren();
	tbody.replaceChildren();
	document.getElementById("search-wip").textContent = '';
	document.getElementById("num-recs").textContent = num_recs.toString();
	let filename_all = `SearchResults_${new Date().toISOString().replace(/[.:-]/g,"")}.zip`;
	document.getElementById("download-all").textContent = filename_all;
	if(true){ // thead
		let HeadRow = thead.insertRow();
		for(let col_idx=0; col_idx < num_cols; col_idx++){
			// HeadRow.innerHTML += `<th name="column-head" id="column-head-${col_idx}" onclick="update_sorting_fromjs(this)" title="sort by ${col_idx}" >${record_ary[0][col_idx]}</th>`;
			// HeadRow.innerHTML += `<th><button type="button" name="column-head" id="column-head-${col_idx}" onclick="update_sorting_fromjs(this)" title="sort by ${col_idx}" >${record_ary[0][col_idx]}</button></th>`;
			HeadRow.innerHTML += `<th><a class="column-head" id="column-head-${col_idx}" href="#" onclick="update_sorting_fromjs(this)" title="sort by ${col_idx}" >${record_ary[0][col_idx]}</a></th>`;
		}
	}
	if(true){ // tfoot
		tfoot.innerHTML = `<tr><td colspan="${num_cols +1}"><small>End of list.</small></td></tr>`;
		tfoot.style.textAlign = "center"; // centering under the table doesn't work
	}
	page_size = parseInt(document.getElementById("page-size").value);
	let page_nav_summary = document.getElementById("page-nav-summary");
	page_nav_summary.style.display = "inline";
	if(page_size == 0){
		// hide pagination navigation
		document.getElementById("page-nav-links").style.display = "none";
		page_num = 1;
		page_max = 1;
		let page_row_first = 1;
		let page_row_last = num_recs;
		document.getElementById("page-nav-page-num").innerText = page_num.toString();
		document.getElementById("page-nav-page-max").innerText = page_max.toString();
		render_table_rows(tbody,page_row_first,page_row_last);
	} else {
		// reveal pagination navigation
		document.getElementById("page-nav-links").style.display = "block";
		if(page_num == 0) { page_num = 1; }
		page_max = Math.ceil(num_recs / page_size);
		let page_row_first = (page_num * page_size) - page_size +1;
		let page_row_last = page_row_first + page_size -1;
		if(page_row_last > num_recs){ page_row_last = num_recs; }
		document.getElementById("page-nav-page-num").innerText = page_num.toString();
		document.getElementById("page-nav-page-max").innerText = page_max.toString();
		render_table_rows(tbody,page_row_first,page_row_last);
	}
	tfoot.style.display = "block";
}
function render_table_rows(tbody,page_row_first,page_row_last){
	let num_recs = record_ary.length -1;
	let num_cols = record_ary[0].length;
	document.getElementById("page-nav-rec-first").innerText = page_row_first.toString();
	document.getElementById("page-nav-rec-last").innerText = page_row_last.toString();
	document.getElementById("page-nav-rec-max").innerText = num_recs.toString();
	tbody.replaceChildren(); // clear all table rows

	for(let row_idx=page_row_first; row_idx <= page_row_last; row_idx++){
		let newRow = tbody.insertRow();
		newRow.setAttribute("name", "results-row-"+row_idx.toString());
		for(let col_idx=0; col_idx < num_cols; col_idx++){
			let checked = false;
			if(record_ary[row_idx][0] == "x") checked = true;
			let wanted = true;
			if( checked && (shown == 'unchecked') ) wanted = false;
			if( !checked && (shown == 'checked') ) wanted = false;
			if(wanted) {
				let Cell = newRow.insertCell();
				if(col_idx == 0){ // check-boxes
					Cell.innerHTML = `<input type="checkbox" name="download-check" id="download-check-${row_idx}" onclick="update_selected_fromjs(this)" title="download check ${row_idx}" >`;
					Cell.getElementsByTagName("input")[0].checked = checked;
					let newCheckText = document.createElement("label"); Cell.appendChild(newCheckText);
					newCheckText.setAttribute("name", "download-checktext");
					newCheckText.setAttribute("for", "download-check-"+row_idx.toString());
					newCheckText.setAttribute("style", "font-size:0px"); // do not display but include in CSV
				} else {
					let cell_content = record_ary[row_idx][col_idx]
					if( cell_content.toLowerCase().match('^[a-z]+:\/\/') ){ // looks like a link
							let newLink = document.createElement("a"); Cell.appendChild(newLink);
							newLink.innerHTML = cell_content.split('/').slice(-1)[0];
							newLink.setAttribute("name", "download-link");
							newLink.setAttribute("id", "download-link-"+row_idx.toString());
							newLink.setAttribute("href", "#");
							newLink.setAttribute("onclick", "do_download_fromjs(this)");
					} else {
							let newTD = document.createElement("a"); Cell.appendChild(newTD);
							newTD.innerHTML = cell_content;
					}
				}
			}
		}
	}
	let selected_count = 0;
	for(let rec_idx=1; rec_idx <= num_recs; rec_idx++){
		if(record_ary[rec_idx][0] == "x") selected_count++;
	}
	document.getElementById("download-selected").innerHTML = "&nbsp;"+selected_count.toString()+"&nbsp;";
}
function update_page_size_fromhtml(){
	update_page_size_fromjs(this);
}
function update_page_size_fromjs(calling_element){
	let num_recs = record_ary.length -1;
	page_size = parseInt(document.getElementById("page-size").value);
	document.getElementById("page-size").value = page_size;
	if(num_recs > 0){
		page_num = 1;
		document.getElementById("page-goto").value = page_num;
		render_table();
	}
}
function update_sorting_fromjs(calling_element){
	let headonly = [ record_ary[0] ];
	let headless_ary = record_ary.slice(1);
    let prev_sort_col = sort_col;
	let sort_char = "";
	sort_col = parseInt(calling_element.id.split('-')[2]) +1;
	if(false){ // distinguish which column is sorted by
		// clear column sorting indicators
		// for(let ch of document.getElementsByName("column-head")) ch.style.color = "red";
		// for(let ch of document.getElementsByName("column-head")) ch.style.fontWeight = "normal";
		// document.getElementById(`column-head-${sort_col -1}`).style.fontStyle = "italic";
	}
	headless_ary.sort(sort_function);
	if(sort_col == prev_sort_col) sort_col = 0 - sort_col;
	if(sort_col < 0) {
		headless_ary = headless_ary.reverse();
		sort_char = "^";
	} else {
		sort_char = "v";
	}
	record_ary = headonly.concat(headless_ary);
	render_table();
}
function sort_function(a, b){
	let sort_col_idx = Math.abs(sort_col) -1;
    if(a[sort_col_idx] === b[sort_col_idx]) {
		return 0;
    } else {
		return (a[sort_col_idx] < b[sort_col_idx]) ? -1 : 1;
    }
}
function proc_page_nav_link_fromhtml(){
	proc_page_nav_link_fromjs(this);
	event.preventDefault();
}
function proc_page_nav_link_fromjs(calling_element){
	let num_recs = record_ary.length -1;
    switch(calling_element.id){
		case "page-nav-link-all": if(true){
			document.getElementById("page-size").value = "0";
			render_table();
			break;
		}
		case "page-nav-link-first": if(true){
			if(page_num > 1){
				page_num = 1;
				render_table();
			}
			break;
		}
		case "page-nav-link-last": if(true){
			if(page_num < page_max){
				page_num = page_max;
				render_table();
			}
			break;
		}
		case "page-nav-link-prev": if(true){
			if(page_num > 1){
				page_num -= 1;
				render_table();
			}
			break;
		}
		case "page-nav-link-next": if(true){
			if(page_num < page_max){
				page_num += 1;
				render_table();
			}
			break;
		}
		case "page-nav-link-goto": if(true){
			let page_requested = parseInt(document.getElementById("page-goto").value);
			if(page_requested == 0){
				page_size = num_recs;
				document.getElementById("page-size").value = page_size;
				page_requested = 1;
			}
			if( (page_requested >= 1) && (page_requested <= page_max) ){
				page_num = page_requested;
				render_table();
			}
			break;
		}
	}
}
function update_selected_fromhtml(){
	update_selected_fromjs(this);
}
function update_selected_fromjs(calling_element){
	let num_recs = record_ary.length -1;
    if(calling_element.type == "checkbox"){
		let rec_idx = parseInt(calling_element.id.split('-')[2]);
		if(calling_element.checked){
			calling_element.parentElement.getElementsByTagName("label")[0].innerText = "x";
			record_ary[rec_idx][0] = "x";
		} else {
			calling_element.parentElement.getElementsByTagName("label")[0].innerText = " ";
			record_ary[rec_idx][0] = "";
		}
	} else {
		switch(calling_element.id){
			case "select-all": if(true){
				for(let rec_idx=1; rec_idx <= num_recs; rec_idx++){
					let check_box = document.getElementById(`download-check-${rec_idx}`);
					if(check_box){
						check_box.checked = true;
						check_box.parentElement.getElementsByTagName("label")[0].innerText = "x";
						record_ary[rec_idx][0] = "x";
					}
				}
				break;
			}
			case "select-none": if(true){
				for(let rec_idx=1; rec_idx <= num_recs; rec_idx++){
					let check_box = document.getElementById(`download-check-${rec_idx}`);
					if(check_box){
						check_box.checked = false;
						check_box.parentElement.getElementsByTagName("label")[0].innerText = "";
						record_ary[rec_idx][0] = "";
					}
				}
				break;
			}
			case "select-inverse": if(true){
				for(let rec_idx=1; rec_idx <= num_recs; rec_idx++){
					let check_box = document.getElementById(`download-check-${rec_idx}`);
					check_box.checked = ! check_box.checked;
					if(check_box){
						if(check_box.checked){
							check_box.parentElement.getElementsByTagName("label")[0].innerText = "x";
							record_ary[rec_idx][0] = "x";
						} else {
							check_box.parentElement.getElementsByTagName("label")[0].innerText = "";
							record_ary[rec_idx][0] = "";
						}
					}
				}
				break;
			}
		}
	}
	let selected_count = 0;
	for(let rec_idx=1; rec_idx <= num_recs; rec_idx++){
		if(record_ary[rec_idx][0] == "x") selected_count++;
	}
	document.getElementById("download-selected").innerHTML = "&nbsp;"+selected_count.toString()+"&nbsp;";
}
function update_shown_fromhtml(){
	update_shown_fromjs(this);
}
function update_shown_fromjs(calling_element){
	shown = calling_element.id.split('-')[1];
	render_table();
}
function do_download_fromhtml(){
	do_download_fromjs(this);
}
function do_download_fromjs(calling_element){ // actual file download is up to the implementer
	// console.log('__LINE__809 '+calling_element.id);
	window.alert("This is just a demo page.\nHow these links cause the actual file download is up to the implementer.");
}
// see MD doc for sources of the following functions
function download_table_as_csv(){
	let table_id = this.id.split('-')[0]+"-table";
	let separator = '\t';
	let csv = [];
	let rows = document.querySelectorAll("table#" + table_id + " tr");
	for(let r = 0; r < rows.length; r++){
		let row = [], cols = rows[r].querySelectorAll("td, th");
		for(let c = 0; c < cols.length; c++){
			let data = cols[c].innerText.replace(/(\r\n|\n|\r)/gm, "").replace(/(\s\s)/gm, " ");
			data = data.replace(/"/g, `""`);
			row.push(`"` + data + `"`);
		}
		csv.push(row.join(separator));
	}
	let csv_string = csv.join("\n");
	let ts = new Date().toJSON().replace(/\D/g,'');
	let filename = "FileDownloadPortal_"+table_id+"_"+ts+".csv";
	let link = document.createElement("a");
	link.style.display = "none";
	link.setAttribute("target", "_blank");
	link.setAttribute("href", "data:text/csv;charset=utf-8," + encodeURIComponent(csv_string));
	link.setAttribute("download", filename);
	document.body.appendChild(link); link.click(); document.body.removeChild(link);
}
function calculateCRC(data) {
    const polynomial = 0xEDB88320;
    let crc = 0xFFFFFFFF;
    for (let i = 0; i < data.length; i++) {
        crc ^= data.charCodeAt(i);
        for (let j = 0; j < 8; j++) {
            crc = (crc >>> 1) ^ (crc & 1 ? polynomial : 0);
        }
    }
    return crc ^ 0xFFFFFFFF;
}
function setCookie(cname, cvalue, exdays) {
	const d = new Date();
	d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
	let expires = "expires="+d.toUTCString();
	document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}
function getCookie(cname) {
	let name = cname + "=";
	let ca = document.cookie.split(';');
	for(let i = 0; i < ca.length; i++) {
		let c = ca[i];
		while (c.charAt(0) == ' ') {
			c = c.substring(1);
		}
		if (c.indexOf(name) == 0) {
			return c.substring(name.length, c.length);
		}
	}
	return "";
}
// FIN
