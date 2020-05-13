# Panelboards

That piece of documentation is about the panelboards (which you can access from the map or by manually entering the URL `[root]/panelboard/[TRIGRAM]`).

Here are the views I created so far:
* List instruments (list_instruments): entity reference to list instruments belonging to a station on a panelboard form
* List panel board tabs (list_panel_board_tabs): block listing the tabs on a panel board; entity reference to find tabs in the panel board form
* Panel Board (panel_board): the base page for the panel boards
* Panel Board Tab (panel_board_tab): individual tab blocks
* Panel Board Trigram Filter (panel_board_trigram_filter): used on the tab creation form to attach it to a panel board

## Structure

Here is how blocks and pages are arranged for a panelboard. First, an existing page is required to be able to display blocks on a page: it is the role of the panel_board view. Then come blocks restricted to specific URLs. We can see them on the block layout page accessible from the structure menu. The top-most block we added is called "List panel board tabs", which as you may have guessed is the one listed above. Since it is the submenu for a panelboard, it must be displayed before the tabs' content. Next are the tabs themselves named "Panel Board Tab: Block \[xyz\]". Each of these represents one tab.