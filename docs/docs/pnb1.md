# Panelboards

That piece of documentation is about the panelboards (which you can access from the map or by manually entering the URL `[root]/panelboard/[TRIGRAM]`).

Here are the views I created so far:

* List instruments (`list_instruments`): entity reference to list instruments belonging to a station on a panelboard form
* List panel board tabs (`list_panel_board_tabs`): block listing the tabs on a panel board; entity reference to find tabs in the panel board form
* Panel Board (`panel_board`): the base page for the panel boards
* Panel Board Tab (`panel_board_tab`): individual tab blocks
* Panel Board Trigram Filter (`panel_board_trigram_filter`): used on the tab creation form to attach it to a panel board

## Structure


Here is the panel board mockup:

![panel board mockup](img/icos-atc.png)