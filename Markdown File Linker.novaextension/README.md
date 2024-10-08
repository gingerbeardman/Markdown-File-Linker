**Markdown File Linker** allows you to insert links to local files as Markdown links, perfect for linking between articles in your Jekyll blog!

## Usage

To run Markdown File Linker:

- Select the **Editor → Insert File Link** menu item; or
- Open the command palette and type `Insert File Link`

You might also choose to set a keyboard shortcut using **Nova → Settings... → Key Bindings**, such as having `Cmd`+`Shift`+`L` invoke the `Insert File Link` function.

## Results

You choose a local file, such as:
- `/Users/matt/Projects/blog/_posts/2023/2023-11-21-yoyozo-how-i-made-a-playdate-game-in-39kb.md`

And it will be inserted as:
- `/2023/11/21/yoyozo-how-i-made-a-playdate-game-in-39kb/`

If you've selected some text before invoking the extension, you'll get:
- `[YOYOZO](/2023/11/21/yoyozo-how-i-made-a-playdate-game-in-39kb/)`

### Configuration

To configure global preferences, open **Extensions → Extension Library...** then select Markdown File Linker's **Settings** tab.

You can customise the following:

- Root Folder Name
	- default: `_posts`
- Path Transformation Regex
	- default: `^/?(\d{4})/(\d{2})-(\d{2})-(.+)$`
- Path Replacement Pattern
	- default: `/$1/$2/$3/$4/`
- File Extension to Remove (comma separated)
	- default: `.md,.markdown`

Defaults match those used by Jekyll static site generator and other blogging software.
