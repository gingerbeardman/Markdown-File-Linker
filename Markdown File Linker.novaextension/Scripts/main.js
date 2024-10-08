exports.activate = function() {
	nova.commands.register("file-linker.insertLink", (workspace) => {
		insertFileLink(workspace);
	});
}

function insertFileLink(workspace) {
	const editor = nova.workspace.activeTextEditor;
	
	if (!editor) {
		nova.workspace.showErrorMessage("No active text editor");
		return;
	}

	const postsFolderName = nova.workspace.config.get("file-linker.postsFolderName", "string") || "_posts";
	const postsDir = findPostsDirectory(nova.workspace.path, postsFolderName);
	if (!postsDir) {
		nova.workspace.showErrorMessage(`Could not find '${postsFolderName}' directory in the workspace`);
		return;
	}

	nova.workspace.showChoicePalette(
		getAllFiles(postsDir),
		{
			placeholder: "Select a file to link"
		},
		(selection) => {
			if (selection) {
				const relativePath = getRelativePath(selection, postsDir);
				const selectedText = editor.selectedText;
				
				if (selectedText) {
					// If there's selected text, wrap it in a Markdown link
					const markdownLink = `[${selectedText}](${relativePath})`;
					editor.edit((edit) => {
						edit.replace(editor.selectedRange, markdownLink);
					});
				} else {
					// If no text is selected, just insert the path
					editor.insert(relativePath);
				}
			}
		}
	);
}

function findPostsDirectory(startPath, postsFolderName) {
	const fs = nova.fs;
	const queue = [startPath];
	
	while (queue.length > 0) {
		const currentPath = queue.shift();
		const entries = fs.listdir(currentPath);
		
		for (const entry of entries) {
			const fullPath = nova.path.join(currentPath, entry);
			const stat = fs.stat(fullPath);
			
			if (stat.isDirectory()) {
				if (entry === postsFolderName) {
					return fullPath;
				}
				queue.push(fullPath);
			}
		}
	}
	
	return null;
}

function getAllFiles(dir) {
	const fs = nova.fs;
	let results = [];
	const list = fs.listdir(dir);
	
	for (let file of list) {
		file = nova.path.join(dir, file);
		const stat = fs.stat(file);
		
		if (stat.isDirectory()) {
			results = results.concat(getAllFiles(file));
		} else {
			results.push(file);
		}
	}
	
	return results;
}

function getRelativePath(filePath, postsDir) {
	// Remove the posts directory prefix from the file path
	let relativePath = filePath.substring(postsDir.length);
	
	// Get user-defined regex and replacement
	const pathRegex = nova.workspace.config.get("file-linker.pathRegex", "string") || "^/?(\\d{4})/(\\d{2})-(\\d{2})-(.+)$";
	const pathReplacement = nova.workspace.config.get("file-linker.pathReplacement", "string") || "/$1/$2/$3/$4/";
	
	// Get user-defined extensions to remove
	const extensionsString = nova.workspace.config.get("file-linker.extensionsToRemove", "string") || ".md,.markdown";
	const extensionsToRemove = extensionsString.split(',').map(ext => ext.trim());
	
	// Remove configured extensions
	for (const ext of extensionsToRemove) {
		if (relativePath.endsWith(ext)) {
			relativePath = relativePath.slice(0, -ext.length);
			break;  // Remove only one extension
		}
	}
	
	try {
		const regex = new RegExp(pathRegex);
		const transformedPath = relativePath.replace(regex, pathReplacement);
		
		// Ensure the path starts and ends with a slash
		return transformedPath.replace(/^\/?(.+?)\/?$/, "/$1/");
	} catch (error) {
		console.error("Error in regex transformation:", error);
		// Fallback to a simple transformation if regex fails
		return '/' + relativePath + '/';
	}
}