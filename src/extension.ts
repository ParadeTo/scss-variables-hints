/*
 * @Author: wangyunbo
 * @Date: 2021-05-19 23:57:46
 * @LastEditors: wangyunbo
 * @LastEditTime: 2021-05-20 17:19:15
 * @Description: file content
 * @FilePath: \css-variables-hints\src\extension.ts
 */
import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import * as css from 'css';
import * as strip from 'strip-comments';

import type { Rule, Declaration } from 'css';

const { CompletionItem, CompletionList } = vscode

export function activate(context: vscode.ExtensionContext) {
	const items: vscode.CompletionItem[] = [];
	const bareItems: vscode.CompletionItem[] = [];
	const workspaceFolder = vscode.workspace.workspaceFolders || [];
	const folderPath = workspaceFolder[0]?.uri.fsPath;

	// workspace not selected
	if (!vscode.workspace.workspaceFolders) {
		return;
	}

	const config = vscode.workspace.getConfiguration('cssVarriablesAutocomplete');
	const hasFilesInConfig = config && config.has('files');

	// no config or specified files
	if (!config || !hasFilesInConfig) {
		return;
	}

	const configFiles: Array<string> = config.get('files') || [];
	const configLanguageMods: Array<string> = config.get('languageModes') || [];

	configFiles.forEach((filePath) => {
		let file = fs.readFileSync(path.join(folderPath, filePath), { encoding: 'utf8' });
		file = strip(file);
		const cssParsed = css.parse(file);
		const rootRule: Rule | undefined = cssParsed.stylesheet?.rules.find((rule: Rule) => {
			const isRuleType = rule.type = 'rule';
			const rootSelectors = [':export', ':root'];
			const hasRootSelector = rule?.selectors?.some(selector => rootSelectors.includes(selector));

			return Boolean(isRuleType && hasRootSelector);
		});

		const declarations = rootRule?.declarations;
		const variables = declarations?.filter((declaration: Declaration) => {
			return Boolean(
				declaration.type === 'declaration' &&
				declaration?.property?.startsWith('--')
			);
		});

		variables?.forEach((variable: Declaration) => {
			// For use when the user has already typed `var(`
			const completionItemBare = new CompletionItem(variable.property!, vscode.CompletionItemKind.Variable);
			completionItemBare.detail = variable.value;
			completionItemBare.insertText = variable.property;
			bareItems.push(completionItemBare);

			const completionItem = new CompletionItem(variable.property!, vscode.CompletionItemKind.Variable);

			completionItem.detail = variable.value;
			completionItem.insertText = `var(${variable.property})`;
			completionItem.keepWhitespace = true;

			items.push(completionItem);
		});

	});

	let completionProvider = vscode.languages.registerCompletionItemProvider(
		configLanguageMods.length ? configLanguageMods : ['css', 'postcss', 'scss', 'less', 'vue'],
		{
			async provideCompletionItems(document, position) {
				const firstCharOfLinePosition = new vscode.Position(position.line, 0);
				const withIndentBeforeCursorText = document.getText(new vscode.Range(firstCharOfLinePosition, position)) || '';
				const beforeCursorText = withIndentBeforeCursorText.trim();
				if (!beforeCursorText.match(/--([\w-]*)/)) {
					return null;
				}

				let completionItems: vscode.CompletionItem[] = beforeCursorText.match(/var\(--([\w-]*)/) ? bareItems : items;
				let dashPosition = null;
				let dashPosition2 = null;
				let range: vscode.Range | null  = null;
				if(withIndentBeforeCursorText.endsWith('--')) {
					 dashPosition = new vscode.Position(position.line, withIndentBeforeCursorText.lastIndexOf('--'));
					 dashPosition2 = new vscode.Position(position.line, withIndentBeforeCursorText.lastIndexOf('--') + 2);
					range = new vscode.Range(dashPosition, dashPosition2);
				}
				console.log(range)
				completionItems = completionItems.map(item => {
					if(range === null || document.languageId !== 'vue') {
						return item
					} else {
						return {
							...item,
							additionalTextEdits: [vscode.TextEdit.delete(range)]
						}
					}
				})
				return new CompletionList(completionItems);
			},
		},
		'-', '-'
	);

	context.subscriptions.push(completionProvider);
}
