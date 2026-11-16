// Code largely based on https://github.com/ajafff/tsutils
// Original license: https://github.com/ajafff/tsutils/blob/26b195358ec36d59f00333115aa3ffd9611ca78b/LICENSE

import * as ts from "typescript";

import { identifierToKeywordKind } from "./utils";

/**
 * Which "domain"(s) (most commonly, type or value space) a declaration is within.
 */
export enum DeclarationDomain {
	Namespace = 1,
	Type = 2,
	Value = 4,
	Any = Namespace | Type | Value,

	Import = 8,
}

/**
 * Metadata for how a declaration was declared and/or referenced.
 */
export interface DeclarationInfo {
	declaration: ts.PropertyName;
	domain: DeclarationDomain;
	exported: boolean;
}

export function getDeclarationDomain(
	node: ts.Identifier,
): DeclarationDomain | undefined {
	switch (node.parent.kind) {
		case ts.SyntaxKind.ClassDeclaration:
		case ts.SyntaxKind.ClassExpression:
			return DeclarationDomain.Type | DeclarationDomain.Value;
		case ts.SyntaxKind.EnumDeclaration:
			return DeclarationDomain.Any;
		case ts.SyntaxKind.FunctionDeclaration:
		case ts.SyntaxKind.FunctionExpression:
			return DeclarationDomain.Value;
		case ts.SyntaxKind.ImportClause:
			return (node.parent as ts.ImportClause).name === node
				? isImportClauseTypeOnly(node.parent as ts.ImportClause)
					? DeclarationDomain.Type | DeclarationDomain.Import
					: DeclarationDomain.Any | DeclarationDomain.Import
				: undefined;
		case ts.SyntaxKind.ImportEqualsDeclaration:
			return (node.parent as ts.ImportEqualsDeclaration).name === node
				? (node.parent as ts.ImportEqualsDeclaration).isTypeOnly
					? DeclarationDomain.Type | DeclarationDomain.Import
					: DeclarationDomain.Any | DeclarationDomain.Import
				: undefined;
		case ts.SyntaxKind.ImportSpecifier:
			return (node.parent as ts.ImportSpecifier).name === node
				? (node.parent as ts.ImportSpecifier).isTypeOnly ||
					isImportClauseTypeOnly(
						(node.parent as ts.ImportSpecifier).parent.parent,
					)
					? DeclarationDomain.Type | DeclarationDomain.Import
					: DeclarationDomain.Any | DeclarationDomain.Import
				: undefined;
		case ts.SyntaxKind.InterfaceDeclaration:
		case ts.SyntaxKind.TypeAliasDeclaration:
		case ts.SyntaxKind.TypeParameter:
			return DeclarationDomain.Type;

		case ts.SyntaxKind.ModuleDeclaration:
			return DeclarationDomain.Namespace;
		case ts.SyntaxKind.NamespaceImport:
			return (node.parent as ts.NamespaceImport).name === node
				? isImportClauseTypeOnly((node.parent as ts.NamespaceImport).parent)
					? DeclarationDomain.Type | DeclarationDomain.Import
					: DeclarationDomain.Any | DeclarationDomain.Import
				: undefined;
		case ts.SyntaxKind.Parameter:
			if (
				node.parent.parent.kind === ts.SyntaxKind.IndexSignature ||
				identifierToKeywordKind(node) === ts.SyntaxKind.ThisKeyword
			) {
				return;
			}
		// falls through
		case ts.SyntaxKind.BindingElement:
		case ts.SyntaxKind.VariableDeclaration:
			return (node.parent as ts.VariableLikeDeclaration).name === node
				? DeclarationDomain.Value
				: undefined;
	}
}

function isImportClauseTypeOnly(node: ts.ImportClause): boolean {
	return (
		node.phaseModifier === ts.SyntaxKind.TypeKeyword ||
		// eslint-disable-next-line @typescript-eslint/no-deprecated
		node.isTypeOnly
	);
}
