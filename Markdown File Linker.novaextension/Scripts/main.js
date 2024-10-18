exports.activate = function() {
	nova.commands.register("file-linker.insertLink", (workspace) => {
		insertFileLink(workspace, false);
	});

	nova.commands.register("file-linker.insertImageLink", (workspace) => {
		insertFileLink(workspace, true);
	});

	nova.commands.register("file-linker.wrapLink", async (editor) => {
		if (!editor) {
			console.error("No active editor");
			return;
		}

		const selectedRanges = editor.selectedRanges;
		
		if (selectedRanges.length === 0 || selectedRanges[0].empty) {
			return;
		}

		try {
			const clipboardContent = await nova.clipboard.readText();

			editor.edit((edit) => {
				let lastInsertionPoint = null;
				let pastedUri = false;
				for (const range of selectedRanges.reverse()) {
					const selectedText = editor.getTextInRange(range);
					
					let replacement = `[${selectedText}]()`;
					let cursorOffset = selectedText.length;
					
					if (clipboardContent && clipboardContent.trim()) {
						const trimmedContent = clipboardContent.trim();
						if (trimmedContent.startsWith('http://') || trimmedContent.startsWith('https://')) {
							pastedUri = true;
							const removeUriScheme = nova.config.get('file-linker.removeUriScheme')
							if (removeUriScheme === true) {
								const cleanedSelectedText = selectedText.replace(/^(https?:\/\/)/i, '');
								replacement = `[${cleanedSelectedText}](${trimmedContent})`;
							} else {
								replacement = `[${selectedText}](${trimmedContent})`;
							}
						}
					}
					
					edit.replace(range, replacement);
					lastInsertionPoint = range.start + cursorOffset;
				}
				
				// Set the cursor position after the edit is complete
				if (lastInsertionPoint !== null) {
					editor.selectedRange = new Range(lastInsertionPoint, lastInsertionPoint);
					editor.scrollToCursorPosition();
				}
			});
		} catch (error) {
			console.error("Error reading clipboard:", error);
		}
	});
}

function insertFileLink(workspace, isImage) {
	const editor = nova.workspace.activeTextEditor;
	
	if (!editor) {
		nova.workspace.showErrorMessage("No active text editor");
		return;
	}

	const rootFolderName = isImage ? 
		(nova.workspace.config.get("file-linker.imageFolderName", "string") || "images") :
		(nova.workspace.config.get("file-linker.postsFolderName", "string") || "_posts");
	
	const rootDir = findRootDirectory(nova.workspace.path, rootFolderName);
	if (!rootDir) {
		nova.workspace.showErrorMessage(`Could not find '${rootFolderName}' directory in the workspace`);
		return;
	}

	nova.workspace.showChoicePalette(
		getAllFiles(rootDir),
		{
			placeholder: isImage ? "Select an image to link" : "Select a file to link"
		},
		(selection) => {
			if (selection) {
				const relativePath = getRelativePath(selection, rootDir, isImage);
				const selectedText = editor.selectedText;
				
				let insertText;
				if (isImage) {
					insertText = `![${selectedText || 'IMG'}](${relativePath})`;
				} else {
					insertText = selectedText ? `[${selectedText}](${relativePath})` : relativePath;
				}
				
				editor.edit((edit) => {
					if (editor.selectedRange.length > 0) {
						edit.replace(editor.selectedRange, insertText);
					} else {
						edit.insert(editor.selectedRange.start, insertText);
					}
				});
			}
		}
	);
}

function findRootDirectory(startPath, rootFolderName) {
	const fs = nova.fs;
	const queue = [startPath];
	
	while (queue.length > 0) {
		const currentPath = queue.shift();
		const entries = fs.listdir(currentPath);
		
		for (const entry of entries) {
			const fullPath = nova.path.join(currentPath, entry);
			const stat = fs.stat(fullPath);
			
			if (stat.isDirectory()) {
				if (entry === rootFolderName) {
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

function getRelativePath(filePath, rootDir, isImage) {
	// Remove the workspace path prefix to get the path relative to the workspace root
	const workspacePath = nova.workspace.path;
	let relativePath = filePath.startsWith(workspacePath) ? filePath.substring(workspacePath.length) : filePath;
	
	// Ensure the path starts with a slash
	relativePath = relativePath.startsWith('/') ? relativePath : '/' + relativePath;
	
	if (isImage) {
		// For images, we just need to return the path as is (relative to workspace root)
		return relativePath;
	} else {
		// For posts, remove the _posts prefix if it exists
		const postsPrefix = '/_posts';
		if (relativePath.startsWith(postsPrefix)) {
			relativePath = relativePath.substring(postsPrefix.length);
		}
		
		// Get the user-defined regex pattern and replacement
		const pathRegexString = nova.workspace.config.get("file-linker.pathRegex", "string") || "^\\/?\\d{4}\\/(\\d{4})-(\\d{2})-(\\d{2})-(.+)$";
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
			const pathRegex = new RegExp(pathRegexString);
			const transformedPath = relativePath.replace(pathRegex, pathReplacement);
			
			// Ensure the path starts and ends with a slash
			return transformedPath.replace(/^\/?(.+?)\/?$/, "/$1/");
		} catch (error) {
			console.error("Error in path transformation:", error);
			// Fallback to the original path if transformation fails
			return relativePath;
		}
	}
}