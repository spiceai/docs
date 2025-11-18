/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { translate } from '@docusaurus/Translate'

const translations = {
  button: {
    buttonText: translate({
      id: 'theme.SearchBar.label',
      message: 'Search',
      description: 'The ARIA label and placeholder for search button'
    }),
    buttonAriaLabel: translate({
      id: 'theme.SearchBar.label',
      message: 'Search',
      description: 'The ARIA label and placeholder for search button'
    })
  },
  placeholder: translate({
    id: 'theme.SearchBar.placeholder',
    message: 'Search docs',
    description: 'The placeholder for the search input'
  }),
  modal: {
    searchBox: {
      resetButtonTitle: translate({
        id: 'theme.SearchModal.searchBox.resetButtonTitle',
        message: 'Clear the query',
        description: 'The label and ARIA label for search box reset button'
      }),
      resetButtonAriaLabel: translate({
        id: 'theme.SearchModal.searchBox.resetButtonTitle',
        message: 'Clear the query',
        description: 'The label and ARIA label for search box reset button'
      }),
      cancelButtonText: translate({
        id: 'theme.SearchModal.searchBox.cancelButtonText',
        message: 'Cancel',
        description: 'The label and ARIA label for search box cancel button'
      }),
      cancelButtonAriaLabel: translate({
        id: 'theme.SearchModal.searchBox.cancelButtonText',
        message: 'Cancel',
        description: 'The label and ARIA label for search box cancel button'
      })
    },
    startScreen: {
      recentSearchesTitle: translate({
        id: 'theme.SearchModal.startScreen.recentSearchesTitle',
        message: 'Recent',
        description: 'The title for recent searches'
      }),
      noRecentSearchesText: translate({
        id: 'theme.SearchModal.startScreen.noRecentSearchesText',
        message: 'No recent searches',
        description: 'The text when no recent searches'
      }),
      saveRecentSearchButtonTitle: translate({
        id: 'theme.SearchModal.startScreen.saveRecentSearchButtonTitle',
        message: 'Save this search',
        description: 'The label for save recent search button'
      }),
      removeRecentSearchButtonTitle: translate({
        id: 'theme.SearchModal.startScreen.removeRecentSearchButtonTitle',
        message: 'Remove this search from history',
        description: 'The label for remove recent search button'
      }),
      favoriteSearchesTitle: translate({
        id: 'theme.SearchModal.startScreen.favoriteSearchesTitle',
        message: 'Favorite',
        description: 'The title for favorite searches'
      }),
      removeFavoriteSearchButtonTitle: translate({
        id: 'theme.SearchModal.startScreen.removeFavoriteSearchButtonTitle',
        message: 'Remove this search from favorites',
        description: 'The label for remove favorite search button'
      })
    },
    errorScreen: {
      titleText: translate({
        id: 'theme.SearchModal.errorScreen.titleText',
        message: 'Unable to fetch results',
        description: 'The title for error screen of search modal'
      }),
      helpText: translate({
        id: 'theme.SearchModal.errorScreen.helpText',
        message: 'You might want to check your network connection.',
        description: 'The help text for error screen of search modal'
      })
    },
    footer: {
      selectText: translate({
        id: 'theme.SearchModal.footer.selectText',
        message: 'to select',
        description: 'The select text in search modal footer'
      }),
      navigateText: translate({
        id: 'theme.SearchModal.footer.navigateText',
        message: 'to navigate',
        description: 'The navigate text in search modal footer'
      }),
      closeText: translate({
        id: 'theme.SearchModal.footer.closeText',
        message: 'to close',
        description: 'The close text in search modal footer'
      }),
      searchByText: translate({
        id: 'theme.SearchModal.footer.searchByText',
        message: 'Search by',
        description: 'The search by text in search modal footer'
      })
    },
    noResultsScreen: {
      noResultsText: translate({
        id: 'theme.SearchModal.noResultsScreen.noResultsText',
        message: 'No results for',
        description: 'The no results text in search modal'
      }),
      suggestedQueryText: translate({
        id: 'theme.SearchModal.noResultsScreen.suggestedQueryText',
        message: 'Try searching for',
        description: 'The suggested query text in search modal'
      }),
      reportMissingResultsText: translate({
        id: 'theme.SearchModal.noResultsScreen.reportMissingResultsText',
        message: 'Believe this query should return results?',
        description: 'The text for report missing results in search modal'
      }),
      reportMissingResultsLinkText: translate({
        id: 'theme.SearchModal.noResultsScreen.reportMissingResultsLinkText',
        message: 'Let us know.',
        description: 'The link text for report missing results in search modal'
      })
    }
  }
}

export default translations
