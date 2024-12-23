**Markdown File Linker** allows you to insert links to local files as Markdown, perfect for linking between articles in your blog!

## Usage

To run Markdown File Linker:

- Select the **Editor → Insert File Link** or **Insert Image Link** menu items; or
- Open the command palette and type `Insert File Link` or `Insert Image Link` 

You might also choose to set a keyboard shortcut using **Nova → Settings... → Key Bindings**, such as:

- `Cmd`+`Shift`+`L` to invoke `Insert File Link`
- `Cmd`+`Shift`+`I` to invoke `Insert Image Link`

## Results

You choose a local file using the file selector, such as:

- `_posts/2023/2023-11-21-yoyozo-how-i-made-a-playdate-game-in-39kb.md`

And it will be inserted as:

- `/2023/11/21/yoyozo-how-i-made-a-playdate-game-in-39kb/`

If you've selected some text before invoking the extension, you'll get:

- `[YOYOZO](/2023/11/21/yoyozo-how-i-made-a-playdate-game-in-39kb/)`

If the file is in a subfolder, such as:

- `_posts/reviews/2013-06-29-maboshi.md`

You'll get:

- `/2013/06/29/maboshi/`

For an image you might end up with:

- `![IMG](/images/posts/yoyozo-teaser.gif)`

## Configuration

To configure global preferences, open **Extensions → Extension Library...** then select Markdown File Linker's **Settings** tab.

You can customise the following:

- Posts Folder Name
	- default: `_posts`
- Images Folder Name
	- default: `images`
- Path Transformation Regex
	- default: `^\/?(?:.*?\/)?(?:\d{4}\/)?(?:(\d{4})-(\d{2})-(\d{2})-(.+))$`
- Path Replacement Pattern
	- default: `/$1/$2/$3/$4/`
- File Extension to Remove (comma separated)
	- default: `.md,.markdown`

Defaults match those used by Jekyll static site generator and other blogging software.

## Bonus!

The extension also includes a function to wrap the selected text in a Markdown link, and if there is a URL on the clipboard it will be used as the destination of the link.
