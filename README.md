Personal-Search-Result-Blocker
==============================

A free safari extension which allows you to hide Google search results based on domain name. Also includes a basic ad blocker.

## Installation


### Developers

If you're interested in the source code, try this:

1. `git clone git@github.com:nubilus/Personal-Search-Result-Blocker.git Personal-Search-Result-Blocker.safariextension`
2. Open Safari Extension Builder (Safari>Developer>Extension Builder)
3. *Add Extension* and find the folder you just cloned
5. Install 

You need a free Safari Developer key to install the extension for distribution. Join the (free) [Safari Developer Program](https://developer.apple.com/programs/safari/) to create your certificate.


## Usage

### Hiding results

Google search results will show a *Hide <domain>* link. Click the link to hide the result. Results are hidden based on domain name.


### Unhiding results

To unhide your results:

1. Scroll to the bottom of the search results page
2. Click the message "Click this text to view or edit your blocked results"
3. Blocked results will appear in red with an *Show <domain>* option
4. Click the *Show <domain>* option


## Known issues

### Hiding results

The block option doesn't appear when using google autocomplete. If you visit http://www.google.com/ directly to conduct your search, you won't see the *Hide <domain>* option. To get around this, use the Safari search field for searching, rather than visiting Google directly.

Search results are merely hidden from your view, they aren't blocked server side; you may see fewer results than you expect when searching.

Some results are nested and I may not have accounted for the nesting because I didn't encounter that type of search result, or because Google changed the structure of their page HTML.


### Blocking ads

Ad-blocking options are basic and may not block all ads.

### General

When browsing the source you may see some local calls (127.0.0.1); I'm looking at adding a remote service and those calls are for local development/debugging.


## To Do

Things I'd like to add:

1. Remote service & storage for syncing hidden results
2. Option to dim results rather than hiding
3. Move hidden results to bottom when hidden