// Code largely based on https://github.com/ajafff/tsutils
// Original license: https://github.com/ajafff/tsutils/blob/26b195358ec36d59f00333115aa3ffd9611ca78b/LICENSE

import * as ts from "typescript";

import type { UsageInfo, UsageInfoCallback } from "./usage";

import { includesModifier } from "../modifiers";
import { DeclarationDomain, getDeclarationDomain } from "./declarations";
import { getPropertyName } from "./getPropertyName";
import { getUsageDomain } from "./getUsageDomain";
import {
	isBlockScopeBoundary,
	type Scope,
	ScopeBoundary,
	ScopeBoundarySelector,
} from "./Scope";
import {
	BlockScope,
	ClassExpressionScope,
	ConditionalTypeScope,
	ConditionalTypeScopeState,
	FunctionExpressionScope,
	FunctionScope,
	NonRootScope,
	RootScope,
} from "./scopes";
import { identifierToKeywordKind } from "./utils";

// TODO class decorators resolve outside of class, element and parameter decorator resolve inside/at the class
// TODO computed property name resolves inside/at the class
// TODO this and super in all of them are resolved outside of the class
export class UsageWalker {
	#result = new Map<ts.Identifier, UsageInfo>();
	#scope!: Scope;

	getUsage(sourceFile: ts.SourceFile): Map<ts.Identifier, UsageInfo> {
		const variableCallback = (variable: UsageInfo, key: ts.Identifier) => {
			this.#result.set(key, variable);
		};

		const isModule = ts.isExternalModule(sourceFile);
		this.#scope = new RootScope(
			sourceFile.isDeclarationFile &&
				isModule &&
				!containsExportStatement(sourceFile),
			!isModule,
		);
		const cb = (node: ts.Node): void => {
			if (isBlockScopeBoundary(node)) {
				return continueWithScope(
					node,
					new BlockScope(this.#scope.getFunctionScope(), this.#scope),
					handleBlockScope,
				);
			}

			switch (node.kind) {
				case ts.SyntaxKind.ArrowFunction:
				case ts.SyntaxKind.CallSignature:
				case ts.SyntaxKind.Constructor:
				case ts.SyntaxKind.ConstructorType:
				case ts.SyntaxKind.ConstructSignature:
				case ts.SyntaxKind.FunctionDeclaration:
				case ts.SyntaxKind.FunctionExpression:
				case ts.SyntaxKind.FunctionType:
				case ts.SyntaxKind.GetAccessor:
				case ts.SyntaxKind.MethodDeclaration:
				case ts.SyntaxKind.MethodSignature:
				case ts.SyntaxKind.SetAccessor:
					return this.#handleFunctionLikeDeclaration(
						node as ts.FunctionLikeDeclaration,
						cb,
						variableCallback,
					);
				case ts.SyntaxKind.ClassDeclaration:
					this.#handleDeclaration(
						node as ts.ClassDeclaration,
						true,
						DeclarationDomain.Value | DeclarationDomain.Type,
					);
					return continueWithScope(
						node,
						new NonRootScope(this.#scope, ScopeBoundary.Function),
					);
				case ts.SyntaxKind.ClassExpression:
					return continueWithScope(
						node,
						(node as ts.ClassExpression).name !== undefined
							? new ClassExpressionScope(
									(node as ts.ClassExpression).name!,
									this.#scope,
								)
							: new NonRootScope(this.#scope, ScopeBoundary.Function),
					);
				case ts.SyntaxKind.ConditionalType:
					return this.#handleConditionalType(
						node as ts.ConditionalTypeNode,
						cb,
						variableCallback,
					);
				case ts.SyntaxKind.EnumDeclaration:
					this.#handleDeclaration(
						node as ts.EnumDeclaration,
						true,
						DeclarationDomain.Any,
					);
					return continueWithScope(
						node,
						this.#scope.createOrReuseEnumScope(
							(node as ts.EnumDeclaration).name.text,
							includesModifier(
								(node as ts.HasModifiers).modifiers,
								ts.SyntaxKind.ExportKeyword,
							),
						),
					);
				case ts.SyntaxKind.EnumMember:
					this.#scope.addVariable(
						getPropertyName((node as ts.EnumMember).name)!,
						(node as ts.EnumMember).name,
						ScopeBoundarySelector.Function,
						true,
						DeclarationDomain.Value,
					);
					break;
				case ts.SyntaxKind.ExportAssignment:
					if (
						(node as ts.ExportAssignment).expression.kind ===
						ts.SyntaxKind.Identifier
					) {
						return this.#scope.markExported(
							(node as ts.ExportAssignment).expression as ts.Identifier,
						);
					}

					break;
				case ts.SyntaxKind.ExportSpecifier:
					if ((node as ts.ExportSpecifier).propertyName !== undefined) {
						return this.#scope.markExported(
							(node as ts.ExportSpecifier).propertyName!,
							(node as ts.ExportSpecifier).name,
						);
					}

					return this.#scope.markExported((node as ts.ExportSpecifier).name);
				case ts.SyntaxKind.Identifier: {
					const domain = getUsageDomain(node as ts.Identifier);
					if (domain !== undefined) {
						this.#scope.addUse({ domain, location: node as ts.Identifier });
					}

					return;
				}
				case ts.SyntaxKind.ImportClause:
				case ts.SyntaxKind.ImportEqualsDeclaration:
				case ts.SyntaxKind.ImportSpecifier:
				case ts.SyntaxKind.NamespaceImport: {
					const name = (node as ts.NamedDeclaration).name;
					this.#handleDeclaration(
						node as ts.NamedDeclaration,
						false,
						name !== undefined && ts.isIdentifier(name)
							? (getDeclarationDomain(name) ??
									DeclarationDomain.Any | DeclarationDomain.Import)
							: DeclarationDomain.Any | DeclarationDomain.Import,
					);
					break;
				}
				case ts.SyntaxKind.InterfaceDeclaration:
				case ts.SyntaxKind.TypeAliasDeclaration:
					this.#handleDeclaration(
						node as ts.InterfaceDeclaration | ts.TypeAliasDeclaration,
						true,
						DeclarationDomain.Type,
					);
					return continueWithScope(
						node,
						new NonRootScope(this.#scope, ScopeBoundary.Type),
					);
				case ts.SyntaxKind.MappedType:
					return continueWithScope(
						node,
						new NonRootScope(this.#scope, ScopeBoundary.Type),
					);
				case ts.SyntaxKind.ModuleDeclaration:
					return this.#handleModule(
						node as ts.ModuleDeclaration,
						continueWithScope,
					);
				case ts.SyntaxKind.Parameter:
					if (
						node.parent.kind !== ts.SyntaxKind.IndexSignature &&
						((node as ts.ParameterDeclaration).name.kind !==
							ts.SyntaxKind.Identifier ||
							identifierToKeywordKind(
								(node as ts.NamedDeclaration).name as ts.Identifier,
							) !== ts.SyntaxKind.ThisKeyword)
					) {
						this.#handleBindingName(
							(node as ts.NamedDeclaration).name as ts.Identifier,
							false,
							false,
						);
					}

					break;
				case ts.SyntaxKind.TypeParameter:
					this.#scope.addVariable(
						(node as ts.TypeParameterDeclaration).name.text,
						(node as ts.TypeParameterDeclaration).name,
						node.parent.kind === ts.SyntaxKind.InferType
							? ScopeBoundarySelector.InferType
							: ScopeBoundarySelector.Type,
						false,
						DeclarationDomain.Type,
					);
					break;
				// End of Scope specific handling
				case ts.SyntaxKind.VariableDeclarationList:
					this.#handleVariableDeclaration(node as ts.VariableDeclarationList);
					break;
			}

			return ts.forEachChild(node, cb);
		};

		const continueWithScope = <T extends ts.Node>(
			node: T,
			scope: Scope,
			next: (node: T) => void = forEachChild,
		) => {
			const savedScope = this.#scope;
			this.#scope = scope;
			next(node);
			this.#scope.end(variableCallback);
			this.#scope = savedScope;
		};

		const handleBlockScope = (node: ts.Node) => {
			if (
				node.kind === ts.SyntaxKind.CatchClause &&
				(node as ts.CatchClause).variableDeclaration !== undefined
			) {
				this.#handleBindingName(
					(node as ts.CatchClause).variableDeclaration!.name,
					true,
					false,
				);
			}

			return ts.forEachChild(node, cb);
		};

		ts.forEachChild(sourceFile, cb);
		this.#scope.end(variableCallback);
		return this.#result;

		function forEachChild(node: ts.Node) {
			return ts.forEachChild(node, cb);
		}
	}

	#handleBindingName(
		name: ts.BindingName,
		blockScoped: boolean,
		exported: boolean,
	) {
		if (name.kind === ts.SyntaxKind.Identifier) {
			return this.#scope.addVariable(
				name.text,
				name,
				blockScoped
					? ScopeBoundarySelector.Block
					: ScopeBoundarySelector.Function,
				exported,
				DeclarationDomain.Value,
			);
		}

		forEachDestructuringIdentifier(name, (declaration) => {
			this.#scope.addVariable(
				declaration.name.text,
				declaration.name,
				blockScoped
					? ScopeBoundarySelector.Block
					: ScopeBoundarySelector.Function,
				exported,
				DeclarationDomain.Value,
			);
		});
	}

	#handleConditionalType(
		node: ts.ConditionalTypeNode,
		cb: (node: ts.Node) => void,
		varCb: UsageInfoCallback,
	) {
		const savedScope = this.#scope;
		const scope = (this.#scope = new ConditionalTypeScope(savedScope));
		cb(node.checkType);
		scope.updateState(ConditionalTypeScopeState.Extends);
		cb(node.extendsType);
		scope.updateState(ConditionalTypeScopeState.TrueType);
		cb(node.trueType);
		scope.updateState(ConditionalTypeScopeState.FalseType);
		cb(node.falseType);
		scope.end(varCb);
		this.#scope = savedScope;
	}

	#handleDeclaration(
		node: ts.NamedDeclaration,
		blockScoped: boolean,
		domain: DeclarationDomain,
	) {
		if (node.name !== undefined) {
			this.#scope.addVariable(
				(node.name as ts.Identifier).text,
				node.name as ts.Identifier,
				blockScoped
					? ScopeBoundarySelector.Block
					: ScopeBoundarySelector.Function,
				includesModifier(
					(node as ts.HasModifiers).modifiers,
					ts.SyntaxKind.ExportKeyword,
				),
				domain,
			);
		}
	}

	#handleFunctionLikeDeclaration(
		node: ts.FunctionLikeDeclaration,
		cb: (node: ts.Node) => void,
		varCb: UsageInfoCallback,
	) {
		if (ts.canHaveDecorators(node)) {
			ts.getDecorators(node)?.forEach(cb);
		}

		const savedScope = this.#scope;
		if (node.kind === ts.SyntaxKind.FunctionDeclaration) {
			this.#handleDeclaration(node, false, DeclarationDomain.Value);
		}

		const scope = (this.#scope =
			node.kind === ts.SyntaxKind.FunctionExpression && node.name !== undefined
				? new FunctionExpressionScope(node.name, savedScope)
				: new FunctionScope(savedScope));
		if (node.name !== undefined) {
			cb(node.name);
		}

		if (node.typeParameters !== undefined) {
			node.typeParameters.forEach(cb);
		}

		node.parameters.forEach(cb);
		if (node.type !== undefined) {
			cb(node.type);
		}

		if (node.body !== undefined) {
			scope.beginBody();
			cb(node.body);
		}

		scope.end(varCb);
		this.#scope = savedScope;
	}

	#handleModule(
		node: ts.ModuleDeclaration,
		next: (node: ts.Node, scope: Scope) => void,
	) {
		if (node.flags & ts.NodeFlags.GlobalAugmentation) {
			return next(
				node,
				this.#scope.createOrReuseNamespaceScope("-global", false, true, false),
			);
		}

		if (node.name.kind === ts.SyntaxKind.Identifier) {
			const exported = isNamespaceExported(node as ts.NamespaceDeclaration);
			this.#scope.addVariable(
				node.name.text,
				node.name,
				ScopeBoundarySelector.Function,
				exported,
				DeclarationDomain.Namespace | DeclarationDomain.Value,
			);
			const ambient = includesModifier(
				node.modifiers,
				ts.SyntaxKind.DeclareKeyword,
			);
			return next(
				node,
				this.#scope.createOrReuseNamespaceScope(
					node.name.text,
					exported,
					ambient,
					ambient && namespaceHasExportStatement(node),
				),
			);
		}

		return next(
			node,
			this.#scope.createOrReuseNamespaceScope(
				`"${node.name.text}"`,
				false,
				true,
				namespaceHasExportStatement(node),
			),
		);
	}

	#handleVariableDeclaration(declarationList: ts.VariableDeclarationList) {
		const blockScoped = isBlockScopedVariableDeclarationList(declarationList);
		const exported =
			declarationList.parent.kind === ts.SyntaxKind.VariableStatement &&
			includesModifier(
				declarationList.parent.modifiers,
				ts.SyntaxKind.ExportKeyword,
			);
		for (const declaration of declarationList.declarations) {
			this.#handleBindingName(declaration.name, blockScoped, exported);
		}
	}
}

function containsExportStatement(block: ts.BlockLike): boolean {
	for (const statement of block.statements) {
		if (
			statement.kind === ts.SyntaxKind.ExportDeclaration ||
			statement.kind === ts.SyntaxKind.ExportAssignment
		) {
			return true;
		}
	}

	return false;
}

function forEachDestructuringIdentifier<T>(
	pattern: ts.BindingPattern,
	fn: (element: ts.BindingElement & { name: ts.Identifier }) => T,
): T | undefined {
	for (const element of pattern.elements) {
		if (element.kind !== ts.SyntaxKind.BindingElement) {
			continue;
		}

		let result: T | undefined;
		if (element.name.kind === ts.SyntaxKind.Identifier) {
			result = fn(element as ts.BindingElement & { name: ts.Identifier });
		} else {
			result = forEachDestructuringIdentifier(element.name, fn);
		}

		if (result) {
			return result;
		}
	}
}

function isBlockScopedVariableDeclarationList(
	declarationList: ts.VariableDeclarationList,
): boolean {
	return (declarationList.flags & ts.NodeFlags.BlockScoped) !== 0;
}

function isNamespaceExported(node: ts.NamespaceDeclaration) {
	return (
		node.parent.kind === ts.SyntaxKind.ModuleDeclaration ||
		includesModifier(node.modifiers, ts.SyntaxKind.ExportKeyword)
	);
}

function namespaceHasExportStatement(ns: ts.ModuleDeclaration): boolean {
	if (ns.body?.kind !== ts.SyntaxKind.ModuleBlock) {
		return false;
	}

	return containsExportStatement(ns.body);
}
