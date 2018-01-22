var gfArchive = {};

(function () {

	gfArchive.search = {
		searchContainer: '.global-search', //make this modular if we employ different searches.
		searchInputContainer: '.global-search .search',
		searchTermInput: '.global-search #search-term',
		resultsContainer: '.global-search #search-results',
		isSearchingClass: 'is-searching',
		hasResultsClass: 'has-results',
		hasSearchTermClass: 'has-search-term',
		idx: lunr(function () {
		  this.ref('id'); 	//used as key, not for search
		  this.field('title', {boost: 10});
		  this.field('labels', {boost: 5});
		  this.field('content');
		  this.field('categories');
		}),
		data: [],
		renderResults: function (resultRefs) {
			this.renderEmptyResults();

			//target
			var $resultsContainer = $(this.resultsContainer)

			var thisData = this.data
			//for each result ref key, grab data point and render
			$.each(resultRefs, function (index, dataKey) {
				var dataResult = thisData[dataKey];

				var content = dataResult.content.replace(/<[^>]*>/g, ' ') //removes html chars from content
				if (content.length > 200 ) //arbitrary cut content to 50 chars (design pending)
					content = content.substring(0, 199) + '...'

				var categories = dataResult.categories.map(function(category) {
					return '<div>' + category + '</div>';
				});

				$resultsContainer.append($('<div class="search-result">')
					.append($('<a class="result-title">')
						.text(dataResult.title)
						.attr('href', dataResult.url)
					)
					.append($('<p>')
						.text(content)
					)
					.append($('<div class="search-categories">').append(categories))
				)
			})
		},
		renderHasSearchTerm: function () {
			//target for hasSearchTerm class
			var $target = $(this.searchContainer)

			var $searchTermInput = $(this.searchTermInput)
			var hasSearchTermClass = this.hasSearchTermClass

			//add 'has-search-term'
			if ( !$searchTermInput.val().length ) {
				// $target.removeClass(hasSearchTermClass)
				$target.removeClass('has-results has-search-term');
				return false
			}
			$target.addClass(hasSearchTermClass)
			return true
		},
		renderHasResults: function (resultCount) {
			//target for hasResults class
			var $target = $(this.searchContainer)
			var hasResultsClass = this.hasResultsClass

			if (!resultCount) {
				//no results
				$target.removeClass(hasResultsClass)
				return false;
			}
			$target.addClass(hasResultsClass)
			return true;
		},
		renderIsSearching: function (isSearching) {
			//target for isSearching class
			var $target = $(this.searchContainer)
			var isSearchingClass = this.isSearchingClass

			if (isSearching) {
				$target.addClass(isSearchingClass)
			}
			else {
				$target.removeClass(isSearchingClass)
				this.renderEmptyResults()
				this.emptySearchInput()
			}
		},
		renderEmptyResults: function () {
			$(this.resultsContainer).html('')
		},
		emptySearchInput: function () {
			$(this.searchTermInput).val('');
		}
	};

	// Wait for the data to load and add it to lunr
	$.getJSON('/search_data.json').then(function(loaded_data){
		gfArchive.search.data = loaded_data;
	  	$.each(loaded_data, function(index, value){
	    	gfArchive.search.idx.add(
	     		$.extend({ "id": index }, value)
	    	);
	  	});
	});
})();

$(document).ready(function () {

	// Bind search on keyup
	$(gfArchive.search.searchTermInput)

		.keyup( function () {

			//if no search term remains, empty any previous results
			if (!gfArchive.search.renderHasSearchTerm()) {
				return gfArchive.search.renderEmptyResults();
			}

			//perform search
			var searchTerm = $(this).val();
			var results = gfArchive.search.idx.search(searchTerm).map(function (result) {
				return result.ref
			});

			//if no results: empty any previous results
			if (!gfArchive.search.renderHasResults(results.length)) {
				// $(this.searchContainer).removeClass('has-results');
				return gfArchive.search.renderEmptyResults();
			}

			//render non-empty results
			gfArchive.search.renderResults(results);
		})

		// .focus( function () {
		// 	gfArchive.search.renderIsSearching(true)
		// })

		// .blur( function () {
		// 	gfArchive.search.renderIsSearching(false)
		// })



})