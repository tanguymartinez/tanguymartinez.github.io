# Panelboard module

The module is located at `web/modules/panel_board`. The two important files are `panel_board.module` and `js/generate-html.js`. The `panel_board_form_alter` method from the `panel_board.module` file attaches a custom library (which consists of `js/generate-html.js`) only when we are on a tab form. `js/generate-html.js` can the generate the HTML markup based on user input.